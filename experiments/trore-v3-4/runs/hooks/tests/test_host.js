const assert = require('assert');
const { allAsync, db } = require('../src/db');
const { app } = require('../server');

const testPort = 3003;
const baseUrl = `http://localhost:${testPort}`;
const authHeaders = {
  'X-Trore-Auth': 'v3-4-case-study',
  'Content-Type': 'application/json'
};

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING TRORE HOST OPERATIONS AUTOMATED TESTS');
  console.log('==================================================\n');

  // Start test server
  const serverInstance = app.listen(testPort);
  console.log(`- Test server listening on ${baseUrl}\n`);

  try {
    // -----------------------------------------------------------------
    // TEST 1: Authentication & Authorization Enforcements
    // -----------------------------------------------------------------
    console.log('Step 1: Testing auth and host identity enforcement...');

    // 1a. GET /api/host/listings without X-Trore-Auth -> 401
    const noAuthRes = await fetch(`${baseUrl}/api/host/listings`);
    assert.strictEqual(noAuthRes.status, 401, 'Should require X-Trore-Auth header');

    // 1b. GET /api/host/listings with X-Trore-Auth but no X-Trore-Host -> 401
    const noHostRes = await fetch(`${baseUrl}/api/host/listings`, {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(noHostRes.status, 401, 'Should require host header');

    // 1c. GET /api/host/listings with correct headers for Alice Vance -> 200
    const aliceRes = await fetch(`${baseUrl}/api/host/listings`, {
      headers: {
        'X-Trore-Auth': 'v3-4-case-study',
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(aliceRes.status, 200);
    const aliceListings = await aliceRes.json();
    console.log(`- Alice Vance listings count: ${aliceListings.length} (Expected: 2)`);
    assert.strictEqual(aliceListings.length, 2, 'Alice Vance should own exactly 2 listings');
    console.log('  ✅ Auth and host selector checks passed.\n');

    // -----------------------------------------------------------------
    // TEST 2: Listing Creation
    // -----------------------------------------------------------------
    console.log('Step 2: Testing listing creation...');
    const createPayload = {
      title: 'Alice Cabin in the Woods',
      district: 'Cambridge',
      nightly_price: 135.0,
      bedrooms: 2,
      amenities: ['workspace', 'parking'],
      description: 'A cozy remote cabin.'
    };

    const createRes = await fetch(`${baseUrl}/api/host/listings`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      },
      body: JSON.stringify(createPayload)
    });
    assert.strictEqual(createRes.status, 201, 'Should create listing successfully');
    const createdListing = await createRes.json();
    console.log(`- Created listing ID: ${createdListing.id}`);
    assert.strictEqual(createdListing.title, 'Alice Cabin in the Woods');
    assert.strictEqual(createdListing.status, 'active');

    // Verify audit log for creation
    const creationAudit = await allAsync(
      "SELECT * FROM audit_records WHERE action_type = 'CREATE_LISTING' AND entity_id = ?",
      [createdListing.id]
    );
    assert.strictEqual(creationAudit.length, 1);
    assert.ok(creationAudit[0].summary.includes('Alice Vance'));
    console.log('  ✅ Listing creation checks passed.\n');

    // -----------------------------------------------------------------
    // TEST 3: Listing Editing
    // -----------------------------------------------------------------
    console.log('Step 3: Testing listing editing...');
    const editPayload = {
      title: 'Alice Updated Cabin',
      district: 'Cambridge',
      nightly_price: 150.0,
      bedrooms: 2,
      amenities: ['workspace', 'parking', 'pool'],
      description: 'An updated cozy cabin.'
    };

    const editRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      },
      body: JSON.stringify(editPayload)
    });
    assert.strictEqual(editRes.status, 200, 'Should edit listing successfully');

    // Verify change in database
    const dbListing = await allAsync('SELECT * FROM listings WHERE id = ?', [createdListing.id]);
    assert.strictEqual(dbListing[0].title, 'Alice Updated Cabin');
    assert.strictEqual(dbListing[0].nightly_price, 150.0);

    // Verify audit log for edit
    const editAudit = await allAsync(
      "SELECT * FROM audit_records WHERE action_type = 'EDIT_LISTING' AND entity_id = ?",
      [createdListing.id]
    );
    assert.strictEqual(editAudit.length, 1);
    console.log('  ✅ Listing editing checks passed.\n');

    // -----------------------------------------------------------------
    // TEST 4: Publish/Unpublish Toggle
    // -----------------------------------------------------------------
    console.log('Step 4: Testing publish and unpublish toggling...');

    // Unpublish
    const unpublishRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}/unpublish`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(unpublishRes.status, 200);
    const dbListingUnpublished = await allAsync('SELECT * FROM listings WHERE id = ?', [createdListing.id]);
    assert.strictEqual(dbListingUnpublished[0].status, 'inactive', 'Listing should be inactive');

    // Publish
    const publishRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}/publish`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(publishRes.status, 200);
    const dbListingPublished = await allAsync('SELECT * FROM listings WHERE id = ?', [createdListing.id]);
    assert.strictEqual(dbListingPublished[0].status, 'active', 'Listing should be active');
    console.log('  ✅ Publish/Unpublish toggle checks passed.\n');

    // -----------------------------------------------------------------
    // TEST 5: Blackout Management
    // -----------------------------------------------------------------
    console.log('Step 5: Testing blackout management (add/delete)...');

    // Add Blackout
    const blackoutRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}/blackouts`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      },
      body: JSON.stringify({
        start_date: '2026-12-01',
        end_date: '2026-12-07'
      })
    });
    assert.strictEqual(blackoutRes.status, 201);
    const blackoutData = await blackoutRes.json();
    assert.strictEqual(blackoutData.start_date, '2026-12-01');

    // Verify blackout exists in DB
    const dbBlackouts = await allAsync('SELECT * FROM availability WHERE listing_id = ?', [createdListing.id]);
    assert.strictEqual(dbBlackouts.length, 1);
    assert.strictEqual(dbBlackouts[0].start_date, '2026-12-01');

    // Delete Blackout
    const deleteBlackoutRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}/blackouts/${blackoutData.id}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Alice Vance'
      }
    });
    assert.strictEqual(deleteBlackoutRes.status, 200);

    // Verify blackout deleted from DB
    const dbBlackoutsAfter = await allAsync('SELECT * FROM availability WHERE listing_id = ?', [createdListing.id]);
    assert.strictEqual(dbBlackoutsAfter.length, 0);
    console.log('  ✅ Blackout management checks passed.\n');

    // -----------------------------------------------------------------
    // TEST 6: Ownership Check Security
    // -----------------------------------------------------------------
    console.log('Step 6: Testing backend host ownership verification...');

    // Bob Miller tries to edit Alice's listing -> 403 Forbidden
    const unauthorizedEditRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Bob Miller'
      },
      body: JSON.stringify(editPayload)
    });
    console.log(`- Bob Miller editing Alice Vance's listing status: ${unauthorizedEditRes.status} (Expected: 403)`);
    assert.strictEqual(unauthorizedEditRes.status, 403, 'Should block host from editing listing they do not own');

    // Bob Miller tries to manage blackouts for Alice's listing -> 403 Forbidden
    const unauthorizedBlackoutRes = await fetch(`${baseUrl}/api/host/listings/${createdListing.id}/blackouts`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-Trore-Host': 'Bob Miller'
      },
      body: JSON.stringify({
        start_date: '2026-12-01',
        end_date: '2026-12-07'
      })
    });
    assert.strictEqual(unauthorizedBlackoutRes.status, 403, 'Should block host from adding blackouts to listing they do not own');
    console.log('  ✅ Host ownership enforcement checks passed.\n');

    console.log('==================================================');
    console.log('🎉 ALL HOST OPERATIONS TESTS PASSED SUCCESSFULLY');
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
