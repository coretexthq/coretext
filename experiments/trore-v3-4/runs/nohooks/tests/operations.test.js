const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Set env variables for testing
process.env.PORT = 3101;
process.env.NODE_ENV = 'test';
process.env.TRORE_DB_PATH = path.join(__dirname, '../backend/trore.operations-test.db');

const server = require('../server');
const { getConnection, queryAll, queryGet, closeDb, DB_PATH } = require('../backend/db');
const { seed } = require('../backend/seed');

const API_BASE = 'http://localhost:3101';
const AUTH_HEADER = 'v3-4-case-study';

test.describe('Trore Host Operations Tests', () => {
  
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

  test.describe('GET /api/host/listings', () => {
    test('retrieves listings owned by authenticated host', async () => {
      const res = await fetch(`${API_BASE}/api/host/listings`, {
        headers: {
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1' // Alice
        }
      });
      assert.strictEqual(res.status, 200);
      const listings = await res.json();
      assert.strictEqual(listings.length, 2);
      assert.strictEqual(listings[0].host_id, 1);
      assert.ok(listings.every(l => l.host_id === 1));
    });

    test('blocks request with missing host actor id header', async () => {
      const res = await fetch(`${API_BASE}/api/host/listings`, {
        headers: {
          'X-Trore-Auth': AUTH_HEADER
        }
      });
      assert.strictEqual(res.status, 400);
    });

    test('blocks request with invalid host actor id', async () => {
      const res = await fetch(`${API_BASE}/api/host/listings`, {
        headers: {
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '999'
        }
      });
      assert.strictEqual(res.status, 403);
    });
  });

  test.describe('POST /api/host/listings', () => {
    test('creates new listing for authenticated host', async () => {
      const payload = {
        title: 'New Cozy Cottage',
        district: 'Westside',
        nightly_price: 150.00,
        bedrooms: 2,
        amenities: ['parking', 'workspace'],
        description: 'Charming newly created cottage'
      };

      const res = await fetch(`${API_BASE}/api/host/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1' // Alice
        },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.ok(data.id);
      assert.strictEqual(data.title, 'New Cozy Cottage');
      assert.strictEqual(data.host_id, 1);

      // Verify audit log
      const audit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ?', ['create_listing', data.id]);
      assert.ok(audit);
      assert.strictEqual(audit.actor_id, 1);
      assert.strictEqual(audit.actor_type, 'host');
    });
  });

  test.describe('PUT /api/host/listings/:id', () => {
    test('updates details for host-owned listing', async () => {
      const payload = {
        title: 'Updated Downtown Loft',
        district: 'Downtown',
        nightly_price: 130.00,
        bedrooms: 1,
        amenities: ['air conditioning', 'parking'],
        description: 'Modern loft'
      };

      const res = await fetch(`${API_BASE}/api/host/listings/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1' // Alice (owns listing 1)
        },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.title, 'Updated Downtown Loft');

      // Verify audit log
      const audit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ?', ['edit_listing', 1]);
      assert.ok(audit);
    });

    test('rejects update by host who does not own the listing', async () => {
      const payload = {
        title: 'Unauthorized Edit',
        district: 'Downtown',
        nightly_price: 130.00,
        bedrooms: 1
      };

      const res = await fetch(`${API_BASE}/api/host/listings/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '2' // Bob (does not own listing 1)
        },
        body: JSON.stringify(payload)
      });
      assert.strictEqual(res.status, 403);
    });
  });

  test.describe('POST /api/host/listings/:id/status', () => {
    test('publishes/unpublishes a listing', async () => {
      // Unpublish listing 1
      let res = await fetch(`${API_BASE}/api/host/listings/1/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1'
        },
        body: JSON.stringify({ is_active: false })
      });
      assert.strictEqual(res.status, 200);
      let data = await res.json();
      assert.strictEqual(data.is_active, 0);

      // Verify audit log
      let audit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ? ORDER BY timestamp DESC', ['unpublish_listing', 1]);
      assert.ok(audit);

      // Re-publish listing 1
      res = await fetch(`${API_BASE}/api/host/listings/1/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1'
        },
        body: JSON.stringify({ is_active: true })
      });
      assert.strictEqual(res.status, 200);
      data = await res.json();
      assert.strictEqual(data.is_active, 1);
    });

    test('rejects status change by non-owner host', async () => {
      const res = await fetch(`${API_BASE}/api/host/listings/1/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '2' // Bob
        },
        body: JSON.stringify({ is_active: false })
      });
      assert.strictEqual(res.status, 403);
    });
  });

  test.describe('POST & DELETE /api/host/listings/:id/blackouts', () => {
    test('adds and removes a blackout date range', async () => {
      // Add blackout
      let res = await fetch(`${API_BASE}/api/host/listings/1/blackouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1'
        },
        body: JSON.stringify({
          start_date: '2026-09-01',
          end_date: '2026-09-10'
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.ok(data.id);
      
      // Verify audit log
      const audit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ?', ['update_availability', data.id]);
      assert.ok(audit);

      // Delete blackout
      res = await fetch(`${API_BASE}/api/host/listings/1/blackouts/${data.id}`, {
        method: 'DELETE',
        headers: {
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1'
        }
      });
      assert.strictEqual(res.status, 200);

      // Verify deletion in DB
      const block = await queryGet('SELECT * FROM availability_blocks WHERE id = ?', [data.id]);
      assert.strictEqual(block, undefined);

      // Verify delete audit log
      const deleteAudit = await queryGet('SELECT * FROM audit_records WHERE action_type = ? AND entity_id = ?', ['delete_availability', data.id]);
      assert.ok(deleteAudit);
    });

    test('rejects adding blackout with invalid range', async () => {
      const res = await fetch(`${API_BASE}/api/host/listings/1/blackouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '1'
        },
        body: JSON.stringify({
          start_date: '2026-09-10',
          end_date: '2026-09-01' // Start after end
        })
      });
      assert.strictEqual(res.status, 400);
    });

    test('rejects adding blackout by non-owner host', async () => {
      const res = await fetch(`${API_BASE}/api/host/listings/1/blackouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': AUTH_HEADER,
          'X-Trore-Actor-Id': '2'
        },
        body: JSON.stringify({
          start_date: '2026-09-01',
          end_date: '2026-09-10'
        })
      });
      assert.strictEqual(res.status, 403);
    });
  });
});
