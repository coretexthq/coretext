const express = require('express');
const path = require('path');
const { getConnection, queryAll, queryGet, queryRun } = require('./backend/db');
const { seed } = require('./backend/seed');
const { calculateQuote, parseSearchParams, checkListingAvailability } = require('./backend/renterHelper');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());

// Auth middleware for protected API routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['x-trore-auth'];
  if (authHeader !== 'v3-4-case-study') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid X-Trore-Auth header'
    });
  }
  next();
};

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Public API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Apply auth middleware to all routes under /api/protected
app.use('/api/protected', authMiddleware);

// Protected test API routes
app.get('/api/protected/listings', async (req, res) => {
  try {
    const listings = await queryAll('SELECT * FROM listings');
    // Parse amenities from JSON string if stored as JSON
    const processed = listings.map(l => ({
      ...l,
      amenities: JSON.parse(l.amenities)
    }));
    res.json(processed);
  } catch (err) {
    console.error('Error fetching listings:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/api/protected/hosts', async (req, res) => {
  try {
    const hosts = await queryAll('SELECT * FROM hosts');
    res.json(hosts);
  } catch (err) {
    console.error('Error fetching hosts:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/api/protected/renters', async (req, res) => {
  try {
    const renters = await queryAll('SELECT * FROM renters');
    res.json(renters);
  } catch (err) {
    console.error('Error fetching renters:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/api/protected/audit-logs', async (req, res) => {
  try {
    const logs = await queryAll('SELECT * FROM audit_records ORDER BY timestamp DESC');
    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.post('/api/protected/reset-db', async (req, res) => {
  try {
    await seed();
    res.json({ success: true, message: 'Database reset and seeded successfully!' });
  } catch (err) {
    console.error('Error resetting database:', err.message);
    res.status(500).json({ error: 'Database reset failed', details: err.message });
  }
});

// --- RENTER WORKFLOW ENDPOINTS ---

// 1. Search, filter, and sort listings with pagination
app.get('/api/listings/search', authMiddleware, async (req, res) => {
  try {
    const rawParams = req.query;
    const params = parseSearchParams(rawParams);
    
    let sql = `SELECT * FROM listings WHERE is_active = 1`;
    const sqlParams = [];
    
    // Text search
    if (params.q) {
      sql += ` AND (title LIKE ? OR description LIKE ?)`;
      sqlParams.push(`%${params.q}%`, `%${params.q}%`);
    }
    
    // District filter
    if (params.district) {
      sql += ` AND district = ?`;
      sqlParams.push(params.district);
    }
    
    // Price range
    if (params.min_price !== undefined) {
      sql += ` AND nightly_price >= ?`;
      sqlParams.push(params.min_price);
    }
    if (params.max_price !== undefined) {
      sql += ` AND nightly_price <= ?`;
      sqlParams.push(params.max_price);
    }
    
    // Bedrooms
    if (params.bedrooms !== undefined) {
      sql += ` AND bedrooms >= ?`;
      sqlParams.push(params.bedrooms);
    }
    
    // Amenities filter (must match all selected amenities)
    if (params.amenities && params.amenities.length > 0) {
      for (const amenity of params.amenities) {
        sql += ` AND amenities LIKE ?`;
        sqlParams.push(`%${amenity}%`);
      }
    }
    
    // Date range availability filter
    if (params.start_date && params.end_date) {
      sql += ` AND id NOT IN (
        SELECT DISTINCT listing_id FROM availability_blocks
        WHERE start_date < ? AND end_date > ?
      )`;
      sqlParams.push(params.end_date, params.start_date);
    }
    
    // Sort logic
    let orderBy = 'id DESC';
    const sortParams = [];
    if (params.sort === 'price') {
      orderBy = 'nightly_price ASC';
    } else if (params.sort === 'rating') {
      orderBy = 'rating DESC';
    } else if (params.sort === 'newest') {
      orderBy = 'id DESC';
    } else if (params.sort === 'relevance' && params.q) {
      orderBy = `CASE WHEN title LIKE ? THEN 1 ELSE 2 END, id DESC`;
      sortParams.push(`%${params.q}%`);
    }
    
    // Count total results before paginating (use sqlParams only)
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
    const countRow = await queryGet(countSql, sqlParams);
    const totalResults = countRow ? countRow.total : 0;
    
    // Add sorting and pagination to SQL
    sql += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const offset = (params.page - 1) * params.limit;
    
    const finalParams = [...sqlParams, ...sortParams, params.limit, offset];
    
    const listings = await queryAll(sql, finalParams);
    
    // Process amenities from JSON string to array
    const processed = listings.map(l => ({
      ...l,
      amenities: JSON.parse(l.amenities)
    }));
    
    res.json({
      listings: processed,
      pagination: {
        total: totalResults,
        page: params.page,
        limit: params.limit,
        pages: Math.ceil(totalResults / params.limit)
      }
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Database search failed', details: err.message });
  }
});

// 2. Retrieve detailed listing information with blackout/booked date ranges
app.get('/api/listings/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await queryGet(
      `SELECT l.*, h.name as host_name 
       FROM listings l 
       JOIN hosts h ON l.host_id = h.id 
       WHERE l.id = ?`,
      [id]
    );
    
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found' });
    }
    
    // Parse amenities JSON
    listing.amenities = JSON.parse(listing.amenities);
    
    // Fetch availability blocks (including block ID)
    const blocks = await queryAll(
      `SELECT id, start_date, end_date, type 
       FROM availability_blocks 
       WHERE listing_id = ? 
       ORDER BY start_date ASC`,
      [id]
    );
    
    listing.availability = blocks;
    
    res.json(listing);
  } catch (err) {
    console.error('Error fetching listing details:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 3. List saved searches
app.get('/api/saved-searches', authMiddleware, async (req, res) => {
  try {
    const renterId = parseInt(req.query.renter_id || 1, 10);
    const searches = await queryAll(
      `SELECT * FROM saved_searches WHERE renter_id = ? ORDER BY created_at DESC`,
      [renterId]
    );
    
    const processed = searches.map(s => ({
      ...s,
      query_params: JSON.parse(s.query_params)
    }));
    
    res.json(processed);
  } catch (err) {
    console.error('Error fetching saved searches:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 4. Save a search query configuration
app.post('/api/saved-searches', authMiddleware, async (req, res) => {
  try {
    const { renter_id, name, query_params } = req.body;
    const rId = parseInt(renter_id || 1, 10);
    
    if (!query_params) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing query_params' });
    }
    
    // Fetch renter's name for audit log
    const renter = await queryGet('SELECT name FROM renters WHERE id = ?', [rId]);
    if (!renter) {
      return res.status(404).json({ error: 'Not Found', message: 'Renter not found' });
    }
    
    const serializedParams = typeof query_params === 'string' 
      ? query_params 
      : JSON.stringify(query_params);
    
    const searchName = name || `Search - ${new Date().toLocaleDateString()}`;
    
    // Save to DB
    const insertRes = await queryRun(
      `INSERT INTO saved_searches (renter_id, name, query_params) VALUES (?, ?, ?)`,
      [rId, searchName, serializedParams]
    );
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'renter', ?, 'create_saved_search', 'saved_search', ?, ?)`,
      [
        rId, 
        renter.name, 
        insertRes.lastID, 
        `Saved search query "${searchName}"`
      ]
    );
    
    res.status(201).json({
      id: insertRes.lastID,
      renter_id: rId,
      name: searchName,
      query_params: JSON.parse(serializedParams)
    });
  } catch (err) {
    console.error('Error saving search:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 5. Submit booking request
app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const { listing_id, renter_id, start_date, end_date, guest_name, guest_email } = req.body;
    const rId = parseInt(renter_id || 1, 10);
    
    if (!listing_id || !start_date || !end_date || !guest_name || !guest_email) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Missing required booking fields (listing_id, start_date, end_date, guest_name, guest_email)' 
      });
    }
    
    // Fetch listing and check if active
    const listing = await queryGet('SELECT * FROM listings WHERE id = ?', [listing_id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found' });
    }
    
    // Validate availability using centralized helper (including is_active check)
    const avail = await checkListingAvailability(listing_id, start_date, end_date, true);
    if (!avail.available) {
      return res.status(400).json({ error: avail.errorType, message: avail.message });
    }
    
    // Validate date range and calculate quote
    const quote = calculateQuote(listing.nightly_price, start_date, end_date);
    if (quote.error) {
      return res.status(400).json({ error: 'Invalid Dates', message: quote.error });
    }
    
    // Fetch renter name
    const renter = await queryGet('SELECT name FROM renters WHERE id = ?', [rId]);
    if (!renter) {
      return res.status(404).json({ error: 'Not Found', message: 'Renter not found' });
    }
    
    // Create booking request
    const insertRes = await queryRun(
      `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [listing_id, rId, start_date, end_date, quote.totalPrice, guest_name, guest_email]
    );
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'renter', ?, 'create_booking', 'booking', ?, ?)`,
      [
        rId, 
        renter.name, 
        insertRes.lastID, 
        `Created booking request for listing ${listing_id} (${start_date} to ${end_date}) for total $${quote.totalPrice}`
      ]
    );
    
    res.status(201).json({
      id: insertRes.lastID,
      listing_id,
      renter_id: rId,
      start_date,
      end_date,
      total_price: quote.totalPrice,
      status: 'pending',
      guest_name,
      guest_email
    });
  } catch (err) {
    console.error('Error creating booking request:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// --- HOST WORKFLOW ENDPOINTS ---

// 1. Retrieve listings owned by the host
app.get('/api/host/listings', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'] || req.query.host_id, 10);
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    const listings = await queryAll('SELECT * FROM listings WHERE host_id = ? ORDER BY id DESC', [hostId]);
    const processed = listings.map(l => ({
      ...l,
      amenities: JSON.parse(l.amenities)
    }));
    res.json(processed);
  } catch (err) {
    console.error('Error fetching host listings:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 2. Create a new listing for the host
app.post('/api/host/listings', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'], 10);
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    const { title, district, nightly_price, bedrooms, amenities, description } = req.body;
    if (!title || !district || nightly_price === undefined || bedrooms === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }
    
    const serializedAmenities = JSON.stringify(amenities || []);
    const rating = 5.0; // Default rating for new listings
    
    const insertRes = await queryRun(
      `INSERT INTO listings (host_id, title, district, nightly_price, bedrooms, amenities, rating, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [hostId, title, district, parseFloat(nightly_price), parseInt(bedrooms, 10), serializedAmenities, rating, description || '']
    );
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'host', ?, 'create_listing', 'listing', ?, ?)`,
      [hostId, host.name, insertRes.lastID, `Created listing "${title}" in ${district}`]
    );
    
    res.status(201).json({
      id: insertRes.lastID,
      host_id: hostId,
      title,
      district,
      nightly_price: parseFloat(nightly_price),
      bedrooms: parseInt(bedrooms, 10),
      amenities: amenities || [],
      rating,
      description: description || '',
      is_active: 1
    });
  } catch (err) {
    console.error('Error creating host listing:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 3. Modify an existing listing
app.put('/api/host/listings/:id', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'], 10);
    const { id } = req.params;
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    const listing = await queryGet('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found' });
    }
    
    if (listing.host_id !== hostId) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing' });
    }
    
    const { title, district, nightly_price, bedrooms, amenities, description } = req.body;
    if (!title || !district || nightly_price === undefined || bedrooms === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }
    
    const serializedAmenities = JSON.stringify(amenities || []);
    
    await queryRun(
      `UPDATE listings SET title = ?, district = ?, nightly_price = ?, bedrooms = ?, amenities = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, district, parseFloat(nightly_price), parseInt(bedrooms, 10), serializedAmenities, description || '', id]
    );
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'host', ?, 'edit_listing', 'listing', ?, ?)`,
      [hostId, host.name, id, `Updated listing "${title}" details`]
    );
    
    res.json({
      id: parseInt(id, 10),
      host_id: hostId,
      title,
      district,
      nightly_price: parseFloat(nightly_price),
      bedrooms: parseInt(bedrooms, 10),
      amenities: amenities || [],
      description: description || '',
      is_active: listing.is_active
    });
  } catch (err) {
    console.error('Error updating host listing:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 4. Publish or unpublish a listing
app.post('/api/host/listings/:id/status', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'], 10);
    const { id } = req.params;
    const { is_active } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    if (is_active === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing is_active status' });
    }
    
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    const listing = await queryGet('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found' });
    }
    
    if (listing.host_id !== hostId) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing' });
    }
    
    const activeVal = is_active ? 1 : 0;
    await queryRun(
      `UPDATE listings SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [activeVal, id]
    );
    
    const action = is_active ? 'publish_listing' : 'unpublish_listing';
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'host', ?, ?, 'listing', ?, ?)`,
      [hostId, host.name, action, id, `${is_active ? 'Published' : 'Unpublished'} listing "${listing.title}"`]
    );
    
    res.json({
      id: parseInt(id, 10),
      is_active: activeVal
    });
  } catch (err) {
    console.error('Error changing listing status:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 5. Add a blackout date block
app.post('/api/host/listings/:id/blackouts', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'], 10);
    const { id } = req.params;
    const { start_date, end_date } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing start_date or end_date' });
    }
    
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Start date must be before end date' });
    }
    
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    const listing = await queryGet('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found' });
    }
    
    if (listing.host_id !== hostId) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing' });
    }
    
    // Validate availability overlap with existing bookings or blackout blocks
    const avail = await checkListingAvailability(id, start_date, end_date, false);
    if (!avail.available) {
      return res.status(400).json({ error: avail.errorType, message: avail.message });
    }
    
    const insertRes = await queryRun(
      `INSERT INTO availability_blocks (listing_id, start_date, end_date, type) 
       VALUES (?, ?, ?, 'blackout')`,
      [id, start_date, end_date]
    );
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'host', ?, 'update_availability', 'availability', ?, ?)`,
      [hostId, host.name, insertRes.lastID, `Added blackout date range ${start_date} to ${end_date} for listing ${id}`]
    );
    
    res.status(201).json({
      id: insertRes.lastID,
      listing_id: parseInt(id, 10),
      start_date,
      end_date,
      type: 'blackout'
    });
  } catch (err) {
    console.error('Error adding blackout:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 6. Delete a blackout date block
app.delete('/api/host/listings/:id/blackouts/:blockId', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'], 10);
    const { id, blockId } = req.params;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    const listing = await queryGet('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found' });
    }
    
    if (listing.host_id !== hostId) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing' });
    }
    
    const block = await queryGet('SELECT * FROM availability_blocks WHERE id = ? AND listing_id = ?', [blockId, id]);
    if (!block) {
      return res.status(404).json({ error: 'Not Found', message: 'Blackout block not found for this listing' });
    }
    
    await queryRun('DELETE FROM availability_blocks WHERE id = ?', [blockId]);
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'host', ?, 'delete_availability', 'availability', ?, ?)`,
      [hostId, host.name, blockId, `Removed blackout block #${blockId} (${block.start_date} to ${block.end_date}) for listing ${id}`]
    );
    
    res.json({ success: true, message: 'Blackout block removed' });
  } catch (err) {
    console.error('Error removing blackout:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 7. Get bookings for host's listings
app.get('/api/host/bookings', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'] || req.query.host_id, 10);
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    const bookings = await queryAll(
      `SELECT b.*, l.title as listing_title 
       FROM booking_requests b 
       JOIN listings l ON b.listing_id = l.id 
       WHERE l.host_id = ? 
       ORDER BY b.id DESC`,
      [hostId]
    );
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching host bookings:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// 8. Review (approve/decline) a booking request
app.post('/api/host/bookings/:id/review', authMiddleware, async (req, res) => {
  try {
    const hostId = parseInt(req.headers['x-trore-actor-id'], 10);
    const { id } = req.params;
    const { status } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing actor identification (X-Trore-Actor-Id)' });
    }
    
    if (!status || (status !== 'approved' && status !== 'declined')) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid or missing status (must be approved or declined)' });
    }
    
    const host = await queryGet('SELECT * FROM hosts WHERE id = ?', [hostId]);
    if (!host) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid host actor' });
    }
    
    // Fetch booking request
    const booking = await queryGet('SELECT * FROM booking_requests WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking request not found' });
    }
    
    // Fetch listing and verify host ownership
    const listing = await queryGet('SELECT * FROM listings WHERE id = ?', [booking.listing_id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing associated with booking request not found' });
    }
    
    if (listing.host_id !== hostId) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own the listing associated with this booking' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Bad Request', message: 'Booking request is not pending' });
    }
    
    if (status === 'approved') {
      // Validate availability using centralized helper
      const avail = await checkListingAvailability(booking.listing_id, booking.start_date, booking.end_date, false);
      if (!avail.available) {
        return res.status(400).json({ error: avail.errorType, message: avail.message });
      }
      
      // Update booking status
      await queryRun('UPDATE booking_requests SET status = "approved", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      
      // Insert booked block in availability_blocks
      await queryRun(
        'INSERT INTO availability_blocks (listing_id, start_date, end_date, type) VALUES (?, ?, ?, "booked")',
        [booking.listing_id, booking.start_date, booking.end_date]
      );
    } else {
      // Update booking status to declined
      await queryRun('UPDATE booking_requests SET status = "declined", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    }
    
    const action = status === 'approved' ? 'approve_booking' : 'decline_booking';
    
    // Log audit trail
    await queryRun(
      `INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) 
       VALUES (?, 'host', ?, ?, 'booking', ?, ?)`,
      [hostId, host.name, action, id, `${status === 'approved' ? 'Approved' : 'Declined'} booking request #${id} for listing ${booking.listing_id}`]
    );
    
    res.json({
      id: parseInt(id, 10),
      status
    });
  } catch (err) {
    console.error('Error reviewing booking:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Trore server running at http://localhost:${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'public')}`);
});

module.exports = server;
