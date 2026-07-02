import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { app, server } from '../src/server.js';
import { resetDatabase, seedDatabase } from '../src/db/seed.js';

test('C5 Invariants and Integration Hardening Verification', async (t) => {
  before(() => {
    resetDatabase();
    seedDatabase();
  });

  after(() => {
    server.close();
  });

  // Test 1: URL Query Parameter Parsing / defaults
  await t.test('Search: handles invalid pagination query parameters gracefully with defaults', async () => {
    const res = await fetch('http://localhost:3000/api/listings?page=invalid&limit=abc', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.pagination.page, 1, 'Default page should be 1');
    assert.strictEqual(body.pagination.limit, 6, 'Default limit should be 6');
  });

  await t.test('Search: handles array and comma-separated amenities correctly', async () => {
    const resComma = await fetch('http://localhost:3000/api/listings?amenities=pool,parking', {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(resComma.status, 200);
    const bodyComma = await resComma.json();
    
    // Each returned listing should have both pool and parking
    for (const listing of bodyComma.data) {
      assert.ok(listing.amenities.includes('pool'), 'Listing should have pool');
      assert.ok(listing.amenities.includes('parking'), 'Listing should have parking');
    }
  });

  // Test 2: Authorization Header Checks
  await t.test('Auth: endpoints reject missing or wrong X-Trore-Auth header', async () => {
    // 1. Host listings endpoint
    const resHost = await fetch('http://localhost:3000/api/host/listings?actor_id=1');
    assert.strictEqual(resHost.status, 401, 'Should require X-Trore-Auth');

    // 2. Admin logs endpoint
    const resAdmin = await fetch('http://localhost:3000/api/admin/audit-logs?actor_id=4', {
      headers: { 'X-Trore-Auth': 'wrong-auth-header' }
    });
    assert.strictEqual(resAdmin.status, 401, 'Should reject invalid X-Trore-Auth');

    // 3. Saved searches endpoint
    const resSaved = await fetch('http://localhost:3000/api/saved-searches?actor_id=3');
    assert.strictEqual(resSaved.status, 401, 'Should require X-Trore-Auth');
  });

  // Test 3: Database Persistence
  await t.test('Database: entities persist across connections/restarts', async () => {
    const dbPath = './trore.db';
    
    // Connect, insert, close
    {
      const db = new DatabaseSync(dbPath);
      db.exec(`
        INSERT INTO audit_records (actor_id, actor_name, action_type, entity_type, entity_id, summary)
        VALUES (1, 'Alice', 'CREATE', 'TEST', 999, 'Test persistence log')
      `);
      db.close();
    }

    // Connect again, read, verify, delete test log, close
    {
      const db = new DatabaseSync(dbPath);
      const stmt = db.prepare('SELECT * FROM audit_records WHERE actor_id = 1 AND entity_id = 999');
      const rows = stmt.all();
      assert.strictEqual(rows.length, 1, 'Row should persist across connections');
      assert.strictEqual(rows[0].summary, 'Test persistence log');
      
      // Clean up
      db.exec('DELETE FROM audit_records WHERE actor_id = 1 AND entity_id = 999');
      db.close();
    }
  });

  // Test 4: Booking Collision / Centralized Validation
  await t.test('Booking Collision: cannot approve booking overlapping already approved booking', async () => {
    // Let's find/create two bookings for the same listing that overlap.
    // Booking 1: approved. Booking 2: pending.
    // If host tries to approve Booking 2, it should return 400.
    const db = new DatabaseSync('./trore.db');
    
    // Clear and insert test records
    db.exec('DELETE FROM booking_requests');
    db.exec(`
      INSERT INTO booking_requests (id, listing_id, renter_id, start_date, end_date, total_price, status, renter_name, renter_email)
      VALUES 
        (100, 1, 3, '2026-09-10', '2026-09-15', 500.0, 'approved', 'Charlie', 'charlie@example.com'),
        (101, 1, 3, '2026-09-12', '2026-09-14', 200.0, 'pending', 'Charlie', 'charlie@example.com')
    `);
    db.close();

    // Now try to approve booking 101 (overlaps with 100)
    const resApprove = await fetch('http://localhost:3000/api/host/bookings/101', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v3-4-case-study'
      },
      body: JSON.stringify({
        actor_id: 1, // Alice owns listing 1
        status: 'approved'
      })
    });

    assert.strictEqual(resApprove.status, 400, 'Should reject approval of overlapping booking');
    const body = await resApprove.json();
    assert.match(body.message, /overlap/i, 'Error message should complain about overlap');

    // Clean up test records
    const dbClean = new DatabaseSync('./trore.db');
    dbClean.exec('DELETE FROM booking_requests WHERE id IN (100, 101)');
    dbClean.close();
  });
});
