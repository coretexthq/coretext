import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Helper to get and verify actor from request
function getAndVerifyActor(req, res, expectedActorId = null) {
  const actorId = req.headers['x-trore-actor-id'] || req.query.actor_id || req.body.actor_id || req.body.renter_id;
  if (!actorId) {
    res.status(400).json({ error: 'Bad Request', message: 'actor_id is required.' });
    return null;
  }
  if (expectedActorId && Number(actorId) !== Number(expectedActorId)) {
    res.status(403).json({ error: 'Forbidden', message: 'Actor ID mismatch or unauthorized.' });
    return null;
  }
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(actorId);
  if (!actor) {
    res.status(404).json({ error: 'Not Found', message: 'Actor not found.' });
    return null;
  }
  return actor;
}

// Centralized booking validation function
function checkAvailability(listingId, startDate, endDate, ignoreBookingId = null) {
  // 1. Check blackout overlap
  const blackoutOverlap = db.prepare(`
    SELECT * FROM availability_blackouts 
    WHERE listing_id = ? AND start_date <= ? AND end_date >= ?
  `).get(listingId, endDate, startDate);

  if (blackoutOverlap) {
    return {
      available: false,
      reason: 'blackout',
      detail: `Dates overlap with blackout period: ${blackoutOverlap.start_date} to ${blackoutOverlap.end_date}`
    };
  }

  // 2. Check approved bookings overlap
  let bookingQuery = `
    SELECT * FROM booking_requests 
    WHERE listing_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?
  `;
  const bookingParams = [listingId, endDate, startDate];
  if (ignoreBookingId) {
    bookingQuery += ` AND id != ?`;
    bookingParams.push(ignoreBookingId);
  }
  const bookingOverlap = db.prepare(bookingQuery).get(...bookingParams);

  if (bookingOverlap) {
    return {
      available: false,
      reason: 'approved_booking',
      detail: `Dates overlap with an approved booking request (ID: ${bookingOverlap.id}): ${bookingOverlap.start_date} to ${bookingOverlap.end_date}`
    };
  }

  return { available: true };
}

// Centralized date format & range validation
function validateDatesAndAvailability(listingId, startDateStr, endDateStr, ignoreBookingId = null) {
  if (!startDateStr || !endDateStr) {
    return { valid: false, message: 'Start date and end date are required.' };
  }
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid start or end date format.' };
  }
  if (start > end) {
    return { valid: false, message: 'Start date cannot be after end date.' };
  }
  const diffTime = end.getTime() - start.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (nights <= 0) {
    return { valid: false, message: 'Booking must be at least 1 night.' };
  }

  const availability = checkAvailability(listingId, startDateStr, endDateStr, ignoreBookingId);
  if (!availability.available) {
    return { valid: false, message: availability.detail };
  }

  return { valid: true, nights };
}

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Central X-Trore-Auth header check middleware
app.use('/api', (req, res, next) => {
  const authHeader = req.headers['x-trore-auth'];
  if (authHeader !== 'v3-4-case-study') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or incorrect X-Trore-Auth header.'
    });
  }
  next();
});

