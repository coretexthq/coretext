import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { app, server } from '../src/server.js';
import { resetDatabase, seedDatabase } from '../src/db/seed.js';

test('Express Server and Middleware Verification', async (t) => {
  before(() => {
    resetDatabase();
    seedDatabase();
  });

  after(() => {
    server.close();
  });

  // 1. Auth Headers Checks
  await t.test('API health check endpoint rejects request without X-Trore-Auth header', async () => {
    const res = await fetch('http://localhost:3000/api/health');
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized');
    const body = await res.json();
    assert.strictEqual(body.error, 'Unauthorized');
  });

  await t.test('API health check endpoint rejects request with wrong X-Trore-Auth header', async () => {
    const res = await fetch('http://localhost:3000/api/health', {
      headers: { 'X-Trore-Auth': 'incorrect-token' }
    });
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized');
  });

  await t.test('API health check endpoint returns 200 and stats with correct X-Trore-Auth header', async () => {
    const res = await fetch('http://localhost:3000/api/health', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.ok(body.db, 'Database stats should be present');
    assert.strictEqual(body.db.actors, 5, 'Should report 5 actors');
    assert.strictEqual(body.db.listings, 5, 'Should report 5 listings');
  });

  // 2. Listing Search (GET /api/listings)
  await t.test('Search: return all published listings by default, excluding unpublished ones', async () => {
    const res = await fetch('http://localhost:3000/api/listings', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.strictEqual(body.data.length, 4, 'Should return exactly 4 published listings');
    // Verify listing 5 (unpublished Hidden Forest Cabin) is not present
    const unpublished = body.data.find(l => l.id === 5);
    assert.strictEqual(unpublished, undefined, 'Unpublished listing should not be returned');
  });

  await t.test('Search: filter by text query', async () => {
    const res = await fetch('http://localhost:3000/api/listings?search=loft', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    assert.strictEqual(body.data.length, 1);
    assert.strictEqual(body.data[0].title, 'Charming Downtown Loft');
  });

  await t.test('Search: filter by district', async () => {
    const res = await fetch('http://localhost:3000/api/listings?district=Beachside', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    assert.strictEqual(body.data.length, 1);
    assert.strictEqual(body.data[0].district, 'Beachside');
  });

  await t.test('Search: filter by price range', async () => {
    const res = await fetch('http://localhost:3000/api/listings?min_price=100&max_price=300', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    // Loft (120), Bungalow (200). Villa (500) and Studio (80) excluded.
    assert.strictEqual(body.data.length, 2);
    const prices = body.data.map(l => l.nightly_price);
    assert.ok(prices.includes(120));
    assert.ok(prices.includes(200));
  });

  await t.test('Search: filter by bedrooms count (minimum)', async () => {
    const res = await fetch('http://localhost:3000/api/listings?bedrooms=3', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    // Bungalow (3), Villa (5). Loft (2) and Studio (1) excluded.
    assert.strictEqual(body.data.length, 2);
  });

  await t.test('Search: filter by amenities', async () => {
    const res = await fetch('http://localhost:3000/api/listings?amenities=pool,pet friendly', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    // Bungalow and Villa have both pool and pet friendly
    assert.strictEqual(body.data.length, 2);
    body.data.forEach(l => {
      assert.ok(l.amenities.includes('pool'));
      assert.ok(l.amenities.includes('pet friendly'));
    });
  });

  await t.test('Search: filter by date range availability', async () => {
    // July 11-13 (Loft ID 1 has blackout on July 10-15) -> should exclude Loft
    const res = await fetch('http://localhost:3000/api/listings?start_date=2026-07-11&end_date=2026-07-13', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    const loft = body.data.find(l => l.id === 1);
    assert.strictEqual(loft, undefined, 'Loft should be excluded due to blackout');

    // July 22-24 (Loft ID 1 has approved booking on July 20-25) -> should exclude Loft
    const res2 = await fetch('http://localhost:3000/api/listings?start_date=2026-07-22&end_date=2026-07-24', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body2 = await res2.json();
    const loft2 = body2.data.find(l => l.id === 1);
    assert.strictEqual(loft2, undefined, 'Loft should be excluded due to approved booking');
  });

  await t.test('Search: sorting options', async () => {
    // Sort price_asc
    const resAsc = await fetch('http://localhost:3000/api/listings?sort=price_asc', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const bodyAsc = await resAsc.json();
    assert.strictEqual(bodyAsc.data[0].nightly_price, 80); // Studio
    assert.strictEqual(bodyAsc.data[3].nightly_price, 500); // Villa

    // Sort rating
    const resRating = await fetch('http://localhost:3000/api/listings?sort=rating', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const bodyRating = await resRating.json();
    assert.strictEqual(bodyRating.data[0].rating, 5.0); // Villa
  });

  await t.test('Search: pagination metadata', async () => {
    const res = await fetch('http://localhost:3000/api/listings?limit=2&page=2', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const body = await res.json();
    assert.strictEqual(body.data.length, 2);
    assert.strictEqual(body.pagination.total, 4);
    assert.strictEqual(body.pagination.page, 2);
    assert.strictEqual(body.pagination.limit, 2);
    assert.strictEqual(body.pagination.pages, 2);
  });

  // 3. Listing Detail (GET /api/listings/:id)
  await t.test('Detail: return full listing details including host name and blackouts', async () => {
    const res = await fetch('http://localhost:3000/api/listings/1', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.strictEqual(body.data.title, 'Charming Downtown Loft');
    assert.strictEqual(body.data.host_name, 'Alice');
    assert.ok(Array.isArray(body.data.amenities));
    assert.ok(body.data.blackouts.length >= 2, 'Should include both blackouts and bookings');
  });

  // 4. Saved Searches (GET & POST /api/saved-searches)
  await t.test('Saved Searches: create, list, and log audit', async () => {
    const filters = { district: 'Downtown', bedrooms: 2 };
    const payload = {
      actor_id: 3, // Charlie
      name: 'Downtown 2 Bed Loft',
      filters
    };
    const postRes = await fetch('http://localhost:3000/api/saved-searches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(postRes.status, 201);
    const postBody = await postRes.json();
    assert.ok(postBody.success);
    assert.strictEqual(postBody.data.name, 'Downtown 2 Bed Loft');

    // Retrieve
    const getRes = await fetch('http://localhost:3000/api/saved-searches?actor_id=3', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(getRes.status, 200);
    const getBody = await getRes.json();
    assert.ok(getBody.success);
    // Find the saved search we just created
    const saved = getBody.data.find(s => s.id === postBody.data.id);
    assert.ok(saved);
    assert.strictEqual(saved.name, 'Downtown 2 Bed Loft');
    assert.strictEqual(saved.filters.district, 'Downtown');
  });

  // 5. Booking Validation (POST /api/booking-requests)
  await t.test('Booking: validate overlap dates, price quotes, and audit logging', async () => {
    // Valid request
    const payload = {
      listing_id: 1, // Loft (120/night)
      renter_id: 4, // Diana
      start_date: '2026-07-01',
      end_date: '2026-07-04', // 3 nights -> 360 total
      renter_name: 'Diana',
      renter_email: 'diana@example.com'
    };

    const resValid = await fetch('http://localhost:3000/api/booking-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(resValid.status, 201);
    const bodyValid = await resValid.json();
    assert.ok(bodyValid.success);
    assert.strictEqual(bodyValid.data.total_price, 360);

    // Overlap blackout date (blackout exists July 10-15)
    const payloadOverlap = {
      ...payload,
      start_date: '2026-07-09',
      end_date: '2026-07-11'
    };
    const resOverlap = await fetch('http://localhost:3000/api/booking-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify(payloadOverlap)
    });
    assert.strictEqual(resOverlap.status, 400);
    const bodyOverlap = await resOverlap.json();
    assert.match(bodyOverlap.message, /overlap/i);

    // Inactive listing (listing 5 is published=0)
    const payloadInactive = {
      ...payload,
      listing_id: 5
    };
    const resInactive = await fetch('http://localhost:3000/api/booking-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify(payloadInactive)
    });
    assert.strictEqual(resInactive.status, 400);
    const bodyInactive = await resInactive.json();
    assert.match(bodyInactive.message, /active/i);
  });

  // 6. Host Operations & Permission Checks (C3 Targets)
  await t.test('Host: get listings owned by host', async () => {
    const res = await fetch('http://localhost:3000/api/host/listings?actor_id=1', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    // Alice owns listings 1, 2, and 5
    assert.strictEqual(body.data.length, 3);
    const ids = body.data.map(l => l.id);
    assert.ok(ids.includes(1));
    assert.ok(ids.includes(2));
    assert.ok(ids.includes(5));
    assert.ok(!ids.includes(3), "Should not contain Bob's listing");
  });

  await t.test('Host: reject unauthorized listing modification (403)', async () => {
    // Bob (actor_id 2) tries to edit Alice's listing (id 1)
    const payload = {
      actor_id: 2,
      title: 'Hacked Title',
      district: 'Downtown',
      nightly_price: 999.0,
      bedrooms: 2,
      amenities: 'parking',
      short_description: 'Hacked short description'
    };
    const res = await fetch('http://localhost:3000/api/host/listings/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 403, 'Should reject with 403 Forbidden');
    const body = await res.json();
    assert.match(body.message, /own/i);
  });

  await t.test('Host: allow authorized listing modification and write audit log', async () => {
    const payload = {
      actor_id: 1, // Alice owns listing 1
      title: 'Alice Updated Loft',
      district: 'Downtown',
      nightly_price: 150.0,
      bedrooms: 2,
      amenities: 'air conditioning, parking',
      short_description: 'Updated short description',
      description: 'Updated full description'
    };
    const res = await fetch('http://localhost:3000/api/host/listings/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.strictEqual(body.data.title, 'Alice Updated Loft');

    // Retrieve details to double check
    const detailRes = await fetch('http://localhost:3000/api/listings/1', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const detail = await detailRes.json();
    assert.strictEqual(detail.data.title, 'Alice Updated Loft');
  });

  await t.test('Host: reject unauthorized publication toggle (403)', async () => {
    // Bob (2) tries to toggle Alice's listing (1)
    const res = await fetch('http://localhost:3000/api/host/listings/1/publish', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({ actor_id: 2 })
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('Host: allow authorized publication toggle and log audit', async () => {
    // Alice toggles her listing (1)
    const res = await fetch('http://localhost:3000/api/host/listings/1/publish', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({ actor_id: 1 })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    // Initially was 1, so it toggles to 0
    assert.strictEqual(body.data.is_published, 0);
  });

  await t.test('Host: reject unauthorized blackout range changes (403)', async () => {
    // Bob (2) tries to add blackout to Alice's listing (1)
    const resAdd = await fetch('http://localhost:3000/api/host/listings/1/blackouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        actor_id: 2,
        start_date: '2026-09-01',
        end_date: '2026-09-05'
      })
    });
    assert.strictEqual(resAdd.status, 403);

    // Bob tries to delete Alice's blackout (ID: 1)
    const resDel = await fetch('http://localhost:3000/api/host/listings/1/blackouts/1?actor_id=2', {
      method: 'DELETE',
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(resDel.status, 403);
  });

  await t.test('Host: allow authorized blackout additions and deletions', async () => {
    // Alice adds blackout to her listing (1)
    const resAdd = await fetch('http://localhost:3000/api/host/listings/1/blackouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        actor_id: 1,
        start_date: '2026-09-01',
        end_date: '2026-09-05'
      })
    });
    assert.strictEqual(resAdd.status, 201);
    const bodyAdd = await resAdd.json();
    const blackoutId = bodyAdd.data.id;

    // Alice deletes that blackout
    const resDel = await fetch(`http://localhost:3000/api/host/listings/1/blackouts/${blackoutId}?actor_id=1`, {
      method: 'DELETE',
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(resDel.status, 200);
  });

  await t.test('Host: reject unauthorized booking status updates (403)', async () => {
    // Bob (2) tries to approve booking request 1 (listing 1 owned by Alice)
    const res = await fetch('http://localhost:3000/api/host/bookings/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({ actor_id: 2, status: 'approved' })
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('Host: allow authorized booking status updates and log audit', async () => {
    // Booking request 2 is for listing 3 (owned by Bob, actor 2)
    // Bob approves booking request 2
    const res = await fetch('http://localhost:3000/api/host/bookings/2', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({ actor_id: 2, status: 'approved' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.status, 'approved');
  });

  // --- Checkpoint C4 Target Verification Tests ---

  // 1. Admin/Reviewer API Endpoint Verification
  await t.test('Admin: GET /api/admin/audit-logs enforces X-Trore-Auth header', async () => {
    const res = await fetch('http://localhost:3000/api/admin/audit-logs');
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized without auth header');
  });

  await t.test('Admin: GET /api/admin/audit-logs returns complete history with correct headers', async () => {
    // Admin user seeded is actor 5 (Admin reviewer)
    const res = await fetch('http://localhost:3000/api/admin/audit-logs?actor_id=5', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0, 'Audit logs should contain seeded events');
    
    // Check fields of the audit record
    const record = body.data[0];
    assert.ok(record.timestamp, 'Record should have timestamp');
    assert.ok(record.actor_id, 'Record should have actor_id');
    assert.ok(record.actor_name, 'Record should have actor_name');
    assert.ok(record.action_type, 'Record should have action_type');
    assert.ok(record.entity_type, 'Record should have entity_type');
    assert.ok(record.summary, 'Record should have summary');
  });

  await t.test('Admin: GET /api/admin/audit-logs rejects non-reviewer actors', async () => {
    // Actor 3 (Charlie) is a renter, should be rejected if actor_id parameter is passed and role is checked
    const res = await fetch('http://localhost:3000/api/admin/audit-logs?actor_id=3', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 403, 'Should reject renter with 403 Forbidden');
  });

  // 2. Booking collision validation (approving a booking declines overlapping pending requests)
  await t.test('Booking Collision: approving a booking request automatically declines overlapping pending requests', async () => {
    // Let's create two pending overlapping booking requests for listing 2 (owned by Alice, actor 1)
    // Request A: 2026-10-01 to 2026-10-05 (to be approved)
    // Request B: 2026-10-03 to 2026-10-07 (to be auto-declined)
    const resA = await fetch('http://localhost:3000/api/booking-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        listing_id: 2,
        renter_id: 3,
        start_date: '2026-10-01',
        end_date: '2026-10-05',
        renter_name: 'Charlie',
        renter_email: 'charlie@example.com'
      })
    });
    const bookingA = await resA.json();
    const idA = bookingA.data.id;

    const resB = await fetch('http://localhost:3000/api/booking-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        listing_id: 2,
        renter_id: 4,
        start_date: '2026-10-03',
        end_date: '2026-10-07',
        renter_name: 'Diana',
        renter_email: 'diana@example.com'
      })
    });
    const bookingB = await resB.json();
    const idB = bookingB.data.id;

    // Approve booking A (Alice actor 1 approves)
    const approveRes = await fetch(`http://localhost:3000/api/host/bookings/${idA}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({ actor_id: 1, status: 'approved' })
    });
    assert.strictEqual(approveRes.status, 200);

    // Verify booking B is now declined
    // We can fetch bookings for listing 2 as Host Alice (actor 1)
    const bookingsRes = await fetch('http://localhost:3000/api/host/bookings?actor_id=1', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    const bookings = await bookingsRes.json();
    const resolvedB = bookings.data.find(b => b.id === idB);
    assert.strictEqual(resolvedB.status, 'declined', 'Overlapping pending booking should be automatically declined');
  });

  // 3. Blackout vs. approved booking overlap validations
  await t.test('Blackout Overlap: host cannot approve a booking request overlapping a blackout period', async () => {
    // Approved booking on listing 1: July 20-25 (seeded)
    // Host Alice tries to add blackout on July 22-24
    const resAddBlackout = await fetch('http://localhost:3000/api/host/listings/1/blackouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        actor_id: 1,
        start_date: '2026-07-22',
        end_date: '2026-07-24'
      })
    });
    assert.strictEqual(resAddBlackout.status, 400, 'Should reject blackout addition overlapping approved booking');
    const bodyBlackout = await resAddBlackout.json();
    assert.match(bodyBlackout.message, /overlaps with/i);
  });

  // 4. Robust ownership checks
  await t.test('Ownership Check: renter Charlie cannot modify host Alice listings', async () => {
    // Charlie (actor 3) is a renter. Alice owns listing 1.
    const res = await fetch('http://localhost:3000/api/host/listings/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        actor_id: 3, // Charlie
        title: 'Hacked Title',
        district: 'Downtown',
        nightly_price: 150.0,
        bedrooms: 2,
        amenities: 'parking',
        short_description: 'Updated description'
      })
    });
    assert.strictEqual(res.status, 403, 'Should return 403 Forbidden for renter mutating listing');
  });

  await t.test('Ownership Check: host Bob cannot modify host Alice listings', async () => {
    // Bob (actor 2) is a host. Alice (actor 1) owns listing 1.
    const res = await fetch('http://localhost:3000/api/host/listings/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        actor_id: 2, // Bob
        title: 'Bob Updated Title',
        district: 'Downtown',
        nightly_price: 150.0,
        bedrooms: 2,
        amenities: 'parking',
        short_description: 'Bob description'
      })
    });
    assert.strictEqual(res.status, 403, 'Should return 403 Forbidden for unauthorized host mutating listing');
  });
});
