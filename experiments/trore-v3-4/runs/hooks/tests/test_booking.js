const assert = require('assert');
const { allAsync, db, runAsync, getAsync } = require('../src/db');
const { app } = require('../server');

const testPort = 3004;
const baseUrl = `http://localhost:${testPort}`;
const authHeaders = {
  'X-Trore-Auth': 'v3-4-case-study',
  'Content-Type': 'application/json'
};

// Helper to reset the database and re-seed it so tests run in a clean environment
async function resetDb() {
  console.log('- Resetting and re-seeding database for tests...');
  // We can call seed script logic inline or clean up
  await runAsync('DELETE FROM audit_records');
  await runAsync('DELETE FROM booking_requests');
  await runAsync('DELETE FROM availability');
  await runAsync('DELETE FROM listings');
  await runAsync('DELETE FROM hosts');

  // Insert seed data
  // 1. Hosts
  await runAsync("INSERT INTO hosts (id, name, email) VALUES (1, 'Alice Vance', 'alice@example.com')");
  await runAsync("INSERT INTO hosts (id, name, email) VALUES (2, 'Bob Miller', 'bob@example.com')");

  // 2. Listings
  // Alice Vance (host_id = 1) listings
  await runAsync(`
    INSERT INTO listings (id, title, district, nightly_price, bedrooms, amenities, status, host_id, rating)
    VALUES (1, 'Sleek Modern Loft', 'Downtown', 150.0, 2, '["wifi", "workspace"]', 'active', 1, 4.5)
  `);
  await runAsync(`
    INSERT INTO listings (id, title, district, nightly_price, bedrooms, amenities, status, host_id, rating)
    VALUES (2, 'Cozy Historic Townhouse', 'Back Bay', 200.0, 3, '["wifi", "parking"]', 'active', 1, 4.8)
  `);

  // Bob Miller (host_id = 2) listings
  await runAsync(`
    INSERT INTO listings (id, title, district, nightly_price, bedrooms, amenities, status, host_id, rating)
    VALUES (3, 'Spacious Garden Apartment', 'Cambridge', 120.0, 1, '["wifi"]', 'active', 2, 4.2)
  `);

  // 3. Blackouts (availability)
  await runAsync("INSERT INTO availability (id, listing_id, start_date, end_date) VALUES (1, 1, '2026-07-10', '2026-07-15')");

  // 4. Booking requests
  // Alice Vance's listing #1 bookings
  await runAsync(`
    INSERT INTO booking_requests (id, listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
    VALUES (1, 1, 'Emma Watson', 'emma@example.com', '2026-07-01', '2026-07-05', 600.0, 'pending')
  `);
  await runAsync(`
    INSERT INTO booking_requests (id, listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
    VALUES (2, 1, 'Dave Jones', 'dave@example.com', '2026-07-03', '2026-07-08', 750.0, 'pending')
  `);
  await runAsync(`
    INSERT INTO booking_requests (id, listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
    VALUES (3, 1, 'Grace Hopper', 'grace@example.com', '2026-07-20', '2026-07-25', 750.0, 'pending')
  `);

  // Bob Miller's listing #3 bookings
  await runAsync(`
    INSERT INTO booking_requests (id, listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
    VALUES (4, 3, 'John Smith', 'john@example.com', '2026-07-01', '2026-07-05', 480.0, 'pending')
  `);
}

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING TRORE BOOKING LIFECYCLE AUTOMATED TESTS');
  console.log('==================================================\n');

  // Start test server
  const serverInstance = app.listen(testPort);
  console.log(`- Test server listening on ${baseUrl}\n`);

  try {
    await resetDb();

    // -----------------------------------------------------------------
    // TEST 1: Retrieve Bookings for Host listings (GET /api/host/bookings)
    // -----------------------------------------------------------------
    console.log('\nStep 1: Testing GET /api/host/bookings endpoint...');

    // 1a. Alice Vance (host_id = 1) retrieves bookings -> should return bookings for listings 1 and 2
    const aliceRes = await fetch(`${baseUrl}/api/host/bookings`, {
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(aliceRes.status, 200, 'Alice should be authorized');
    const aliceBookings = await aliceRes.json();
    console.log(`- Alice Vance bookings retrieved: ${aliceBookings.length} (Expected: 3)`);
    assert.strictEqual(aliceBookings.length, 3, 'Alice should have 3 booking requests');
    // Ensure all returned bookings belong to listing 1 or 2
    aliceBookings.forEach(b => {
      assert.ok([1, 2].includes(b.listing_id), 'Booking must belong to Alice Vance listings');
    });

    // 1b. Bob Miller retrieves bookings -> should return bookings for listing 3
    const bobRes = await fetch(`${baseUrl}/api/host/bookings`, {
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Bob Miller'
      }
    });
    assert.strictEqual(bobRes.status, 200);
    const bobBookings = await bobRes.json();
    console.log(`- Bob Miller bookings retrieved: ${bobBookings.length} (Expected: 1)`);
    assert.strictEqual(bobBookings.length, 1);
    assert.strictEqual(bobBookings[0].listing_id, 3);

    // 1c. Unauthorized host header check
    const badHostRes = await fetch(`${baseUrl}/api/host/bookings`, {
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Fake Host'
      }
    });
    assert.strictEqual(badHostRes.status, 401, 'Should reject non-existent host');

    // -----------------------------------------------------------------
    // TEST 2: Host Ownership Authorization Checks on Mutations
    // -----------------------------------------------------------------
    console.log('\nStep 2: Testing host ownership check on booking approve/decline...');

    // Alice Vance tries to approve Bob Miller's booking request (ID 4) -> 403 Forbidden
    const aliceApproveBobRes = await fetch(`${baseUrl}/api/host/bookings/4/approve`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(aliceApproveBobRes.status, 403, 'Should forbid host from approving others booking requests');

    // Alice Vance tries to decline Bob Miller's booking request (ID 4) -> 403 Forbidden
    const aliceDeclineBobRes = await fetch(`${baseUrl}/api/host/bookings/4/decline`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(aliceDeclineBobRes.status, 403, 'Should forbid host from declining others booking requests');

    // -----------------------------------------------------------------
    // TEST 3: Approve booking request & overlap auto-rejection
    // -----------------------------------------------------------------
    console.log('\nStep 3: Testing booking approval and automated decline of overlaps...');

    // Booking request 1: Sleek Modern Loft, Emma Watson, '2026-07-01' to '2026-07-05', pending
    // Booking request 2: Sleek Modern Loft, Dave Jones, '2026-07-03' to '2026-07-08', pending (overlaps with request 1)
    // Booking request 3: Sleek Modern Loft, Grace Hopper, '2026-07-20' to '2026-07-25', pending (does not overlap)

    // Approve booking request 1 as Alice Vance
    const approveRes = await fetch(`${baseUrl}/api/host/bookings/1/approve`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(approveRes.status, 200, 'Should approve booking successfully');

    // Verify booking 1 is now approved
    const b1 = await getAsync('SELECT * FROM booking_requests WHERE id = 1');
    assert.strictEqual(b1.status, 'approved', 'Booking 1 status should be approved');

    // Verify booking 2 (overlapping pending request) is now automatically declined
    const b2 = await getAsync('SELECT * FROM booking_requests WHERE id = 2');
    assert.strictEqual(b2.status, 'declined', 'Overlapping booking 2 status should be declined');

    // Verify booking 3 (non-overlapping pending request) remains pending
    const b3 = await getAsync('SELECT * FROM booking_requests WHERE id = 3');
    assert.strictEqual(b3.status, 'pending', 'Non-overlapping booking 3 status should remain pending');

    // Verify audit logs for approval and automatic decline
    const approvalLogs = await allAsync("SELECT * FROM audit_records WHERE action_type = 'APPROVE_BOOKING' AND entity_id = 1");
    assert.strictEqual(approvalLogs.length, 1, 'Should record approval audit log');
    assert.ok(approvalLogs[0].summary.includes('approved booking request #1'), 'Summary should contain booking details');

    const autoDeclineLogs = await allAsync("SELECT * FROM audit_records WHERE action_type = 'DECLINE_BOOKING' AND entity_id = 2");
    assert.strictEqual(autoDeclineLogs.length, 1, 'Should record auto-decline audit log');
    assert.ok(autoDeclineLogs[0].summary.includes('automatically declined due to overlap'), 'Summary should indicate overlap reason');

    // -----------------------------------------------------------------
    // TEST 4: Decline booking request
    // -----------------------------------------------------------------
    console.log('\nStep 4: Testing manual decline...');

    // Decline booking request 3 as Alice Vance
    const declineRes = await fetch(`${baseUrl}/api/host/bookings/3/decline`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(declineRes.status, 200, 'Should decline booking successfully');

    // Verify booking 3 is now declined
    const b3After = await getAsync('SELECT * FROM booking_requests WHERE id = 3');
    assert.strictEqual(b3After.status, 'declined', 'Booking 3 should be declined');

    // Verify audit log for decline
    const declineLogs = await allAsync("SELECT * FROM audit_records WHERE action_type = 'DECLINE_BOOKING' AND entity_id = 3 AND summary NOT LIKE '%automatically%'");
    assert.strictEqual(declineLogs.length, 1, 'Should record manual decline audit log');
    assert.ok(declineLogs[0].summary.includes('declined booking request #3'), 'Summary should match');

    // -----------------------------------------------------------------
    // TEST 5: Overlapping Rejection Rules (Block double bookings & blackouts)
    // -----------------------------------------------------------------
    console.log('\nStep 5: Testing date overlap validations on approval...');

    // Let's create a new pending request that overlaps with approved booking #1 (2026-07-01 to 2026-07-05)
    await runAsync(`
      INSERT INTO booking_requests (id, listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
      VALUES (5, 1, 'Test Overlap', 'test@example.com', '2026-07-04', '2026-07-06', 300.0, 'pending')
    `);

    // Attempt to approve booking #5 -> should fail because of overlap with approved #1
    const approveOverlapRes = await fetch(`${baseUrl}/api/host/bookings/5/approve`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(approveOverlapRes.status, 400, 'Should block approving overlapping dates');
    const overlapData = await approveOverlapRes.json();
    assert.strictEqual(overlapData.error, 'Unavailable');
    assert.strictEqual(overlapData.message, 'Selected dates are already booked.');

    // Let's create another pending request that overlaps with blackout dates (2026-07-10 to 2026-07-15)
    await runAsync(`
      INSERT INTO booking_requests (id, listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
      VALUES (6, 1, 'Test Blackout', 'test@example.com', '2026-07-12', '2026-07-14', 300.0, 'pending')
    `);

    // Attempt to approve booking #6 -> should fail because of overlap with blackout
    const approveBlackoutRes = await fetch(`${baseUrl}/api/host/bookings/6/approve`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(approveBlackoutRes.status, 400, 'Should block approving dates overlapping blackouts');
    const blackoutData = await approveBlackoutRes.json();
    assert.strictEqual(blackoutData.error, 'Unavailable');
    assert.strictEqual(blackoutData.message, 'Selected dates overlap with host blackout dates.');

    // -----------------------------------------------------------------
    // TEST 6: Audit log retrieval (GET /api/admin/audit-logs)
    // -----------------------------------------------------------------
    console.log('\nStep 6: Testing GET /api/admin/audit-logs retrieval...');

    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: authHeaders
    });
    assert.strictEqual(auditRes.status, 200);
    const auditLogs = await auditRes.json();
    console.log(`- Total audit logs retrieved: ${auditLogs.length}`);
    assert.ok(auditLogs.length >= 3, 'Should return at least the approve/decline logs we generated');

    // Verify schema of first log
    const log = auditLogs[0];
    assert.ok(log.timestamp);
    assert.ok(log.actor);
    assert.ok(log.action_type);
    assert.ok(log.entity_type);
    assert.ok(log.summary);

    console.log('\n==================================================');
    console.log('🎉 ALL BOOKING OPERATIONS TESTS PASSED SUCCESSFULLY');
    console.log('==================================================');

    db.close();
    serverInstance.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILURE ENCOUNTERED:');
    console.error(error);
    try { db.close(); } catch (e) {}
    try { serverInstance.close(); } catch (e) {}
    process.exit(1);
  }
}

runTests();