// Simple health/verify API endpoint
app.get('/api/health', (req, res) => {
  try {
    const actorCount = db.prepare('SELECT COUNT(*) as count FROM actors').get().count;
    const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings').get().count;
    
    res.json({
      status: 'ok',
      message: 'Trore backend API is operational',
      db: {
        actors: actorCount,
        listings: listingCount
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Database check failed',
      error: err.message
    });
  }
});

// GET /api/actors
app.get('/api/actors', (req, res) => {
  try {
    const actors = db.prepare('SELECT * FROM actors ORDER BY name ASC').all();
    res.json({ success: true, data: actors });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/listings (Listing search, filtering, sorting, pagination)
app.get('/api/listings', (req, res) => {
  try {
    const {
      search,
      district,
      min_price,
      max_price,
      bedrooms,
      amenities,
      start_date,
      end_date,
      sort,
      page = 1,
      limit = 6
    } = req.query;

    let conditions = '';
    const params = [];

    if (search && search.trim() !== '') {
      conditions += ` AND (l.title LIKE ? OR l.district LIKE ? OR l.short_description LIKE ? OR l.description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (district && district.trim() !== '') {
      conditions += ` AND l.district = ?`;
      params.push(district);
    }
    if (min_price !== undefined && min_price !== '') {
      conditions += ` AND l.nightly_price >= ?`;
      params.push(Number(min_price));
    }
    if (max_price !== undefined && max_price !== '') {
      conditions += ` AND l.nightly_price <= ?`;
      params.push(Number(max_price));
    }
    if (bedrooms !== undefined && bedrooms !== '') {
      conditions += ` AND l.bedrooms >= ?`;
      params.push(Number(bedrooms));
    }
    if (amenities) {
      const amenityList = Array.isArray(amenities)
        ? amenities
        : String(amenities).split(',').map(s => s.trim()).filter(Boolean);
      for (const amenity of amenityList) {
        conditions += ` AND l.amenities LIKE ?`;
        params.push(`%${amenity}%`);
      }
    }
    if (start_date && end_date) {
      conditions += `
        AND NOT EXISTS (
          SELECT 1 FROM availability_blackouts ab
          WHERE ab.listing_id = l.id
            AND ab.start_date <= ?
            AND ab.end_date >= ?
        )
        AND NOT EXISTS (
          SELECT 1 FROM booking_requests br
          WHERE br.listing_id = l.id
            AND br.status = 'approved'
            AND br.start_date <= ?
            AND br.end_date >= ?
        )
      `;
      params.push(end_date, start_date, end_date, start_date);
    }

    // Count query
    const countSql = `
      SELECT COUNT(*) as count
      FROM listings l
      WHERE l.is_published = 1
      ${conditions}
    `;
    const countResult = db.prepare(countSql).get(...params);
    const total = countResult ? countResult.count : 0;

    // Sorting
    let sortSql = ' ORDER BY l.rating DESC'; // Relevance/default fallback
    if (sort === 'price_asc') {
      sortSql = ' ORDER BY l.nightly_price ASC';
    } else if (sort === 'price_desc') {
      sortSql = ' ORDER BY l.nightly_price DESC';
    } else if (sort === 'rating') {
      sortSql = ' ORDER BY l.rating DESC';
    } else if (sort === 'newest') {
      sortSql = ' ORDER BY l.id DESC';
    }

    // Pagination
    const limitVal = Number(limit) || 6;
    const pageVal = Number(page) || 1;
    const offsetVal = (pageVal - 1) * limitVal;

    const dataSql = `
      SELECT l.*, a.name AS host_name
      FROM listings l
      JOIN actors a ON l.host_id = a.id
      WHERE l.is_published = 1
      ${conditions}
      ${sortSql}
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limitVal, offsetVal];
    const listings = db.prepare(dataSql).all(...dataParams);

    const parsedListings = listings.map(l => ({
      ...l,
      amenities: l.amenities ? l.amenities.split(',').map(s => s.trim()) : [],
      is_available: (start_date && end_date) ? true : undefined
    }));

    res.json({
      success: true,
      data: parsedListings,
      pagination: {
        total,
        page: pageVal,
        limit: limitVal,
        pages: Math.ceil(total / limitVal)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/listings/:id (Listing detail with amenities & blackout/approved dates)
app.get('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  try {
    const listing = db.prepare(`
      SELECT l.*, a.name AS host_name
      FROM listings l
      JOIN actors a ON l.host_id = a.id
      WHERE l.id = ?
    `).get(id);

    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }

    // Get blackout dates (both blockouts and approved booking ranges)
    const blackouts = db.prepare(`
      SELECT start_date, end_date FROM availability_blackouts WHERE listing_id = ?
      UNION
      SELECT start_date, end_date FROM booking_requests WHERE listing_id = ? AND status = 'approved'
    `).all(id, id);

    const formattedListing = {
      ...listing,
      amenities: listing.amenities ? listing.amenities.split(',').map(s => s.trim()) : [],
      blackouts: blackouts
    };

    res.json({ success: true, data: formattedListing });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/saved-searches (Retrieve saved searches for a given actor/user)
app.get('/api/saved-searches', (req, res) => {
  const { actor_id } = req.query;
  if (!actor_id) {
    return res.status(400).json({ error: 'Bad Request', message: 'actor_id query parameter is required.' });
  }
  try {
    const searches = db.prepare('SELECT * FROM saved_searches WHERE actor_id = ? ORDER BY id DESC').all(actor_id);
    const parsedSearches = searches.map(s => ({
      ...s,
      filters: JSON.parse(s.filters)
    }));
    res.json({ success: true, data: parsedSearches });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/saved-searches (Save a filter combination for a given actor/user)
app.post('/api/saved-searches', (req, res) => {
  const { actor_id, name, filters } = req.body;
  if (!actor_id || !name || !filters) {
    return res.status(400).json({ error: 'Bad Request', message: 'actor_id, name, and filters are required.' });
  }
  try {
    // Verify actor exists and check ownership / authorization
    const actor = getAndVerifyActor(req, res, actor_id);
    if (!actor) return;

    const filtersJson = typeof filters === 'string' ? filters : JSON.stringify(filters);
    const insert = db.prepare('INSERT INTO saved_searches (actor_id, name, filters) VALUES (?, ?, ?)');
    const result = insert.run(actor_id, name, filtersJson);
    const newId = result.lastInsertRowid;

    // Create audit record
    const insertAudit = db.prepare(`
      INSERT INTO audit_records (actor_id, actor_name, action_type, entity_type, entity_id, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run(
      actor_id,
      actor.name,
      'create_saved_search',
      'saved_search',
      Number(newId),
      `${actor.name} created a saved search: "${name}"`
    );

    res.status(201).json({
      success: true,
      data: {
        id: Number(newId),
        actor_id,
        name,
        filters: typeof filters === 'string' ? JSON.parse(filters) : filters
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/booking-requests (Submit a booking request with range and availability check)
app.post('/api/booking-requests', (req, res) => {
  const { listing_id, renter_id, start_date, end_date, renter_name, renter_email } = req.body;
  if (!listing_id || !renter_id || !start_date || !end_date || !renter_name || !renter_email) {
    return res.status(400).json({ error: 'Bad Request', message: 'All booking fields are required.' });
  }

  try {
    // 1. Check listing
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing_id);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.is_published !== 1) {
      return res.status(400).json({ error: 'Bad Request', message: 'This listing is not active.' });
    }

    // 2. Check renter and check ownership / authorization
    const renter = getAndVerifyActor(req, res, renter_id);
    if (!renter) return;
    if (renter.role !== 'renter') {
      return res.status(403).json({ error: 'Forbidden', message: 'Actor does not have renter privileges.' });
    }

    // 3. Centralized validation for dates & availability
    const validation = validateDatesAndAvailability(listing_id, start_date, end_date);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Bad Request', message: validation.message });
    }

    const nights = validation.nights;

    // Calculate total price
    const totalPrice = nights * listing.nightly_price;

    // Insert booking request
    const insert = db.prepare(`
      INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, renter_name, renter_email)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
    `);
    const result = insert.run(listing_id, renter_id, start_date, end_date, totalPrice, renter_name, renter_email);
    const newId = result.lastInsertRowid;

    // Audit log
    const insertAudit = db.prepare(`
      INSERT INTO audit_records (actor_id, actor_name, action_type, entity_type, entity_id, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run(
      renter_id,
      renter_name,
      'create_booking',
      'booking_request',
      Number(newId),
      `${renter_name} requested booking for Listing ${listing_id} (${start_date} to ${end_date})`
    );

    res.status(201).json({
      success: true,
      data: {
        id: Number(newId),
        listing_id,
        renter_id,
        start_date,
        end_date,
        total_price: totalPrice,
        status: 'pending',
        renter_name,
        renter_email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// ==========================================
// Host Workflows & Authorization Helpers
// ==========================================

// Helper to extract actor and verify host role
function getAndVerifyHost(req, res) {
  const actorId = req.headers['x-trore-actor-id'] || req.query.actor_id || req.body.actor_id;
  if (!actorId) {
    res.status(400).json({ error: 'Bad Request', message: 'actor_id is required for host operations.' });
    return null;
  }
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(actorId);
  if (!actor) {
    res.status(404).json({ error: 'Not Found', message: 'Actor not found.' });
    return null;
  }
  if (actor.role !== 'host') {
    res.status(403).json({ error: 'Forbidden', message: 'Actor does not have host privileges.' });
    return null;
  }
  return actor;
}

// Helper to log audit
function logAudit(actorId, actorName, actionType, entityType, entityId, summary) {
  try {
    const insertAudit = db.prepare(`
      INSERT INTO audit_records (actor_id, actor_name, action_type, entity_type, entity_id, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run(actorId, actorName, actionType, entityType, entityId, summary);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// GET /api/host/listings
app.get('/api/host/listings', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const listings = db.prepare('SELECT * FROM listings WHERE host_id = ? ORDER BY id DESC').all(host.id);
    const parsedListings = listings.map(l => ({
      ...l,
      amenities: l.amenities ? l.amenities.split(',').map(s => s.trim()) : []
    }));
    res.json({ success: true, data: parsedListings });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/host/listings
app.post('/api/host/listings', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { title, district, nightly_price, bedrooms, amenities, short_description, description } = req.body;
    if (!title || !district || nightly_price === undefined || bedrooms === undefined || !short_description) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required listing fields.' });
    }

    let amenitiesStr = '';
    if (Array.isArray(amenities)) {
      amenitiesStr = amenities.join(', ');
    } else if (typeof amenities === 'string') {
      amenitiesStr = amenities;
    }

    const rating = 5.0; // default rating for new listings
    const is_published = req.body.is_published !== undefined ? Number(req.body.is_published) : 1;

    const insert = db.prepare(`
      INSERT INTO listings (title, district, nightly_price, bedrooms, amenities, rating, short_description, description, is_published, host_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      title,
      district,
      Number(nightly_price),
      Number(bedrooms),
      amenitiesStr,
      rating,
      short_description,
      description || '',
      is_published,
      host.id
    );
    const newId = result.lastInsertRowid;

    logAudit(host.id, host.name, 'create_listing', 'listing', Number(newId), `${host.name} created listing "${title}" (ID: ${newId})`);

    res.status(201).json({
      success: true,
      data: {
        id: Number(newId),
        title,
        district,
        nightly_price: Number(nightly_price),
        bedrooms: Number(bedrooms),
        amenities: amenitiesStr.split(',').map(s => s.trim()).filter(Boolean),
        rating,
        short_description,
        description: description || '',
        is_published,
        host_id: host.id
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/host/listings/:id
app.put('/api/host/listings/:id', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { id } = req.params;
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== host.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const { title, district, nightly_price, bedrooms, amenities, short_description, description } = req.body;
    if (!title || !district || nightly_price === undefined || bedrooms === undefined || !short_description) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required listing fields.' });
    }

    let amenitiesStr = '';
    if (Array.isArray(amenities)) {
      amenitiesStr = amenities.join(', ');
    } else if (typeof amenities === 'string') {
      amenitiesStr = amenities;
    }

    db.prepare(`
      UPDATE listings
      SET title = ?, district = ?, nightly_price = ?, bedrooms = ?, amenities = ?, short_description = ?, description = ?
      WHERE id = ?
    `).run(
      title,
      district,
      Number(nightly_price),
      Number(bedrooms),
      amenitiesStr,
      short_description,
      description || '',
      id
    );

    logAudit(host.id, host.name, 'edit_listing', 'listing', Number(id), `${host.name} edited listing "${title}" (ID: ${id})`);

    res.json({
      success: true,
      data: {
        id: Number(id),
        title,
        district,
        nightly_price: Number(nightly_price),
        bedrooms: Number(bedrooms),
        amenities: amenitiesStr.split(',').map(s => s.trim()).filter(Boolean),
        rating: listing.rating,
        short_description,
        description: description || '',
        is_published: listing.is_published,
        host_id: host.id
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PATCH /api/host/listings/:id/publish
app.patch('/api/host/listings/:id/publish', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { id } = req.params;
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== host.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const newStatus = listing.is_published === 1 ? 0 : 1;
    db.prepare('UPDATE listings SET is_published = ? WHERE id = ?').run(newStatus, id);

    const actionType = newStatus === 1 ? 'publish_listing' : 'unpublish_listing';
    logAudit(host.id, host.name, actionType, 'listing', Number(id), `${host.name} ${newStatus === 1 ? 'published' : 'unpublished'} listing "${listing.title}" (ID: ${id})`);

    res.json({
      success: true,
      data: {
        id: Number(id),
        is_published: newStatus
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/host/listings/:id/blackouts
app.get('/api/host/listings/:id/blackouts', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { id } = req.params;
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== host.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const blackouts = db.prepare('SELECT * FROM availability_blackouts WHERE listing_id = ? ORDER BY start_date ASC').all(id);
    res.json({ success: true, data: blackouts });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/host/listings/:id/blackouts
app.post('/api/host/listings/:id/blackouts', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { id } = req.params;
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== host.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const { start_date, end_date } = req.body;
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Bad Request', message: 'start_date and end_date are required.' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid start_date or end_date.' });
    }

    // Enforce that a host cannot add a blackout period if it overlaps with an already approved booking
    const approvedBookingOverlap = db.prepare(`
      SELECT * FROM booking_requests 
      WHERE listing_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?
    `).get(id, end_date, start_date);

    if (approvedBookingOverlap) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot add blackout period because it overlaps with an approved booking (ID: ${approvedBookingOverlap.id}): ${approvedBookingOverlap.start_date} to ${approvedBookingOverlap.end_date}`
      });
    }

    const result = db.prepare(`
      INSERT INTO availability_blackouts (listing_id, start_date, end_date, type)
      VALUES (?, ?, ?, 'blackout')
    `).run(id, start_date, end_date);
    const newId = result.lastInsertRowid;

    logAudit(host.id, host.name, 'create_blackout', 'availability_blackout', Number(newId), `${host.name} added blackout range for listing "${listing.title}" (ID: ${id}) from ${start_date} to ${end_date}`);

    res.status(201).json({
      success: true,
      data: {
        id: Number(newId),
        listing_id: Number(id),
        start_date,
        end_date,
        type: 'blackout'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// DELETE /api/host/listings/:id/blackouts/:blackout_id
app.delete('/api/host/listings/:id/blackouts/:blackout_id', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { id, blackout_id } = req.params;
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== host.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const blackout = db.prepare('SELECT * FROM availability_blackouts WHERE id = ? AND listing_id = ?').get(blackout_id, id);
    if (!blackout) {
      return res.status(404).json({ error: 'Not Found', message: 'Blackout not found for this listing.' });
    }

    db.prepare('DELETE FROM availability_blackouts WHERE id = ?').run(blackout_id);

    logAudit(host.id, host.name, 'delete_blackout', 'availability_blackout', Number(blackout_id), `${host.name} removed blackout range (ID: ${blackout_id}) for listing "${listing.title}" (ID: ${id})`);

    res.json({ success: true, message: 'Blackout removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/host/bookings
app.get('/api/host/bookings', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const bookings = db.prepare(`
      SELECT br.*, l.title AS listing_title, l.nightly_price
      FROM booking_requests br
      JOIN listings l ON br.listing_id = l.id
      WHERE l.host_id = ?
      ORDER BY br.id DESC
    `).all(host.id);

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PATCH /api/host/bookings/:booking_id
app.patch('/api/host/bookings/:booking_id', (req, res) => {
  try {
    const host = getAndVerifyHost(req, res);
    if (!host) return;

    const { booking_id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Status must be approved or declined.' });
    }

    const booking = db.prepare(`
      SELECT br.*, l.host_id, l.title AS listing_title
      FROM booking_requests br
      JOIN listings l ON br.listing_id = l.id
      WHERE br.id = ?
    `).get(booking_id);

    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking request not found.' });
    }

    if (booking.host_id !== host.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own the listing associated with this booking request.' });
    }

    if (status === 'approved') {
      const validation = validateDatesAndAvailability(booking.listing_id, booking.start_date, booking.end_date, booking.id);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Bad Request', message: validation.message });
      }
    }

    db.prepare('UPDATE booking_requests SET status = ? WHERE id = ?').run(status, booking_id);

    const actionType = status === 'approved' ? 'approve_booking' : 'decline_booking';
    logAudit(host.id, host.name, actionType, 'booking_request', Number(booking_id), `${host.name} ${status} booking request ID: ${booking_id} for listing "${booking.listing_title}" (${booking.start_date} to ${booking.end_date})`);

    // Automatically decline overlapping pending booking requests for the same listing
    if (status === 'approved') {
      const overlappingPendingBookings = db.prepare(`
        SELECT br.id, br.renter_name, l.title AS listing_title, br.start_date, br.end_date
        FROM booking_requests br
        JOIN listings l ON br.listing_id = l.id
        WHERE br.listing_id = ? AND br.status = 'pending' AND br.start_date <= ? AND br.end_date >= ?
      `).all(booking.listing_id, booking.end_date, booking.start_date);

      const updateDeclined = db.prepare(`
        UPDATE booking_requests SET status = 'declined' WHERE id = ?
      `);

      for (const pendingBk of overlappingPendingBookings) {
        updateDeclined.run(pendingBk.id);
        logAudit(
          host.id,
          host.name,
          'decline_booking',
          'booking_request',
          pendingBk.id,
          `System automatically declined pending booking request ID: ${pendingBk.id} for listing "${pendingBk.listing_title}" (${pendingBk.start_date} to ${pendingBk.end_date}) due to overlap with approved booking ID: ${booking_id}`
        );
      }
    }

    res.json({
      success: true,
      data: {
        id: Number(booking_id),
        status
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', (req, res) => {
  try {
    const actorId = req.headers['x-trore-actor-id'] || req.query.actor_id || req.body.actor_id;
    if (actorId) {
      const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(actorId);
      if (!actor) {
        return res.status(404).json({ error: 'Not Found', message: 'Actor not found.' });
      }
      if (actor.role !== 'reviewer') {
        return res.status(403).json({ error: 'Forbidden', message: 'Actor does not have reviewer privileges.' });
      }
    }
    const logs = db.prepare('SELECT * FROM audit_records ORDER BY id DESC').all();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});

export { app, server };
