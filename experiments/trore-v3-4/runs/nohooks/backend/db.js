const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.TRORE_DB_PATH
  ? process.env.TRORE_DB_PATH
  : (process.env.NODE_ENV === 'test' 
      ? path.join(__dirname, 'trore.test.db') 
      : path.join(__dirname, 'trore.db'));

let db = null;

function getConnection() {
  if (db) return db;

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite database:', err.message);
      throw err;
    }
  });

  // Enable foreign key support in SQLite
  db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
      console.error('Failed to enable foreign keys:', err.message);
    }
  });

  return db;
}

function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        // Return this context which contains lastID and changes
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

function queryGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function queryExec(sql) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function closeDb() {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        db = null;
        resolve();
      }
    });
  });
}

async function initDbSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS hosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS renters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      district TEXT NOT NULL,
      nightly_price REAL NOT NULL,
      bedrooms INTEGER NOT NULL,
      amenities TEXT NOT NULL, -- JSON array of strings
      rating REAL DEFAULT 0.0,
      description TEXT,
      is_active INTEGER DEFAULT 1, -- 0 for inactive, 1 for active
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(host_id) REFERENCES hosts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS availability_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      start_date TEXT NOT NULL, -- YYYY-MM-DD
      end_date TEXT NOT NULL,   -- YYYY-MM-DD
      type TEXT NOT NULL,       -- 'blackout' or 'booked'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS booking_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      renter_id INTEGER NOT NULL,
      start_date TEXT NOT NULL, -- YYYY-MM-DD
      end_date TEXT NOT NULL,   -- YYYY-MM-DD
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY(renter_id) REFERENCES renters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      renter_id INTEGER NOT NULL,
      name TEXT,
      query_params TEXT NOT NULL, -- JSON-serialized search options
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(renter_id) REFERENCES renters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      actor_id INTEGER,
      actor_type TEXT NOT NULL, -- 'host', 'renter', 'admin', 'system'
      actor_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      summary TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await queryExec(schema);
}

module.exports = {
  getConnection,
  queryRun,
  queryGet,
  queryAll,
  queryExec,
  closeDb,
  initDbSchema,
  DB_PATH
};
