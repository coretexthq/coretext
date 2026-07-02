-- Actors / Hosts
CREATE TABLE IF NOT EXISTS actors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('renter', 'host', 'reviewer')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  district TEXT NOT NULL,
  nightly_price REAL NOT NULL,
  bedrooms INTEGER NOT NULL,
  amenities TEXT NOT NULL, -- comma-separated list
  rating REAL NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  is_published INTEGER DEFAULT 1 CHECK (is_published IN (0, 1)),
  host_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES actors(id) ON DELETE CASCADE
);

-- Availability / Blackout Periods
CREATE TABLE IF NOT EXISTS availability_blackouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL,   -- YYYY-MM-DD
  type TEXT NOT NULL DEFAULT 'blackout',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Booking Requests
CREATE TABLE IF NOT EXISTS booking_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  renter_id INTEGER NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL,   -- YYYY-MM-DD
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  renter_name TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (renter_id) REFERENCES actors(id) ON DELETE CASCADE
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  filters TEXT NOT NULL, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE
);

-- Audit Records
CREATE TABLE IF NOT EXISTS audit_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  actor_id INTEGER NOT NULL,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  summary TEXT NOT NULL,
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE
);
