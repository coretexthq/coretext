import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { db } from '../src/db/db.js';
import { resetDatabase, seedDatabase } from '../src/db/seed.js';

test('Database Schema and Seeding Verification', async (t) => {
  await t.test('database tables are created and seeded correctly', () => {
    resetDatabase();
    seedDatabase();
    
    const actors = db.prepare('SELECT * FROM actors').all();
    assert.strictEqual(actors.length, 5, 'Should have exactly 5 actors');
    
    const hostAlice = actors.find(a => a.name === 'Alice');
    assert.ok(hostAlice, 'Alice should exist');
    assert.strictEqual(hostAlice.role, 'host', 'Alice should be a host');
    
    const listings = db.prepare('SELECT * FROM listings').all();
    assert.strictEqual(listings.length, 5, 'Should have exactly 5 listings');
    
    const downtownLoft = listings.find(l => l.title === 'Charming Downtown Loft');
    assert.ok(downtownLoft, 'Charming Downtown Loft should exist');
    assert.strictEqual(downtownLoft.nightly_price, 120.0, 'Nightly price should match');
    assert.strictEqual(downtownLoft.bedrooms, 2, 'Bedrooms should match');
    assert.strictEqual(downtownLoft.is_published, 1, 'Should be published');
    
    const unpublishedListing = listings.find(l => l.is_published === 0);
    assert.ok(unpublishedListing, 'An unpublished listing should exist');
    assert.strictEqual(unpublishedListing.title, 'Hidden Forest Cabin', 'Should be Hidden Forest Cabin');
    
    const blackouts = db.prepare('SELECT * FROM availability_blackouts').all();
    assert.strictEqual(blackouts.length, 2, 'Should have exactly 2 blackouts');
    
    const bookings = db.prepare('SELECT * FROM booking_requests').all();
    assert.strictEqual(bookings.length, 3, 'Should have exactly 3 booking requests');
    
    const pendingBooking = bookings.find(b => b.status === 'pending');
    assert.ok(pendingBooking, 'Pending booking should exist');
    assert.strictEqual(pendingBooking.renter_name, 'Diana', 'Should be booked by Diana');
    
    const savedSearches = db.prepare('SELECT * FROM saved_searches').all();
    assert.strictEqual(savedSearches.length, 2, 'Should have exactly 2 saved searches');
    
    const audits = db.prepare('SELECT * FROM audit_records').all();
    assert.ok(audits.length > 0, 'Audit records should have entries');
  });
});
