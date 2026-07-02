const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../trore.db');

async function seed() {
  console.log('Starting database seeding...');

  // Reset database file BEFORE requiring src/db to avoid SQLITE_IOERR
  if (fs.existsSync(dbPath)) {
    console.log(`Deleting existing database file at ${dbPath}`);
    try {
      fs.unlinkSync(dbPath);
    } catch (e) {
      console.warn('Could not unlink database file, attempting to continue:', e.message);
    }
  }

  // Require db now that the file has been cleaned up
  const { initDb, runAsync, listingIds, getAsync } = require('../src/db');

  console.log('Initializing database schema...');
  await initDb();
  console.log('Schema initialized successfully.');

  // 1. Seed Hosts
  console.log('Seeding hosts...');
  const hosts = [
    { name: 'Alice Vance', email: 'alice@trore.com' },
    { name: 'Bob Miller', email: 'bob@trore.com' },
    { name: 'Charlie Song', email: 'charlie@trore.com' }
  ];

  const hostIds = {};
  for (const host of hosts) {
    const res = await runAsync(
      'INSERT INTO hosts (name, email) VALUES (?, ?)',
      [host.name, host.email]
    );
    hostIds[host.name] = res.id;
  }

  // 2. Seed Listings
  console.log('Seeding listings...');
  const listings = [
    {
      title: 'Sleek Modern Loft in Downtown',
      district: 'Downtown',
      nightly_price: 150.0,
      bedrooms: 2,
      amenities: JSON.stringify(['air conditioning', 'workspace', 'parking', 'pool']),
      rating: 4.8,
      description: 'A beautifully designed 2-bedroom loft in the heart of downtown. Steps away from the transit lines and best restaurants.',
      status: 'active',
      host_name: 'Alice Vance'
    },
    {
      title: 'Historic Brownstone Suite',
      district: 'Back Bay',
      nightly_price: 220.0,
      bedrooms: 1,
      amenities: JSON.stringify(['air conditioning', 'balcony', 'pet friendly']),
      rating: 4.9,
      description: 'Elegant brownstone suite featuring classic architecture, high ceilings, and a private balcony with stunning neighborhood views.',
      status: 'active',
      host_name: 'Alice Vance'
    },
    {
      title: 'Cozy North End Studio',
      district: 'North End',
      nightly_price: 95.0,
      bedrooms: 1,
      amenities: JSON.stringify(['workspace', 'air conditioning']),
      rating: 4.5,
      description: 'Charming studio apartment located in the historic North End. Walk to local pastry shops and the waterfront.',
      status: 'active',
      host_name: 'Bob Miller'
    },
    {
      title: 'Luxury Penthouse with Rooftop Pool',
      district: 'South End',
      nightly_price: 450.0,
      bedrooms: 3,
      amenities: JSON.stringify(['pool', 'air conditioning', 'balcony', 'parking', 'workspace', 'pet friendly']),
      rating: 5.0,
      description: 'Stunning 3-bedroom penthouse with premium finishes, private parking, and access to a heated rooftop swimming pool.',
      status: 'active',
      host_name: 'Bob Miller'
    },
    {
      title: 'Quaint Cambridge Townhouse',
      district: 'Cambridge',
      nightly_price: 180.0,
      bedrooms: 2,
      amenities: JSON.stringify(['parking', 'pet friendly', 'workspace']),
      rating: 4.6,
      description: 'Lovely townhouse in a quiet Cambridge neighborhood. Perfect for academics or families visiting local universities.',
      status: 'active',
      host_name: 'Charlie Song'
    },
    {
      title: 'Renovated Inactive Apartment',
      district: 'Downtown',
      nightly_price: 120.0,
      bedrooms: 1,
      amenities: JSON.stringify(['air conditioning']),
      rating: 4.0,
      description: 'Currently undergoing minor maintenance. Not available for rent yet.',
      status: 'inactive',
      host_name: 'Charlie Song'
    }
  ];

  const seededListings = [];
  for (const listing of listings) {
    const hostId = hostIds[listing.host_name];
    const res = await runAsync(
      `INSERT INTO listings (title, district, nightly_price, bedrooms, amenities, rating, description, status, host_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listing.title,
        listing.district,
        listing.nightly_price,
        listing.bedrooms,
        listing.amenities,
        listing.rating,
        listing.description,
        listing.status,
        hostId
      ]
    );
    seededListings.push({ id: res.id, title: listing.title, host_name: listing.host_name });

    // Seed listing creation audit record
    await runAsync(
      `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [
        listing.host_name,
        'CREATE_LISTING',
        'listing',
        res.id,
        `Host ${listing.host_name} created listing '${listing.title}'`
      ]
    );
  }

  // 3. Seed Availability (Blackout Dates)
  console.log('Seeding availability blackouts...');
  // Listing 1 (Downtown Loft) blackout
  const loftListing = seededListings.find(l => l.title === 'Sleek Modern Loft in Downtown');
  await runAsync(
    'INSERT INTO availability (listing_id, start_date, end_date) VALUES (?, ?, ?)',
    [loftListing.id, '2026-07-10', '2026-07-15']
  );
  await runAsync(
    'INSERT INTO availability (listing_id, start_date, end_date) VALUES (?, ?, ?)',
    [loftListing.id, '2026-08-01', '2026-08-05']
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      loftListing.host_name,
      'CREATE_BLACKOUT',
      'listing',
      loftListing.id,
      `Host ${loftListing.host_name} added blackout dates 2026-07-10 to 2026-07-15 and 2026-08-01 to 2026-08-05 for '${loftListing.title}'`
    ]
  );

  // Listing 2 (Back Bay Brownstone) blackout
  const brownstoneListing = seededListings.find(l => l.title === 'Historic Brownstone Suite');
  await runAsync(
    'INSERT INTO availability (listing_id, start_date, end_date) VALUES (?, ?, ?)',
    [brownstoneListing.id, '2026-07-20', '2026-07-25']
  );

  // 4. Seed Booking Requests
  console.log('Seeding booking requests...');
  // Approved request for Listing 1
  const booking1 = await runAsync(
    `INSERT INTO booking_requests (listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loftListing.id, 'Dave Jones', 'dave@renter.com', '2026-07-01', '2026-07-05', 600.0, 'approved']
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Dave Jones',
      'CREATE_BOOKING',
      'booking_request',
      booking1.id,
      `Renter Dave Jones created booking request for '${loftListing.title}' (2026-07-01 to 2026-07-05)`
    ]
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      loftListing.host_name,
      'APPROVE_BOOKING',
      'booking_request',
      booking1.id,
      `Host ${loftListing.host_name} approved booking request #${booking1.id} for '${loftListing.title}'`
    ]
  );

  // Pending request for Listing 1
  const booking2 = await runAsync(
    `INSERT INTO booking_requests (listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loftListing.id, 'Emma Watson', 'emma@renter.com', '2026-07-18', '2026-07-22', 600.0, 'pending']
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Emma Watson',
      'CREATE_BOOKING',
      'booking_request',
      booking2.id,
      `Renter Emma Watson created pending booking request for '${loftListing.title}' (2026-07-18 to 2026-07-22)`
    ]
  );

  // Approved request for Listing 3 (North End Studio)
  const studioListing = seededListings.find(l => l.title === 'Cozy North End Studio');
  const booking3 = await runAsync(
    `INSERT INTO booking_requests (listing_id, renter_name, renter_email, start_date, end_date, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [studioListing.id, 'Grace Hopper', 'grace@renter.com', '2026-08-10', '2026-08-15', 475.0, 'approved']
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Grace Hopper',
      'CREATE_BOOKING',
      'booking_request',
      booking3.id,
      `Renter Grace Hopper created booking request for '${studioListing.title}' (2026-08-10 to 2026-08-15)`
    ]
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      studioListing.host_name,
      'APPROVE_BOOKING',
      'booking_request',
      booking3.id,
      `Host ${studioListing.host_name} approved booking request #${booking3.id} for '${studioListing.title}'`
    ]
  );

  // 5. Seed Saved Searches
  console.log('Seeding saved searches...');
  const search1 = await runAsync(
    'INSERT INTO saved_searches (renter_name, filters_json) VALUES (?, ?)',
    [
      'Dave Jones',
      JSON.stringify({ district: 'Downtown', bedrooms: 2, minPrice: 100, maxPrice: 200 })
    ]
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Dave Jones',
      'CREATE_SAVED_SEARCH',
      'saved_search',
      search1.id,
      `Renter Dave Jones saved a search with filters: {"district":"Downtown","bedrooms":2,"minPrice":100,"maxPrice":200}`
    ]
  );

  const search2 = await runAsync(
    'INSERT INTO saved_searches (renter_name, filters_json) VALUES (?, ?)',
    [
      'Grace Hopper',
      JSON.stringify({ amenities: ['pool', 'workspace'], minPrice: 150 })
    ]
  );
  await runAsync(
    `INSERT INTO audit_records (actor, action_type, entity_type, entity_id, summary)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Grace Hopper',
      'CREATE_SAVED_SEARCH',
      'saved_search',
      search2.id,
      `Renter Grace Hopper saved a search with filters: {"amenities":["pool","workspace"],"minPrice":150}`
    ]
  );

  console.log('Database seeding completed successfully.');
}

if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = { seed };
