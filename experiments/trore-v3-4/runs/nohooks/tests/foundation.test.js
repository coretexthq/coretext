const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Set env variables for testing
process.env.PORT = 3099;
process.env.NODE_ENV = 'test';
process.env.TRORE_DB_PATH = path.join(__dirname, '../backend/trore.foundation-test.db');

const server = require('../server');
const { getConnection, queryAll, initDbSchema, closeDb, DB_PATH } = require('../backend/db');
const { seed } = require('../backend/seed');

const API_BASE = 'http://localhost:3099';

test.describe('Trore Foundation Tests', () => {
  
  test.before(async () => {
    // Database schema will be reset & seeded
    await seed();
  });

  test.after(async () => {
    // Close the server and DB connection
    await new Promise((resolve) => server.close(resolve));
    await closeDb();
    
    // Clean up test DB file
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log(`Cleaned up test database file at ${DB_PATH}`);
    }
  });

  test.describe('Database & Seeding Persistence', () => {
    test('verify hosts are seeded correctly', async () => {
      const hosts = await queryAll('SELECT * FROM hosts');
      assert.strictEqual(hosts.length, 2);
      assert.strictEqual(hosts[0].name, 'Alice (Host)');
      assert.strictEqual(hosts[1].name, 'Bob (Host)');
    });

    test('verify listings are seeded and reference correct hosts', async () => {
      const listings = await queryAll('SELECT * FROM listings');
      assert.strictEqual(listings.length, 4);
      
      const aliceListings = listings.filter(l => l.host_id === 1);
      const bobListings = listings.filter(l => l.host_id === 2);
      
      assert.strictEqual(aliceListings.length, 2);
      assert.strictEqual(bobListings.length, 2);
      
      assert.strictEqual(aliceListings[0].title, 'Charming Downtown Loft');
      assert.strictEqual(bobListings[0].title, 'Cozy Westside Cabin');
    });

    test('verify availability blocks are seeded correctly', async () => {
      const blocks = await queryAll('SELECT * FROM availability_blocks');
      // 2 blackouts + 1 approved booking block = 3 blocks total
      assert.strictEqual(blocks.length, 3);
      
      const blackout = blocks.find(b => b.type === 'blackout');
      assert.ok(blackout);
      assert.strictEqual(blackout.start_date, '2026-07-01');
    });

    test('verify audit logs are created for seed data operations', async () => {
      const audits = await queryAll('SELECT * FROM audit_records');
      assert.ok(audits.length > 0);
      
      const createListingAudit = audits.find(a => a.action_type === 'create_listing');
      assert.ok(createListingAudit);
      assert.ok(createListingAudit.summary.includes('Created listing'));
    });
  });

  test.describe('API Authentication & Endpoints', () => {
    test('public health endpoint does not require auth header', async () => {
      const res = await fetch(`${API_BASE}/api/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'OK');
      assert.ok(data.timestamp);
    });

    test('protected listings endpoint returns 401 when auth header is missing', async () => {
      const res = await fetch(`${API_BASE}/api/protected/listings`);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.error, 'Unauthorized');
      assert.strictEqual(data.message, 'Missing or invalid X-Trore-Auth header');
    });

    test('protected listings endpoint returns 401 when auth header is incorrect', async () => {
      const res = await fetch(`${API_BASE}/api/protected/listings`, {
        headers: { 'X-Trore-Auth': 'wrong-auth-key' }
      });
      assert.strictEqual(res.status, 401);
    });

    test('protected listings endpoint succeeds with correct auth header', async () => {
      const res = await fetch(`${API_BASE}/api/protected/listings`, {
        headers: { 'X-Trore-Auth': 'v3-4-case-study' }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length, 4);
      assert.strictEqual(data[0].title, 'Charming Downtown Loft');
    });

    test('protected hosts endpoint succeeds with correct auth header', async () => {
      const res = await fetch(`${API_BASE}/api/protected/hosts`, {
        headers: { 'X-Trore-Auth': 'v3-4-case-study' }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length, 2);
    });

    test('protected renters endpoint succeeds with correct auth header', async () => {
      const res = await fetch(`${API_BASE}/api/protected/renters`, {
        headers: { 'X-Trore-Auth': 'v3-4-case-study' }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length, 2);
    });
  });
});
