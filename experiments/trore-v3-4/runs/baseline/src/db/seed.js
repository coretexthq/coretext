import { db } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function resetDatabase() {
  console.log('Resetting database...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DROP TABLE IF EXISTS audit_records;');
  db.exec('DROP TABLE IF EXISTS saved_searches;');
  db.exec('DROP TABLE IF EXISTS booking_requests;');
  db.exec('DROP TABLE IF EXISTS availability_blackouts;');
  db.exec('DROP TABLE IF EXISTS listings;');
  db.exec('DROP TABLE IF EXISTS actors;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(schema);
  console.log('Schema applied successfully.');
}

export function seedDatabase() {
  console.log('Seeding database...');
  const insertActor = db.prepare('INSERT INTO actors (id, name, role) VALUES (?, ?, ?)');
  insertActor.run(1, 'Alice', 'host');
  insertActor.run(2, 'Bob', 'host');
  insertActor.run(3, 'Charlie', 'renter');
  insertActor.run(4, 'Diana', 'renter');
  insertActor.run(5, 'Admin reviewer', 'reviewer');
  console.log('Actors seeded.');

  const insertListing = db.prepare(
    'INSERT INTO listings (id, title, district, nightly_price, bedrooms, amenities, rating, short_description, description, is_published, host_id) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertListing.run(
    1,
    'Charming Downtown Loft',
    'Downtown',
    120.0,
    2,
    'air conditioning, balcony, parking',
    4.8,
    'A beautiful loft located in the heart of downtown.',
    'Enjoy easy access to everything from this perfectly located home base. Modern amenities, comfortable beds, and high speed wifi included.',
    1, 1
  );

  insertListing.run(
    2,
    'Cozy Beachside Bungalow',
    'Beachside',
    200.0,
    3,
    'air conditioning, parking, pool, pet friendly',
    4.9,
    'Just steps away from the sandy beaches.',
    'Relax and unwind in this quiet beachside cottage. Features a private pool, fenced yard for pets, and standard kitchen amenities.',
    1, 1
  );

  insertListing.run(
    5,
    'Hidden Forest Cabin',
    'Forest',
    150.0,
    1,
    'parking, pet friendly',
    4.6,
    'A secluded getaway in the deep forest.',
    'Get away from it all in this cozy forest retreat. No AC, but cool mountain air and complete privacy.',
    0, 1
  );

  insertListing.run(
    3,
    'Modern Studio in District 1',
    'District 1',
    80.0,
    1,
    'air conditioning, workspace, pet friendly',
    4.5,
    'Compact studio ideal for business travelers.',
    'Located in the bustling business district. Comfortable workspace, high speed internet, and close to public transit.',
    1, 2
  );

  insertListing.run(
    4,
    'Luxury Villa with Pool',
    'Suburbs',
    500.0,
    5,
    'air conditioning, balcony, parking, pool, workspace, pet friendly',
    5.0,
    'Exquisite villa for family retreats.',
    'Spacious 5-bedroom villa with private luxury pool, scenic views, and modern smart home amenities.',
    1, 2
  );
  console.log('Listings seeded.');

  const insertBlackout = db.prepare(
    'INSERT INTO availability_blackouts (id, listing_id, start_date, end_date, type) VALUES (?, ?, ?, ?, ?)'
  );
  insertBlackout.run(1, 1, '2026-07-10', '2026-07-15', 'blackout');
  insertBlackout.run(2, 2, '2026-08-01', '2026-08-10', 'blackout');
  console.log('Blackouts seeded.');

  const insertBooking = db.prepare(
    'INSERT INTO booking_requests (id, listing_id, renter_id, start_date, end_date, total_price, status, renter_name, renter_email) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertBooking.run(1, 1, 3, '2026-07-20', '2026-07-25', 600.0, 'approved', 'Charlie', 'charlie@example.com');
  insertBooking.run(2, 3, 4, '2026-07-05', '2026-07-07', 160.0, 'pending', 'Diana', 'diana@example.com');
  insertBooking.run(3, 2, 3, '2026-08-15', '2026-08-20', 1000.0, 'declined', 'Charlie', 'charlie@example.com');
  console.log('Booking requests seeded.');

  const insertSavedSearch = db.prepare(
    'INSERT INTO saved_searches (id, actor_id, name, filters) VALUES (?, ?, ?, ?)'
  );
  insertSavedSearch.run(1, 3, 'My Downtown Search', JSON.stringify({ district: 'Downtown', bedrooms: 2 }));
  insertSavedSearch.run(2, 4, 'Villas with Pool', JSON.stringify({ amenities: ['pool'], maxPrice: 600 }));
  console.log('Saved searches seeded.');

  const insertAudit = db.prepare(
    'INSERT INTO audit_records (id, actor_id, actor_name, action_type, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertAudit.run(1, 1, 'Alice', 'create_listing', 'listing', 1, 'Alice created listing Charming Downtown Loft (ID: 1)');
  insertAudit.run(2, 1, 'Alice', 'publish_listing', 'listing', 1, 'Alice published listing Charming Downtown Loft (ID: 1)');
  insertAudit.run(3, 1, 'Alice', 'create_listing', 'listing', 2, 'Alice created listing Cozy Beachside Bungalow (ID: 2)');
  insertAudit.run(4, 1, 'Alice', 'publish_listing', 'listing', 2, 'Alice published listing Cozy Beachside Bungalow (ID: 2)');
  insertAudit.run(5, 2, 'Bob', 'create_listing', 'listing', 3, 'Bob created listing Modern Studio in District 1 (ID: 3)');
  insertAudit.run(6, 2, 'Bob', 'publish_listing', 'listing', 3, 'Bob published listing Modern Studio in District 1 (ID: 3)');
  insertAudit.run(7, 3, 'Charlie', 'create_booking', 'booking_request', 1, 'Charlie requested booking for Listing 1 (2026-07-20 to 2026-07-25)');
  insertAudit.run(8, 1, 'Alice', 'approve_booking', 'booking_request', 1, 'Alice approved booking request ID: 1 for Listing 1');
  console.log('Audit records seeded.');
  console.log('Database seeded successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    resetDatabase();
    seedDatabase();
    console.log('Database reset and seed finished.');
  } catch (err) {
    console.error('Failed to reset and seed database:', err);
    process.exit(1);
  }
}
