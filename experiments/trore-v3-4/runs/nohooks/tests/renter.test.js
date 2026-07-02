const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Set env variables for testing (using a different port and DB file to avoid conflicts)
process.env.PORT = 3100;
process.env.NODE_ENV = 'test';
process.env.TRORE_DB_PATH = path.join(__dirname, '../backend/trore.renter-test.db');

const server = require('../server');
const { getConnection, queryAll, closeDb, DB_PATH } = require('../backend/db');
const { seed } = require('../backend/seed');
const { calculateQuote, parseSearchParams } = require('../backend/renterHelper');

const API_BASE = 'http://localhost:3100';
const AUTH_HEADER = { 'X-Trore-Auth': 'v3-4-case-study' };

test.describe('Trore Renter Workflow Tests', () => {
  
  test.before(async () => {
    // Database schema will be reset & seeded
    await seed();
  });

  test.after(async () => {
    // Close the server and DB connection
    await new Promise((resolve) => server.close(resolve));
    await closeDb();
    
    // Clean up test DB file if it exists
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log(`Cleaned up test database file at ${DB_PATH}`);
    }
  });

  test.describe('Helper Logic Units', () => {
    test('calculateQuote calculates correct total price and nights', () => {
      const price = 120.00;
      // 4 nights stay
      const quote = calculateQuote(price, '2026-07-10', '2026-07-14');
      assert.strictEqual(quote.nights, 4);
      assert.strictEqual(quote.nightlyPrice, 120.00);
      assert.strictEqual(quote.totalPrice, 480.00);
      assert.ok(!quote.error);
    });

    test('calculateQuote handles invalid input and errors gracefully', () => {
      const price = 120.00;
      
      // Missing start date
      const quote1 = calculateQuote(price, null, '2026-07-14');
      assert.ok(quote1.error);
      
      // End date before start date
      const quote2 = calculateQuote(price, '2026-07-14', '2026-07-10');
      assert.ok(quote2.error);
      assert.strictEqual(quote2.error, 'Start date must be before end date');
      
      // Invalid date format
      const quote3 = calculateQuote(price, 'invalid-date', '2026-07-14');
      assert.ok(quote3.error);
      assert.strictEqual(quote3.error, 'Invalid date format');
    });

    test('parseSearchParams normalizes string parameters correctly', () => {
      const query = {
        q: ' Cozy Loft ',
        district: 'Downtown',
        min_price: '50',
        max_price: '200',
        bedrooms: '2',
        amenities: 'pool, parking , pet friendly',
        start_date: '2026-07-01',
        end_date: '2026-07-05',
        sort: 'price',
        page: '2',
        limit: '5'
      };

      const parsed = parseSearchParams(query);
      
      assert.strictEqual(parsed.q, 'Cozy Loft');
      assert.strictEqual(parsed.district, 'Downtown');
      assert.strictEqual(parsed.min_price, 50);
      assert.strictEqual(parsed.max_price, 200);
      assert.strictEqual(parsed.bedrooms, 2);
      assert.deepStrictEqual(parsed.amenities, ['pool', 'parking', 'pet friendly']);
      assert.strictEqual(parsed.start_date, '2026-07-01');
      assert.strictEqual(parsed.end_date, '2026-07-05');
      assert.strictEqual(parsed.sort, 'price');
      assert.strictEqual(parsed.page, 2);
      assert.strictEqual(parsed.limit, 5);
    });

    test('parseSearchParams sets intelligent defaults', () => {
      const parsed = parseSearchParams({});
      
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 10);
      assert.strictEqual(parsed.sort, 'relevance');
      assert.strictEqual(parsed.min_price, undefined);
      assert.strictEqual(parsed.amenities, undefined);
    });
  });

  test.describe('Auth Header Enforcement', () => {
    const endpoints = [
      { path: '/api/listings/search', method: 'GET' },
      { path: '/api/listings/1', method: 'GET' },
      { path: '/api/saved-searches', method: 'GET' },
      { path: '/api/saved-searches', method: 'POST', body: { query_params: {} } },
      { path: '/api/bookings', method: 'POST', body: {} }
    ];

    endpoints.forEach(({ path: endPath, method, body }) => {
      test(`${method} ${endPath} blocks request with missing auth header`, async () => {
        const options = { method, headers: {} };
        if (body) {
          options.body = JSON.stringify(body);
          options.headers['Content-Type'] = 'application/json';
        }
        
        const res = await fetch(`${API_BASE}${endPath}`, options);
        assert.strictEqual(res.status, 401);
        const data = await res.json();
        assert.strictEqual(data.error, 'Unauthorized');
      });

      test(`${method} ${endPath} blocks request with incorrect auth header`, async () => {
        const options = { method, headers: { 'X-Trore-Auth': 'bad-header-token' } };
        if (body) {
          options.body = JSON.stringify(body);
          options.headers['Content-Type'] = 'application/json';
        }
        
        const res = await fetch(`${API_BASE}${endPath}`, options);
        assert.strictEqual(res.status, 401);
      });
    });
  });

  test.describe('Listing Search and Filtering (GET /api/listings/search)', () => {
    test('returns only active listings by default', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search`, { headers: AUTH_HEADER });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      
      assert.ok(Array.isArray(data.listings));
      // In seed data: Downtown (Active), Beachside (Active), Westside (Active), Northside (Inactive). So 3 active listings total.
      assert.strictEqual(data.listings.length, 3);
      data.listings.forEach(l => {
        assert.strictEqual(l.is_active, 1);
      });
      assert.strictEqual(data.pagination.total, 3);
    });

    test('filters by search query text (q)', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search?q=Downtown`, { headers: AUTH_HEADER });
      const data = await res.json();
      assert.strictEqual(data.listings.length, 1);
      assert.strictEqual(data.listings[0].title, 'Charming Downtown Loft');
    });

    test('filters by district', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search?district=Westside`, { headers: AUTH_HEADER });
      const data = await res.json();
      assert.strictEqual(data.listings.length, 1);
      assert.strictEqual(data.listings[0].district, 'Westside');
    });

    test('filters by price range', async () => {
      // Find listings costing between $80 and $150
      const res = await fetch(`${API_BASE}/api/listings/search?min_price=80&max_price=150`, { headers: AUTH_HEADER });
      const data = await res.json();
      // Downtown Loft ($120), Westside Cabin ($85)
      assert.strictEqual(data.listings.length, 2);
      data.listings.forEach(l => {
        assert.ok(l.nightly_price >= 80 && l.nightly_price <= 150);
      });
    });

    test('filters by bedroom count', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search?bedrooms=2`, { headers: AUTH_HEADER });
      const data = await res.json();
      // Beachside Villa (3 beds), Westside Cabin (2 beds)
      assert.strictEqual(data.listings.length, 2);
      data.listings.forEach(l => {
        assert.ok(l.bedrooms >= 2);
      });
    });

    test('filters by multiple amenities (matches all)', async () => {
      // Beachside Villa contains pool AND parking
      const res = await fetch(`${API_BASE}/api/listings/search?amenities=pool,parking`, { headers: AUTH_HEADER });
      const data = await res.json();
      assert.strictEqual(data.listings.length, 1);
      assert.strictEqual(data.listings[0].title, 'Spacious Beachside Villa');
      assert.ok(data.listings[0].amenities.includes('pool'));
      assert.ok(data.listings[0].amenities.includes('parking'));
    });

    test('filters by date range availability', async () => {
      // Seed data contains blackout for Charming Downtown Loft (ID 1) from 2026-07-01 to 2026-07-05
      // Search during the blackout range (2026-07-02 to 2026-07-04)
      const res1 = await fetch(`${API_BASE}/api/listings/search?start_date=2026-07-02&end_date=2026-07-04`, { headers: AUTH_HEADER });
      const data1 = await res1.json();
      const loftFound = data1.listings.some(l => l.id === 1);
      assert.strictEqual(loftFound, false, 'Loft should be excluded during blackout dates');

      // Search outside blackout range (2026-07-05 to 2026-07-09)
      const res2 = await fetch(`${API_BASE}/api/listings/search?start_date=2026-07-05&end_date=2026-07-09`, { headers: AUTH_HEADER });
      const data2 = await res2.json();
      const loftFound2 = data2.listings.some(l => l.id === 1);
      assert.strictEqual(loftFound2, true, 'Loft should be available outside blackout dates');
    });

    test('sorts search results by price', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search?sort=price`, { headers: AUTH_HEADER });
      const data = await res.json();
      // Should be sorted by price asc: Cozy Westside Cabin ($85), Charming Downtown Loft ($120), Spacious Beachside Villa ($350)
      assert.strictEqual(data.listings[0].id, 3); // Cabin
      assert.strictEqual(data.listings[1].id, 1); // Loft
      assert.strictEqual(data.listings[2].id, 2); // Villa
    });

    test('sorts search results by rating', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search?sort=rating`, { headers: AUTH_HEADER });
      const data = await res.json();
      // Should be sorted by rating desc: Beachside Villa (4.9), Downtown Loft (4.8), Westside Cabin (4.5)
      assert.strictEqual(data.listings[0].id, 2);
      assert.strictEqual(data.listings[1].id, 1);
      assert.strictEqual(data.listings[2].id, 3);
    });

    test('paginates response correctly', async () => {
      const res = await fetch(`${API_BASE}/api/listings/search?page=1&limit=2`, { headers: AUTH_HEADER });
      const data = await res.json();
      
      assert.strictEqual(data.listings.length, 2);
      assert.strictEqual(data.pagination.page, 1);
      assert.strictEqual(data.pagination.limit, 2);
      assert.strictEqual(data.pagination.total, 3);
      assert.strictEqual(data.pagination.pages, 2);
    });
  });

  test.describe('Listing Details (GET /api/listings/:id)', () => {
    test('returns full listing details including host name and availability blocks', async () => {
      const res = await fetch(`${API_BASE}/api/listings/1`, { headers: AUTH_HEADER });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      
      assert.strictEqual(data.id, 1);
      assert.strictEqual(data.title, 'Charming Downtown Loft');
      assert.strictEqual(data.host_name, 'Alice (Host)');
      assert.ok(Array.isArray(data.amenities));
      assert.ok(Array.isArray(data.availability));
      // Should have 1 blackout period and 1 booked period (the booked block was added for Loft in seed data)
      assert.strictEqual(data.availability.length, 2);
      assert.strictEqual(data.availability[0].start_date, '2026-07-01');
      assert.strictEqual(data.availability[0].type, 'blackout');
    });

    test('returns 404 for non-existent listing ID', async () => {
      const res = await fetch(`${API_BASE}/api/listings/999`, { headers: AUTH_HEADER });
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.error, 'Not Found');
    });
  });

  test.describe('Saved Searches API (GET & POST /api/saved-searches)', () => {
    test('saves a query configuration and logs it in the audit trail', async () => {
      const payload = {
        renter_id: 1, // Charlie
        name: 'My Special Test Search',
        query_params: {
          district: 'Downtown',
          min_price: 100,
          amenities: ['workspace']
        }
      };

      const postRes = await fetch(`${API_BASE}/api/saved-searches`, {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(postRes.status, 201);
      
      const saved = await postRes.json();
      assert.ok(saved.id);
      assert.strictEqual(saved.name, 'My Special Test Search');
      assert.strictEqual(saved.query_params.district, 'Downtown');

      // Verify it lists in saved searches
      const getRes = await fetch(`${API_BASE}/api/saved-searches?renter_id=1`, { headers: AUTH_HEADER });
      const searches = await getRes.json();
      const found = searches.find(s => s.id === saved.id);
      assert.ok(found);
      assert.strictEqual(found.name, 'My Special Test Search');

      // Verify audit log entry was created
      const dbAudits = await queryAll(
        "SELECT * FROM audit_records WHERE action_type = 'create_saved_search' AND entity_id = ?",
        [saved.id]
      );
      assert.strictEqual(dbAudits.length, 1);
      assert.strictEqual(dbAudits[0].actor_name, 'Charlie (Renter)');
      assert.ok(dbAudits[0].summary.includes('Saved search query'));
    });
  });

  test.describe('Booking Submission API (POST /api/bookings)', () => {
    test('submits booking successfully when dates are available', async () => {
      const payload = {
        listing_id: 1, // Loft (nightly price $120)
        renter_id: 2,  // Dave
        start_date: '2026-07-25',
        end_date: '2026-07-28', // 3 nights
        guest_name: 'Dave Renter',
        guest_email: 'dave@example.com'
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(res.status, 201);
      
      const data = await res.json();
      assert.ok(data.id);
      assert.strictEqual(data.status, 'pending');
      assert.strictEqual(data.total_price, 360.00); // 3 * 120

      // Verify audit log entry
      const dbAudits = await queryAll(
        "SELECT * FROM audit_records WHERE action_type = 'create_booking' AND entity_id = ?",
        [data.id]
      );
      assert.strictEqual(dbAudits.length, 1);
      assert.strictEqual(dbAudits[0].actor_name, 'Dave (Renter)');
    });

    test('rejects booking request on inactive listing', async () => {
      const payload = {
        listing_id: 4, // Inactive Northside Studio in seed data
        renter_id: 1,
        start_date: '2026-07-25',
        end_date: '2026-07-28',
        guest_name: 'Charlie',
        guest_email: 'charlie@example.com'
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error, 'Inactive Listing');
    });

    test('rejects booking request if dates overlap blackout dates', async () => {
      const payload = {
        listing_id: 1, // Loft blackout is 2026-07-01 to 2026-07-05
        renter_id: 1,
        start_date: '2026-07-03',
        end_date: '2026-07-07',
        guest_name: 'Charlie',
        guest_email: 'charlie@example.com'
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error, 'Dates Unavailable');
    });
  });
});
