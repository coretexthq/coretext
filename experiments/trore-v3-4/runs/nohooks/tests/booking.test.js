const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Set env variables for testing
process.env.PORT = 3102;
process.env.NODE_ENV = 'test';
process.env.TRORE_DB_PATH = path.join(__dirname, '../backend/trore.booking-test.db');

const server = require('../server');
const { getConnection, queryAll, queryGet, queryRun, closeDb, DB_PATH } = require('../backend/db');
const { seed } = require('../backend/seed');

const API_BASE = 'http://localhost:3102';
const AUTH_HEADER = { 'X-Trore-Auth': 'v3-4-case-study' };

test.describe('Trore Booking Review & Validation Tests', () => {
  
  test.before(async () => {
    // Reset and seed database
    await seed();
  });

  test.after(async () => {
    // Close server and database
    await new Promise((resolve) => server.close(resolve));
    await closeDb();
    
    // Clean up test DB file
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log(`Cleaned up test database file at ${DB_PATH}`);
    }
  });

  test.describe('Booking Approval/Decline Permissions', () => {
    test('host who owns the listing can approve a booking request', async () => {
      // Seed a pending booking request on listing 1 (owned by Host 1 - Alice)
      const resInsert = await queryRun(
        `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
         VALUES (1, 2, '2026-09-01', '2026-09-05', 480.00, 'pending', 'Dave', 'dave@example.com')`
      );
      const bookingId = resInsert.lastID;

      // Approve booking request as Host 1 (Alice)
      const res = await fetch(`${API_BASE}/api/host/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          ...AUTH_HEADER,
          'Content-Type': 'application/json',
          'X-Trore-Actor-Id': '1' // Alice
        },
        body: JSON.stringify({ status: 'approved' })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'approved');

      // Verify booking status is updated in DB
      const booking = await queryGet('SELECT * FROM booking_requests WHERE id = ?', [bookingId]);
      assert.strictEqual(booking.status, 'approved');

      // Verify availability block is created
      const block = await queryGet('SELECT * FROM availability_blocks WHERE listing_id = 1 AND start_date = ? AND type = ?', ['2026-09-01', 'booked']);
      assert.ok(block);

      // Verify audit log entry
      const audit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ?', ['approve_booking', bookingId]);
      assert.ok(audit);
      assert.strictEqual(audit.actor_name, 'Alice (Host)');
    });

    test('host who does not own the listing cannot approve the booking request', async () => {
      // Seed another pending booking request on listing 1 (owned by Host 1 - Alice)
      const resInsert = await queryRun(
        `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
         VALUES (1, 2, '2026-09-10', '2026-09-15', 600.00, 'pending', 'Dave', 'dave@example.com')`
      );
      const bookingId = resInsert.lastID;

      // Attempt to approve as Host 2 (Bob)
      const res = await fetch(`${API_BASE}/api/host/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          ...AUTH_HEADER,
          'Content-Type': 'application/json',
          'X-Trore-Actor-Id': '2' // Bob (non-owner)
        },
        body: JSON.stringify({ status: 'approved' })
      });

      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.error, 'Forbidden');

      // Verify booking request is still pending
      const booking = await queryGet('SELECT * FROM booking_requests WHERE id = ?', [bookingId]);
      assert.strictEqual(booking.status, 'pending');
    });

    test('host who owns the listing can decline a booking request', async () => {
      // Seed a pending booking request on listing 1
      const resInsert = await queryRun(
        `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
         VALUES (1, 2, '2026-09-20', '2026-09-25', 600.00, 'pending', 'Dave', 'dave@example.com')`
      );
      const bookingId = resInsert.lastID;

      // Decline booking request as Host 1 (Alice)
      const res = await fetch(`${API_BASE}/api/host/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          ...AUTH_HEADER,
          'Content-Type': 'application/json',
          'X-Trore-Actor-Id': '1' // Alice
        },
        body: JSON.stringify({ status: 'declined' })
      });

      assert.strictEqual(res.status, 200);
      
      const booking = await queryGet('SELECT * FROM booking_requests WHERE id = ?', [bookingId]);
      assert.strictEqual(booking.status, 'declined');

      // Verify audit log entry
      const audit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ?', ['decline_booking', bookingId]);
      assert.ok(audit);
    });

    test('host who does not own the listing cannot decline the booking request', async () => {
      // Seed a pending booking request on listing 1
      const resInsert = await queryRun(
        `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
         VALUES (1, 2, '2026-09-26', '2026-09-30', 480.00, 'pending', 'Dave', 'dave@example.com')`
      );
      const bookingId = resInsert.lastID;

      // Attempt to decline as Host 2 (Bob)
      const res = await fetch(`${API_BASE}/api/host/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          ...AUTH_HEADER,
          'Content-Type': 'application/json',
          'X-Trore-Actor-Id': '2' // Bob (non-owner)
        },
        body: JSON.stringify({ status: 'declined' })
      });

      assert.strictEqual(res.status, 403);
      
      const booking = await queryGet('SELECT * FROM booking_requests WHERE id = ?', [bookingId]);
      assert.strictEqual(booking.status, 'pending');
    });
  });

  test.describe('Date Range Overlap & Blackout Validations', () => {
    test('prevent booking approval if it overlaps with an existing blackout or booking block', async () => {
      // Seed a blackout block for listing 1: 2026-10-05 to 2026-10-10
      await queryRun(
        `INSERT INTO availability_blocks (listing_id, start_date, end_date, type)
         VALUES (1, '2026-10-05', '2026-10-10', 'blackout')`
      );

      // Seed a pending booking request that overlaps: 2026-10-08 to 2026-10-12
      const resInsert = await queryRun(
        `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
         VALUES (1, 2, '2026-10-08', '2026-10-12', 480.00, 'pending', 'Dave', 'dave@example.com')`
      );
      const bookingId = resInsert.lastID;

      // Approve booking request as Host 1 (Alice)
      const res = await fetch(`${API_BASE}/api/host/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          ...AUTH_HEADER,
          'Content-Type': 'application/json',
          'X-Trore-Actor-Id': '1' // Alice
        },
        body: JSON.stringify({ status: 'approved' })
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error, 'Dates Unavailable');

      const booking = await queryGet('SELECT * FROM booking_requests WHERE id = ?', [bookingId]);
      assert.strictEqual(booking.status, 'pending');
    });

    test('prevent adding blackout date range if it overlaps with existing bookings or blackout blocks', async () => {
      // Listing 1 has approved booking from seed data: 2026-07-10 to 2026-07-14 (type: 'booked')
      // Try to add blackout that overlaps: 2026-07-12 to 2026-07-16
      const res = await fetch(`${API_BASE}/api/host/listings/1/blackouts`, {
        method: 'POST',
        headers: {
          ...AUTH_HEADER,
          'Content-Type': 'application/json',
          'X-Trore-Actor-Id': '1' // Alice
        },
        body: JSON.stringify({
          start_date: '2026-07-12',
          end_date: '2026-07-16'
        })
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error, 'Dates Unavailable');
    });
  });
});
