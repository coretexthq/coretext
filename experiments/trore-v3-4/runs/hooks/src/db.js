const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../trore.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');
});

/**
 * Wraps db.run in a Promise.
 */
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Wraps db.get in a Promise.
 */
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * Wraps db.all in a Promise.
 */
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Initializes the database schema.
 */
function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Create hosts table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS hosts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
          )
        `);

        // Create listings table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            district TEXT NOT NULL,
            nightly_price REAL NOT NULL,
            bedrooms INTEGER NOT NULL,
            amenities TEXT NOT NULL, -- Store as JSON array string
            rating REAL DEFAULT 0.0,
            description TEXT,
            status TEXT NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
            host_id INTEGER NOT NULL,
            FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE RESTRICT
          )
        `);

        // Create availability table for blackout date ranges
        await runAsync(`
          CREATE TABLE IF NOT EXISTS availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER NOT NULL,
            start_date TEXT NOT NULL, -- YYYY-MM-DD
            end_date TEXT NOT NULL,   -- YYYY-MM-DD
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
          )
        `);

        // Create booking_requests table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS booking_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER NOT NULL,
            renter_name TEXT NOT NULL,
            renter_email TEXT NOT NULL,
            start_date TEXT NOT NULL, -- YYYY-MM-DD
            end_date TEXT NOT NULL,   -- YYYY-MM-DD
            total_price REAL NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
          )
        `);

        // Create saved_searches table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS saved_searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            renter_name TEXT NOT NULL,
            filters_json TEXT NOT NULL
          )
        `);

        // Create audit_records table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS audit_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            actor TEXT NOT NULL,
            action_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            summary TEXT NOT NULL
          )
        `);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  db,
  dbPath,
  initDb,
  runAsync,
  getAsync,
  allAsync
};
