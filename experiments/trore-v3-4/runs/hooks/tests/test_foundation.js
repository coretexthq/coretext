const assert = require('assert');
const { allAsync, db } = require('../src/db');
const { app } = require('../server');

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING TRORE APPLICATION FOUNDATION SMOKE TESTS');
  console.log('==================================================\n');

  try {
    // -----------------------------------------------------------------
    // TEST 1: Database Persistence & Seed Data Verification
    // -----------------------------------------------------------------
    console.log('Step 1: Verifying SQLite schema integrity & seed data...');

    // Verify hosts count
    const hosts = await allAsync('SELECT * FROM hosts');
    console.log(`- Verified Hosts Count: ${hosts.length} (Expected: 3)`);
    assert.strictEqual(hosts.length, 3, 'Hosts count should be exactly 3.');

    // Verify listings count
    const listings = await allAsync('SELECT * FROM listings');
    console.log(`- Verified Listings Count: ${listings.length} (Expected: 6)`);
    assert.strictEqual(listings.length, 6, 'Listings count should be exactly 6.');

    // Verify availability (blackouts) count
    const availability = await allAsync('SELECT * FROM availability');
    console.log(`- Verified Blackouts Count: ${availability.length} (Expected: 3)`);
    assert.strictEqual(availability.length, 3, 'Availability blackout records count should be exactly 3.');

    // Verify booking requests count
    const bookings = await allAsync('SELECT * FROM booking_requests');
    console.log(`- Verified Booking Requests Count: ${bookings.length} (Expected: 3)`);
    assert.strictEqual(bookings.length, 3, 'Booking requests count should be exactly 3.');

    // Verify saved searches count
    const searches = await allAsync('SELECT * FROM saved_searches');
    console.log(`- Verified Saved Searches Count: ${searches.length} (Expected: 2)`);
    assert.strictEqual(searches.length, 2, 'Saved searches count should be exactly 2.');

    // Verify audit logs
    const audits = await allAsync('SELECT * FROM audit_records');
    console.log(`- Verified Audit Records Count: ${audits.length} (Expected: >0)`);
    assert.ok(audits.length > 0, 'Audit records should have been created during seeding.');

    console.log('✅ Database schema and seed data verification passed!\n');

    // -----------------------------------------------------------------
    // TEST 2: Express Server & Middleware Route Verification
    // -----------------------------------------------------------------
    console.log('Step 2: Starting API server to verify endpoints...');
    const testPort = 3001;
    
    // Start a separate listener for testing
    const serverInstance = app.listen(testPort);
    const baseUrl = `http://localhost:${testPort}`;

    console.log(`- Test server listening on ${baseUrl}`);

    try {
      // 2a. Health check endpoint
      console.log('- Testing /api/health endpoint...');
      const healthRes = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(healthRes.status, 200, 'Health check should return status 200');
      
      const healthJson = await healthRes.json();
      assert.strictEqual(healthJson.status, 'ok', 'Health check status should be "ok"');
      assert.strictEqual(healthJson.database, 'connected', 'Database connection should report "connected"');
      console.log('  ✅ Health check passed.');

      // 2b. Protected route rejection (no auth header)
      console.log('- Testing protected route without X-Trore-Auth header...');
      const noHeaderRes = await fetch(`${baseUrl}/api/protected-test`);
      assert.strictEqual(noHeaderRes.status, 401, 'Protected route should return 401 without auth header');
      
      const noHeaderJson = await noHeaderRes.json();
      assert.strictEqual(noHeaderJson.error, 'Unauthorized', 'Error type should be "Unauthorized"');
      console.log('  ✅ Missing auth header rejection passed.');

      // 2c. Protected route rejection (wrong auth header)
      console.log('- Testing protected route with invalid X-Trore-Auth header...');
      const wrongHeaderRes = await fetch(`${baseUrl}/api/protected-test`, {
        headers: { 'X-Trore-Auth': 'invalid-token' }
      });
      assert.strictEqual(wrongHeaderRes.status, 401, 'Protected route should return 401 with wrong auth header');
      console.log('  ✅ Invalid auth header rejection passed.');

      // 2d. Protected route success (correct auth header)
      console.log('- Testing protected route with correct X-Trore-Auth header...');
      const correctHeaderRes = await fetch(`${baseUrl}/api/protected-test`, {
        headers: { 'X-Trore-Auth': 'v3-4-case-study' }
      });
      assert.strictEqual(correctHeaderRes.status, 200, 'Protected route should return 200 with correct auth header');
      
      const correctHeaderJson = await correctHeaderRes.json();
      assert.ok(correctHeaderJson.message.includes('successful'), 'Response message should report success');
      console.log('  ✅ Valid auth header access passed.');

      console.log('✅ API server and Trore auth middleware verification passed!\n');
    } finally {
      // Always close test server
      await new Promise((resolve) => serverInstance.close(resolve));
      console.log('- Test server shut down.');
    }

    console.log('==================================================');
    console.log('🎉 ALL FOUNDATION SMOKE TESTS PASSED SUCCESSFULLY');
    console.log('==================================================');
    
    // Close db connection to clean up open file descriptors
    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILURE ENCOUNTERED:');
    console.error(error);
    
    // Ensure database connection is closed
    try { db.close(); } catch (e) {}
    process.exit(1);
  }
}

runTests();
