const express = require('express');
const path = require('path');
const { db, getAsync, allAsync, runAsync } = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON request body parser
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Trore Authentication Middleware
function troreAuthMiddleware(req, res, next) {
  const authHeader = req.headers['x-trore-auth'];
  if (authHeader !== 'v3-4-case-study') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or incorrect X-Trore-Auth header.'
    });
  }
  next();
}

// Public endpoint: Health check
app.get('/api/health', async (req, res) => {
  try {
    // Perform a simple query to verify database connection
    const row = await getAsync('SELECT 1 + 1 AS result');
    if (row && row.result === 2) {
      return res.status(200).json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Database integrity check failed');
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

// Protected endpoint: Simple test route to verify auth header middleware
app.get('/api/protected-test', troreAuthMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Authentication successful. Access granted to protected route.',
    user: 'v3-4-case-study-authorized'
  });
});

// GET /api/listings: Search listings with parameters
app.get('/api/listings', troreAuthMiddleware, async (req, res) => {
  try {
    const { q, district, minPrice, maxPrice, bedrooms, amenities, startDate, endDate, sortBy, page, limit } = req.query;

    let filterSql = '';
    const filterParams = [];

    if (q) {
      filterSql += ` AND (l.title LIKE ? OR l.description LIKE ?)`;
      filterParams.push(`%${q}%`, `%${q}%`);
    }

    if (district) {
      filterSql += ` AND l.district = ?`;
      filterParams.push(district);
    }

    if (minPrice) {
      filterSql += ` AND l.nightly_price >= ?`;
      filterParams.push(Number(minPrice));
    }

    if (maxPrice) {
      filterSql += ` AND l.nightly_price <= ?`;
      filterParams.push(Number(maxPrice));
    }

    if (bedrooms) {
      filterSql += ` AND l.bedrooms >= ?`;
      filterParams.push(Number(bedrooms));
    }

    if (amenities) {
      const amenityList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map(a => a.trim()).filter(Boolean);

      for (const amenity of amenityList) {
        filterSql += ` AND l.amenities LIKE ?`;
        filterParams.push(`%"${amenity}"%`);
      }
    }

    if (startDate && endDate) {
      filterSql += `
        AND l.id NOT IN (
          SELECT listing_id FROM availability
          WHERE (start_date < ? AND end_date > ?)
        )
        AND l.id NOT IN (
          SELECT listing_id FROM booking_requests
          WHERE status = 'approved'
            AND (start_date < ? AND end_date > ?)
        )
      `;
      filterParams.push(endDate, startDate, endDate, startDate);
    }

    // Get total count
    const countSql = `
      SELECT COUNT(*) as count
      FROM listings l
      JOIN hosts h ON l.host_id = h.id
      WHERE l.status = 'active' ${filterSql}
    `;
    const countResult = await getAsync(countSql, filterParams);
    const total = countResult ? countResult.count : 0;

    // Sorting
    let orderBy = 'l.id ASC';
    if (sortBy === 'price') {
      orderBy = 'l.nightly_price ASC';
    } else if (sortBy === 'rating') {
      orderBy = 'l.rating DESC';
    } else if (sortBy === 'newest') {
      orderBy = 'l.id DESC';
    }

    // Pagination
    const limitVal = Number(limit) || 6;
    const pageVal = Number(page) || 1;
    const offsetVal = (pageVal - 1) * limitVal;

    const dataSql = `
      SELECT l.*, h.name as host_name
      FROM listings l
      JOIN hosts h ON l.host_id = h.id
      WHERE l.status = 'active' ${filterSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...filterParams, limitVal, offsetVal];
    const rawListings = await allAsync(dataSql, dataParams);

    const listings = rawListings.map(row => ({
      ...row,
      amenities: JSON.parse(row.amenities || '[]')
    }));

    res.json({
      listings,
      total,
      page: pageVal,
      limit: limitVal,
      totalPages: Math.ceil(total / limitVal)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// GET /api/listings/:id: Get detailed listing view
app.get('/api/listings/:id', troreAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await getAsync(`
      SELECT l.*, h.name as host_name, h.email as host_email
      FROM listings l
      JOIN hosts h ON l.host_id = h.id
      WHERE l.id = ?
    `, [id]);

    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }

    listing.amenities = JSON.parse(listing.amenities || '[]');

    const blackouts = await allAsync(
      'SELECT start_date, end_date FROM availability WHERE listing_id = ?',
      [id]
    );

    const bookings = await allAsync(
      "SELECT start_date, end_date FROM booking_requests WHERE listing_id = ? AND status = 'approved'",
      [id]
    );

    res.json({
      listing,
      blackouts,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/saved-searches: Save search configuration
app.post('/api/saved-searches', troreAuthMiddleware, async (req, res) => {
  const { renter_name, filters } = req.body;
  if (!renter_name) {
    return res.status(400).json({ error: 'Bad Request', message: 'renter_name is required.' });
  }
  if (!filters) {
    return res.status(400).json({ error: 'Bad Request', message: 'filters are required.' });
  }

  const filters_json = JSON.stringify(filters);

  try {
    const result = await runAsync(
      'INSERT INTO saved_searches (renter_name, filters_json) VALUES (?, ?)',
      [renter_name, filters_json]
    );

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        renter_name,
        'CREATE_SAVED_SEARCH',
        'saved_search',
        result.id,
        `Renter ${renter_name} saved a search with filters: ${filters_json}`
      ]
    );

    res.status(201).json({
      id: result.id,
      renter_name,
      filters
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// GET /api/saved-searches: Retrieve saved searches
app.get('/api/saved-searches', troreAuthMiddleware, async (req, res) => {
  const { renter_name } = req.query;
  if (!renter_name) {
    return res.status(400).json({ error: 'Bad Request', message: 'renter_name is required.' });
  }

  try {
    const rows = await allAsync(
      'SELECT * FROM saved_searches WHERE renter_name = ?',
      [renter_name]
    );

    const savedSearches = rows.map(row => ({
      id: row.id,
      renter_name: row.renter_name,
      filters: JSON.parse(row.filters_json)
    }));

    res.json(savedSearches);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/booking-requests: Create booking request
app.post('/api/booking-requests', troreAuthMiddleware, async (req, res) => {
  const { listing_id, renter_name, renter_email, start_date, end_date } = req.body;

  if (!listing_id || !renter_name || !renter_email || !start_date || !end_date) {
    return res.status(400).json({ error: 'Bad Request', message: 'All booking fields are required.' });
  }

  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [listing_id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Bad Request', message: 'This listing is inactive.' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start_date > end_date) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid start or end date.' });
    }

    const blackoutOverlap = await getAsync(`
      SELECT 1 FROM availability
      WHERE listing_id = ? AND (start_date < ? AND end_date > ?)
    `, [listing_id, end_date, start_date]);

    if (blackoutOverlap) {
      return res.status(400).json({ error: 'Unavailable', message: 'Selected dates overlap with host blackout dates.' });
    }

    const bookingOverlap = await getAsync(`
      SELECT 1 FROM booking_requests
      WHERE listing_id = ? AND status = 'approved' AND (start_date < ? AND end_date > ?)
    `, [listing_id, end_date, start_date]);

    if (bookingOverlap) {
      return res.status(400).json({ error: 'Unavailable', message: 'Selected dates are already booked.' });
    }

    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const total_price = nights * listing.nightly_price;

    const result = await runAsync(`
      INSERT INTO booking_requests (listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [listing_id, renter_name, renter_email, start_date, end_date, total_price]);

    await runAsync(`
      INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
      VALUES (?, ?, ?, ?, ?)
    `, [
      renter_name,
      'CREATE_BOOKING',
      'booking_request',
      result.id,
      `Renter ${renter_name} created booking request #${result.id} for '${listing.title}' (${start_date} to ${end_date})`
    ]);

    res.status(201).json({
      id: result.id,
      listing_id,
      renter_name,
      renter_email,
      start_date,
      end_date,
      total_price,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// Host Authorization Middleware
async function hostAuthMiddleware(req, res, next) {
  const hostName = req.headers['x-trore-host'] || req.headers['x-trore-actor'] || req.query.host_name;
  if (!hostName) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing host identity header X-Trore-Host.' });
  }
  try {
    const host = await getAsync('SELECT * FROM hosts WHERE name = ?', [hostName]);
    if (!host) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Host not found.' });
    }
    req.hostUser = host;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
}

// GET /api/host/listings: Retrieve listings owned by the active host actor
app.get('/api/host/listings', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  try {
    const listings = await allAsync('SELECT * FROM listings WHERE host_id = ?', [req.hostUser.id]);
    const parsedListings = [];
    for (const l of listings) {
      l.amenities = JSON.parse(l.amenities || '[]');
      l.blackouts = await allAsync('SELECT id, start_date, end_date FROM availability WHERE listing_id = ?', [l.id]);
      parsedListings.push(l);
    }
    res.json(parsedListings);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/host/listings: Create a new listing owned by the host
app.post('/api/host/listings', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { title, district, nightly_price, bedrooms, amenities, description } = req.body;
  if (!title || !district || !nightly_price || !bedrooms) {
    return res.status(400).json({ error: 'Bad Request', message: 'Title, district, nightly_price, and bedrooms are required.' });
  }
  try {
    const amenitiesStr = JSON.stringify(Array.isArray(amenities) ? amenities : []);
    const result = await runAsync(
      `INSERT INTO listings (title, district, nightly_price, bedrooms, amenities, description, status, host_id, rating)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 0.0)`,
      [title, district, Number(nightly_price), Number(bedrooms), amenitiesStr, description || '', req.hostUser.id]
    );

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.hostUser.name,
        'CREATE_LISTING',
        'listing',
        result.id,
        `Host ${req.hostUser.name} created listing '${title}'`
      ]
    );

    res.status(201).json({
      id: result.id,
      title,
      district,
      nightly_price,
      bedrooms,
      amenities: Array.isArray(amenities) ? amenities : [],
      description,
      status: 'active',
      host_id: req.hostUser.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// PUT /api/host/listings/:id: Edit listing details
app.put('/api/host/listings/:id', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, district, nightly_price, bedrooms, amenities, description } = req.body;
  if (!title || !district || !nightly_price || !bedrooms) {
    return res.status(400).json({ error: 'Bad Request', message: 'Title, district, nightly_price, and bedrooms are required.' });
  }
  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const amenitiesStr = JSON.stringify(Array.isArray(amenities) ? amenities : []);
    await runAsync(
      `UPDATE listings SET title = ?, district = ?, nightly_price = ?, bedrooms = ?, amenities = ?, description = ?
       WHERE id = ?`,
      [title, district, Number(nightly_price), Number(bedrooms), amenitiesStr, description || '', id]
    );

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.hostUser.name,
        'EDIT_LISTING',
        'listing',
        id,
        `Host ${req.hostUser.name} edited listing '${title}'`
      ]
    );

    res.json({ message: 'Listing updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/host/listings/:id/publish: Publish listing
app.post('/api/host/listings/:id/publish', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    await runAsync(`UPDATE listings SET status = 'active' WHERE id = ?`, [id]);

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.hostUser.name,
        'PUBLISH_LISTING',
        'listing',
        id,
        `Host ${req.hostUser.name} published listing '${listing.title}'`
      ]
    );

    res.json({ message: 'Listing published successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/host/listings/:id/unpublish: Unpublish listing
app.post('/api/host/listings/:id/unpublish', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    await runAsync(`UPDATE listings SET status = 'inactive' WHERE id = ?`, [id]);

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.hostUser.name,
        'UNPUBLISH_LISTING',
        'listing',
        id,
        `Host ${req.hostUser.name} unpublished listing '${listing.title}'`
      ]
    );

    res.json({ message: 'Listing unpublished successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/host/listings/:id/blackouts: Set blackout date ranges
app.post('/api/host/listings/:id/blackouts', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date } = req.body;
  if (!start_date || !end_date || start_date > end_date) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid start_date or end_date.' });
  }
  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const result = await runAsync(
      `INSERT INTO availability (listing_id, start_date, end_date) VALUES (?, ?, ?)`,
      [id, start_date, end_date]
    );

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.hostUser.name,
        'CREATE_BLACKOUT',
        'listing',
        id,
        `Host ${req.hostUser.name} added blackout date range ${start_date} to ${end_date} for listing '${listing.title}'`
      ]
    );

    res.status(201).json({ id: result.id, listing_id: Number(id), start_date, end_date });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// DELETE /api/host/listings/:id/blackouts/:blackoutId: Delete a blackout date range
app.delete('/api/host/listings/:id/blackouts/:blackoutId', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id, blackoutId } = req.params;
  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Not Found', message: 'Listing not found.' });
    }
    if (listing.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    const blackout = await getAsync('SELECT * FROM availability WHERE id = ? AND listing_id = ?', [blackoutId, id]);
    if (!blackout) {
      return res.status(404).json({ error: 'Not Found', message: 'Blackout range not found.' });
    }

    await runAsync(`DELETE FROM availability WHERE id = ?`, [blackoutId]);

    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.hostUser.name,
        'DELETE_BLACKOUT',
        'listing',
        id,
        `Host ${req.hostUser.name} deleted blackout date range ${blackout.start_date} to ${blackout.end_date} for listing '${listing.title}'`
      ]
    );

    res.json({ message: 'Blackout deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// GET /api/host/bookings: Retrieve booking requests for all listings owned by the active host actor
app.get('/api/host/bookings', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT b.*, l.title AS listing_title
      FROM booking_requests b
      JOIN listings l ON b.listing_id = l.id
      WHERE l.host_id = ?
      ORDER BY b.id DESC
    `;
    const bookings = await allAsync(query, [req.hostUser.id]);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/host/bookings/:id/approve: Approve a pending booking request
app.post('/api/host/bookings/:id/approve', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await getAsync(`
      SELECT b.*, l.host_id, l.title AS listing_title, l.status AS listing_status
      FROM booking_requests b
      JOIN listings l ON b.listing_id = l.id
      WHERE b.id = ?
    `, [id]);

    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking request not found.' });
    }

    if (booking.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Bad Request', message: 'Booking request is not pending.' });
    }

    if (booking.listing_status !== 'active') {
      return res.status(400).json({ error: 'Bad Request', message: 'This listing is inactive.' });
    }

    const { listing_id, start_date, end_date, listing_title } = booking;

    // Check blackout dates overlap
    const blackoutOverlap = await getAsync(`
      SELECT 1 FROM availability
      WHERE listing_id = ? AND (start_date < ? AND end_date > ?)
    `, [listing_id, end_date, start_date]);

    if (blackoutOverlap) {
      return res.status(400).json({ error: 'Unavailable', message: 'Selected dates overlap with host blackout dates.' });
    }

    // Check other approved bookings overlap
    const bookingOverlap = await getAsync(`
      SELECT 1 FROM booking_requests
      WHERE listing_id = ? AND status = 'approved' AND id != ? AND (start_date < ? AND end_date > ?)
    `, [listing_id, id, end_date, start_date]);

    if (bookingOverlap) {
      return res.status(400).json({ error: 'Unavailable', message: 'Selected dates are already booked.' });
    }

    // Update status to approved
    await runAsync(`UPDATE booking_requests SET status = 'approved' WHERE id = ?`, [id]);

    // Insert approval audit record
    await runAsync(`
      INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
      VALUES (?, ?, ?, ?, ?)
    `, [
      req.hostUser.name,
      'APPROVE_BOOKING',
      'booking_request',
      id,
      `Host ${req.hostUser.name} approved booking request #${id} for '${listing_title}' (${start_date} to ${end_date})`
    ]);

    // Find and decline other overlapping pending booking requests
    const overlappingPendings = await allAsync(`
      SELECT id, renter_name FROM booking_requests
      WHERE listing_id = ? AND status = 'pending' AND id != ? AND (start_date < ? AND end_date > ?)
    `, [listing_id, id, end_date, start_date]);

    if (overlappingPendings.length > 0) {
      await runAsync(`
        UPDATE booking_requests SET status = 'declined'
        WHERE listing_id = ? AND status = 'pending' AND id != ? AND (start_date < ? AND end_date > ?)
      `, [listing_id, id, end_date, start_date]);

      for (const reqPending of overlappingPendings) {
        await runAsync(`
          INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
          VALUES (?, ?, ?, ?, ?)
        `, [
          req.hostUser.name,
          'DECLINE_BOOKING',
          'booking_request',
          reqPending.id,
          `Booking request #${reqPending.id} automatically declined due to overlap with approved booking #${id}`
        ]);
      }
    }

    res.json({ message: 'Booking request approved successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// POST /api/host/bookings/:id/decline: Decline a pending booking request
app.post('/api/host/bookings/:id/decline', troreAuthMiddleware, hostAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await getAsync(`
      SELECT b.*, l.host_id, l.title AS listing_title
      FROM booking_requests b
      JOIN listings l ON b.listing_id = l.id
      WHERE b.id = ?
    `, [id]);

    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking request not found.' });
    }

    if (booking.host_id !== req.hostUser.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this listing.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Bad Request', message: 'Booking request is not pending.' });
    }

    await runAsync(`UPDATE booking_requests SET status = 'declined' WHERE id = ?`, [id]);

    await runAsync(`
      INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
      VALUES (?, ?, ?, ?, ?)
    `, [
      req.hostUser.name,
      'DECLINE_BOOKING',
      'booking_request',
      id,
      `Host ${req.hostUser.name} declined booking request #${id} for '${booking.listing_title}'`
    ]);

    res.json({ message: 'Booking request declined successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// GET /api/admin/audit-logs: Retrieve audit records showing timestamp, actor, action type, entity type, entity ID, and a concise summary
app.get('/api/admin/audit-logs', troreAuthMiddleware, async (req, res) => {
  try {
    const logs = await allAsync('SELECT * FROM audit_records ORDER BY id DESC');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// For future extension: expose the auth middleware as helper for other routes
app.locals.troreAuthMiddleware = troreAuthMiddleware;
app.locals.hostAuthMiddleware = hostAuthMiddleware;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Trore Foundation Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
