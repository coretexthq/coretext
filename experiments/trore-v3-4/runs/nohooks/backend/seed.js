const fs = require('fs');
const path = require('path');
const { 
  getConnection, 
  queryRun, 
  queryExec, 
  closeDb, 
  initDbSchema, 
  DB_PATH 
} = require('./db');

async function seed() {
  console.log('Starting database seeding...');
  
  // If not using in-memory database, delete existing file to reset completely
  if (DB_PATH !== ':memory:') {
    try {
      await closeDb();
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log(`Deleted existing database file at ${DB_PATH}`);
      }
    } catch (err) {
      console.warn('Warning during database file cleanup:', err.message);
    }
  }

  // Get a fresh connection and init schema
  const db = getConnection();
  await initDbSchema();
  console.log('Database schema initialized.');

  // 1. Seed Hosts
  const hosts = [
    { name: 'Alice (Host)' },
    { name: 'Bob (Host)' }
  ];
  
  const hostIds = [];
  for (const host of hosts) {
    const res = await queryRun('INSERT INTO hosts (name) VALUES (?)', [host.name]);
    hostIds.push(res.lastID);
    await queryRun(
      'INSERT INTO audit_records (actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?)',
      ['system', 'System Seeder', 'create_host', 'host', res.lastID, `Created host account for ${host.name}`]
    );
  }
  console.log(`Seeded ${hostIds.length} hosts.`);

  // 2. Seed Renters
  const renters = [
    { name: 'Charlie (Renter)' },
    { name: 'Dave (Renter)' }
  ];
  
  const renterIds = [];
  for (const renter of renters) {
    const res = await queryRun('INSERT INTO renters (name) VALUES (?)', [renter.name]);
    renterIds.push(res.lastID);
    await queryRun(
      'INSERT INTO audit_records (actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?)',
      ['system', 'System Seeder', 'create_renter', 'renter', res.lastID, `Created renter account for ${renter.name}`]
    );
  }
  console.log(`Seeded ${renterIds.length} renters.`);

  // 3. Seed Listings
  const listings = [
    {
      host_id: hostIds[0], // Alice
      title: 'Charming Downtown Loft',
      district: 'Downtown',
      nightly_price: 120.00,
      bedrooms: 1,
      amenities: JSON.stringify(['air conditioning', 'workspace', 'parking']),
      rating: 4.8,
      description: 'A beautiful, sunlit loft in the heart of downtown. Perfect for business travelers.',
      is_active: 1
    },
    {
      host_id: hostIds[0], // Alice
      title: 'Spacious Beachside Villa',
      district: 'Beachside',
      nightly_price: 350.00,
      bedrooms: 3,
      amenities: JSON.stringify(['air conditioning', 'pool', 'balcony', 'parking', 'pet friendly']),
      rating: 4.9,
      description: 'Stunning ocean views, private pool, and steps to the sand. Ideal for families.',
      is_active: 1
    },
    {
      host_id: hostIds[1], // Bob
      title: 'Cozy Westside Cabin',
      district: 'Westside',
      nightly_price: 85.00,
      bedrooms: 2,
      amenities: JSON.stringify(['parking', 'pet friendly', 'balcony']),
      rating: 4.5,
      description: 'A quiet retreat surrounded by trees, but close to city amenities.',
      is_active: 1
    },
    {
      host_id: hostIds[1], // Bob
      title: 'Modern Northside Studio',
      district: 'Northside',
      nightly_price: 110.00,
      bedrooms: 1,
      amenities: JSON.stringify(['air conditioning', 'workspace', 'parking']),
      rating: 4.2,
      description: 'Sleek and minimalist studio apartment with high-speed internet.',
      is_active: 0 // Inactive listing to test visibility filtering
    }
  ];

  const listingIds = [];
  for (const listing of listings) {
    const res = await queryRun(
      `INSERT INTO listings (host_id, title, district, nightly_price, bedrooms, amenities, rating, description, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listing.host_id,
        listing.title,
        listing.district,
        listing.nightly_price,
        listing.bedrooms,
        listing.amenities,
        listing.rating,
        listing.description,
        listing.is_active
      ]
    );
    listingIds.push(res.lastID);
    
    // Add audit trail for listing creation
    const hostName = listing.host_id === hostIds[0] ? 'Alice' : 'Bob';
    await queryRun(
      'INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        listing.host_id,
        'host',
        hostName,
        'create_listing',
        'listing',
        res.lastID,
        `Created listing "${listing.title}" in ${listing.district} (Active: ${listing.is_active})`
      ]
    );
  }
  console.log(`Seeded ${listingIds.length} listings.`);

  // 4. Seed Availability / Blackout Dates
  const blackouts = [
    {
      listing_id: listingIds[0], // Charming Downtown Loft
      start_date: '2026-07-01',
      end_date: '2026-07-05',
      type: 'blackout'
    },
    {
      listing_id: listingIds[1], // Beachside Villa
      start_date: '2026-07-15',
      end_date: '2026-07-20',
      type: 'blackout'
    }
  ];

  for (const block of blackouts) {
    const res = await queryRun(
      'INSERT INTO availability_blocks (listing_id, start_date, end_date, type) VALUES (?, ?, ?, ?)',
      [block.listing_id, block.start_date, block.end_date, block.type]
    );

    const listing = listings[block.listing_id - 1];
    const hostId = listing.host_id;
    const hostName = hostId === hostIds[0] ? 'Alice' : 'Bob';
    
    await queryRun(
      'INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        hostId,
        'host',
        hostName,
        'update_availability',
        'availability',
        res.lastID,
        `Added blackout date range ${block.start_date} to ${block.end_date} for listing ${block.listing_id}`
      ]
    );
  }
  console.log(`Seeded ${blackouts.length} blackout periods.`);

  // 5. Seed Booking Requests
  const bookings = [
    {
      listing_id: listingIds[0], // Charming Downtown Loft
      renter_id: renterIds[0], // Charlie
      start_date: '2026-07-10',
      end_date: '2026-07-14',
      total_price: 480.00,
      status: 'approved',
      guest_name: 'Charlie',
      guest_email: 'charlie@example.com'
    },
    {
      listing_id: listingIds[1], // Spacious Beachside Villa
      renter_id: renterIds[1], // Dave
      start_date: '2026-08-01',
      end_date: '2026-08-05',
      total_price: 1400.00,
      status: 'pending',
      guest_name: 'Dave',
      guest_email: 'dave@example.com'
    },
    {
      listing_id: listingIds[2], // Cozy Westside Cabin
      renter_id: renterIds[0], // Charlie
      start_date: '2026-07-05',
      end_date: '2026-07-08',
      total_price: 255.00,
      status: 'declined',
      guest_name: 'Charlie Renter',
      guest_email: 'charlie@example.com'
    }
  ];

  for (const booking of bookings) {
    const res = await queryRun(
      `INSERT INTO booking_requests (listing_id, renter_id, start_date, end_date, total_price, status, guest_name, guest_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.listing_id,
        booking.renter_id,
        booking.start_date,
        booking.end_date,
        booking.total_price,
        booking.status,
        booking.guest_name,
        booking.guest_email
      ]
    );
    
    // Create audit log for booking creation
    const renterName = booking.renter_id === renterIds[0] ? 'Charlie' : 'Dave';
    await queryRun(
      'INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        booking.renter_id,
        'renter',
        renterName,
        'create_booking',
        'booking',
        res.lastID,
        `Created booking request for listing ${booking.listing_id} (${booking.start_date} to ${booking.end_date})`
      ]
    );

    // If approved or declined, log the host's action audit record
    if (booking.status === 'approved' || booking.status === 'declined') {
      const listing = listings[booking.listing_id - 1];
      const hostId = listing.host_id;
      const hostName = hostId === hostIds[0] ? 'Alice' : 'Bob';
      const actionType = booking.status === 'approved' ? 'approve_booking' : 'decline_booking';
      
      await queryRun(
        'INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          hostId,
          'host',
          hostName,
          actionType,
          'booking',
          res.lastID,
          `${booking.status === 'approved' ? 'Approved' : 'Declined'} booking request ${res.lastID} for listing ${booking.listing_id}`
        ]
      );

      // If approved, create a corresponding booked slot block in availability_blocks to block calendar
      if (booking.status === 'approved') {
        await queryRun(
          'INSERT INTO availability_blocks (listing_id, start_date, end_date, type) VALUES (?, ?, ?, ?)',
          [booking.listing_id, booking.start_date, booking.end_date, 'booked']
        );
      }
    }
  }
  console.log(`Seeded ${bookings.length} booking requests.`);

  // 6. Seed Saved Searches
  const savedSearches = [
    {
      renter_id: renterIds[0], // Charlie
      name: 'Downtown 1 Bedroom Loft',
      query_params: JSON.stringify({ district: 'Downtown', bedrooms: 1 })
    },
    {
      renter_id: renterIds[1], // Dave
      name: 'Beachside Family Villa',
      query_params: JSON.stringify({ district: 'Beachside', bedrooms: 3, amenities: ['pool'] })
    }
  ];

  for (const s of savedSearches) {
    const res = await queryRun(
      'INSERT INTO saved_searches (renter_id, name, query_params) VALUES (?, ?, ?)',
      [s.renter_id, s.name, s.query_params]
    );

    const renterName = s.renter_id === renterIds[0] ? 'Charlie' : 'Dave';
    await queryRun(
      'INSERT INTO audit_records (actor_id, actor_type, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        s.renter_id,
        'renter',
        renterName,
        'create_saved_search',
        'saved_search',
        res.lastID,
        `Saved search query "${s.name}"`
      ]
    );
  }
  console.log(`Seeded ${savedSearches.length} saved searches.`);

  await closeDb();
  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seed };
