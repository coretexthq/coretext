const assert = require('assert');
const { allAsync, db, runAsync } = require('../src/db');
const { app } = require('../server');

const testPort = 3002;
const baseUrl = `http://localhost:${testPort}`;
const authHeaders = {
  'X-Trore-Auth': 'v3-4-case-study',
  'Content-Type': 'application/json'
};

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING TRORE RENTER ENDPOINT AUTOMATED TESTS');
  console.log('==================================================\n');

  // Start test server
  const serverInstance = app.listen(testPort);
  console.log(`- Test server listening on ${baseUrl}\n`);

  try {
    // -----------------------------------------------------------------
    // TEST 1: API Authentication Check
    // -----------------------------------------------------------------
    console.log('Step 1: Verifying authentication enforcement...');

    // 1a. GET /api/listings without header -> 401
    const noHeaderRes = await fetch(`${baseUrl}/api/listings`);
    assert.strictEqual(noHeaderRes.status, 401, 'Should block access without auth header');
    
    // 1b. GET /api/listings with wrong header -> 401
    const wrongHeaderRes = await fetch(`${baseUrl}/api/listings`, {
      headers: { 'X-Trore-Auth': 'incorrect-token' }
    });
    assert.strictEqual(wrongHeaderRes.status, 401, 'Should block access with incorrect auth header');

    // 1c. GET /api/listings with correct header -> 200
    const authRes = await fetch(`${baseUrl}/api/listings`, {
      headers: { 'X-Trore-Auth': 'v3-4-case-study' }
    });
    assert.strictEqual(authRes.status, 200, 'Should allow access with correct auth header');
    console.log('  ✅ API Auth checks passed.\n');

    // -----------------------------------------------------------------
    // TEST 2: Listings Filtering, Sorting, and Pagination
    // -----------------------------------------------------------------
    console.log('Step 2: Testing /api/listings filtering & search...');

    // 2a. Fetch all active listings (expect 5 active out of 6 total seeded)
    const allRes = await fetch(`${baseUrl}/api/listings`, { headers: authHeaders });
    const allData = await allRes.json();
    console.log(`- Active listings found: ${allData.listings.length} (Expected: 5)`);
    assert.strictEqual(allData.listings.length, 5, 'Should return all 5 active listings by default');
    // Ensure inactive listing is filtered out
    const inactiveFound = allData.listings.find(l => l.status === 'inactive');
    assert.strictEqual(inactiveFound, undefined, 'Inactive listings must not be returned');

    // 2b. District filter
    const districtRes = await fetch(`${baseUrl}/api/listings?district=Downtown`, { headers: authHeaders });
    const districtData = await districtRes.json();
    console.log(`- Downtown district listings: ${districtData.listings.length} (Expected: 1)`);
    assert.strictEqual(districtData.listings.length, 1, 'Should return exactly 1 active Downtown loft');
    assert.strictEqual(districtData.listings[0].district, 'Downtown');

    // 2c. Price range filter (minPrice=100 & maxPrice=200)
    const priceRes = await fetch(`${baseUrl}/api/listings?minPrice=100&maxPrice=200`, { headers: authHeaders });
    const priceData = await priceRes.json();
    console.log(`- Price range $100-$200 count: ${priceData.listings.length} (Expected: 2)`);
    assert.strictEqual(priceData.listings.length, 2, 'Should return Loft and Cambridge');

    // 2d. Bedrooms count filter (bedrooms >= 2)
    const bedRes = await fetch(`${baseUrl}/api/listings?bedrooms=2`, { headers: authHeaders });
    const bedData = await bedRes.json();
    console.log(`- Listings with >= 2 bedrooms: ${bedData.listings.length} (Expected: 3)`);
    assert.strictEqual(bedData.listings.length, 3, 'Should return Loft (2), Penthouse (3), and Cambridge (2)');

    // 2e. Amenities filter (pool & parking)
    const amenityRes = await fetch(`${baseUrl}/api/listings?amenities=pool,parking`, { headers: authHeaders });
    const amenityData = await amenityRes.json();
    console.log(`- Listings with pool & parking: ${amenityData.listings.length} (Expected: 2)`);
    assert.strictEqual(amenityData.listings.length, 2, 'Should return Loft and Penthouse');

    // 2f. Date range availability filter
    // Listing 1 (Loft) blackout: 2026-07-10 to 2026-07-15
    // Listing 1 approved booking: 2026-07-01 to 2026-07-05
    // If we search 2026-07-03 to 2026-07-08 -> Listing 1 should NOT be returned (blocked by approved booking)
    const dateBlockedRes = await fetch(`${baseUrl}/api/listings?startDate=2026-07-03&endDate=2026-07-08`, { headers: authHeaders });
    const dateBlockedData = await dateBlockedRes.json();
    const loftFound = dateBlockedData.listings.find(l => l.title.includes('Loft'));
    console.log(`- Searching dates 2026-07-03 to 2026-07-08. Loft returned: ${!!loftFound} (Expected: false)`);
    assert.strictEqual(loftFound, undefined, 'Loft should be filtered out due to booking overlap');

    // If we search 2026-07-06 to 2026-07-09 -> Listing 1 should be returned (no overlap)
    const dateAvailableRes = await fetch(`${baseUrl}/api/listings?startDate=2026-07-06&endDate=2026-07-09`, { headers: authHeaders });
    const dateAvailableData = await dateAvailableRes.json();
    const loftFound2 = dateAvailableData.listings.find(l => l.title.includes('Loft'));
    console.log(`- Searching dates 2026-07-06 to 2026-07-09. Loft returned: ${!!loftFound2} (Expected: true)`);
    assert.ok(loftFound2, 'Loft should be returned since dates are clear');

    // 2g. Sorting (by price ascending)
    const sortPriceRes = await fetch(`${baseUrl}/api/listings?sortBy=price`, { headers: authHeaders });
    const sortPriceData = await sortPriceRes.json();
    console.log(`- Cheapest listing: ${sortPriceData.listings[0].title} (Price: $${sortPriceData.listings[0].nightly_price})`);
    assert.strictEqual(sortPriceData.listings[0].nightly_price, 95.0, 'Cheapest should be Cozy North End Studio at 95.0');

    // 2h. Pagination (limit=2, page=1)
    const paginatedRes = await fetch(`${baseUrl}/api/listings?limit=2&page=1`, { headers: authHeaders });
    const paginatedData = await paginatedRes.json();
    console.log(`- Page 1 count: ${paginatedData.listings.length}, total listings: ${paginatedData.total}, total pages: ${paginatedData.totalPages}`);
    assert.strictEqual(paginatedData.listings.length, 2);
    assert.strictEqual(paginatedData.total, 5);
    assert.strictEqual(paginatedData.totalPages, 3);
    console.log('  ✅ Filtering, sorting, and pagination tests passed.\n');

    // -----------------------------------------------------------------
    // TEST 3: Listing Detail View
    // -----------------------------------------------------------------
    console.log('Step 3: Testing /api/listings/:id detail view...');
    
    // Get Loft ID
    const loftId = loftFound2.id;
    const detailRes = await fetch(`${baseUrl}/api/listings/${loftId}`, { headers: authHeaders });
    const detailData = await detailRes.json();
    
    console.log(`- Listing detail title: "${detailData.listing.title}"`);
    console.log(`- Listing detail host: "${detailData.listing.host_name}"`);
    console.log(`- Blackouts returned: ${detailData.blackouts.length}`);
    console.log(`- Approved bookings returned: ${detailData.bookings.length}`);
    
    assert.strictEqual(detailData.listing.title, 'Sleek Modern Loft in Downtown');
    assert.strictEqual(detailData.listing.host_name, 'Alice Vance');
    assert.strictEqual(detailData.blackouts.length, 2); // 2 seeded blackout ranges for Loft
    assert.strictEqual(detailData.bookings.length, 1);  // 1 approved booking request for Loft
    console.log('  ✅ Detail view tests passed.\n');

    // -----------------------------------------------------------------
    // TEST 4: Saved Searches Persistence & Reloading
    // -----------------------------------------------------------------
    console.log('Step 4: Testing /api/saved-searches endpoint...');

    const searchPayload = {
      renter_name: 'Test Renter',
      filters: {
        district: 'South End',
        minPrice: 200,
        maxPrice: 600,
        bedrooms: 3,
        amenities: ['pool']
      }
    };

    // 4a. Create a saved search
    const createSearchRes = await fetch(`${baseUrl}/api/saved-searches`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(searchPayload)
    });
    assert.strictEqual(createSearchRes.status, 201, 'Should successfully create saved search');
    const createdSearch = await createSearchRes.json();
    assert.strictEqual(createdSearch.renter_name, 'Test Renter');
    assert.strictEqual(createdSearch.filters.district, 'South End');

    // 4b. Get saved searches for Test Renter
    const getSearchRes = await fetch(`${baseUrl}/api/saved-searches?renter_name=Test%20Renter`, {
      headers: authHeaders
    });
    const getSearchData = await getSearchRes.json();
    console.log(`- Saved searches for Test Renter: ${getSearchData.length} (Expected: 1)`);
    assert.strictEqual(getSearchData.length, 1);
    assert.strictEqual(getSearchData[0].filters.district, 'South End');
    console.log('  ✅ Saved search persistence and reloading tests passed.\n');

    // -----------------------------------------------------------------
    // TEST 5: Booking Request Validation
    // -----------------------------------------------------------------
    console.log('Step 5: Testing /api/booking-requests validation & creation...');

    // 5a. Try booking dates overlapping with host blackouts (July 10-15)
    const blackoutBookingRes = await fetch(`${baseUrl}/api/booking-requests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        listing_id: loftId,
        renter_name: 'Emma Watson',
        renter_email: 'emma@renter.com',
        start_date: '2026-07-12',
        end_date: '2026-07-14'
      })
    });
    console.log(`- Booking during blackout dates status: ${blackoutBookingRes.status} (Expected: 400)`);
    assert.strictEqual(blackoutBookingRes.status, 400);
    const blackoutJson = await blackoutBookingRes.json();
    assert.ok(blackoutJson.message.includes('blackout'));

    // 5b. Try booking dates overlapping with approved booking (July 1-5)
    const approvedBookingOverlapRes = await fetch(`${baseUrl}/api/booking-requests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        listing_id: loftId,
        renter_name: 'Emma Watson',
        renter_email: 'emma@renter.com',
        start_date: '2026-07-02',
        end_date: '2026-07-04'
      })
    });
    console.log(`- Booking during approved booking dates status: ${approvedBookingOverlapRes.status} (Expected: 400)`);
    assert.strictEqual(approvedBookingOverlapRes.status, 400);
    const approvedJson = await approvedBookingOverlapRes.json();
    assert.ok(approvedJson.message.includes('already booked'));

    // 5c. Submit a valid booking request (July 6-9)
    const validBookingRes = await fetch(`${baseUrl}/api/booking-requests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        listing_id: loftId,
        renter_name: 'Emma Watson',
        renter_email: 'emma@renter.com',
        start_date: '2026-07-06',
        end_date: '2026-07-09'
      })
    });
    console.log(`- Valid booking creation status: ${validBookingRes.status} (Expected: 201)`);
    assert.strictEqual(validBookingRes.status, 201);
    const validBookingJson = await validBookingRes.json();
    assert.strictEqual(validBookingJson.status, 'pending');
    // Total price check: 3 nights * 150.0 nightly price = 450.0
    console.log(`- Total calculated price: $${validBookingJson.total_price} (Expected: $450)`);
    assert.strictEqual(validBookingJson.total_price, 450.0);

    // Verify audit record creation
    const latestAudit = await allAsync('SELECT * FROM audit_records ORDER BY id DESC LIMIT 1');
    console.log(`- Latest Audit Record Summary: "${latestAudit[0].summary}"`);
    assert.ok(latestAudit[0].summary.includes('Emma Watson created booking request'));
    console.log('  ✅ Booking request validation and creation tests passed.\n');

    console.log('==================================================');
    console.log('🎉 ALL RENTER ENDPOINT TESTS PASSED SUCCESSFULLY');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ TEST FAILURE ENCOUNTERED:');
    console.error(error);
    process.exit(1);
  } finally {
    // Close server
    await new Promise((resolve) => serverInstance.close(resolve));
    console.log('\n- Test server shut down.');
    db.close();
    process.exit(0);
  }
}

runTests();
