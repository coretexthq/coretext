# Trore Lodging Marketplace

Trore is a locally runnable full-stack lodging marketplace prototype for short-term rental discovery and host operations. It features renter listing searches, host listing management, date blackout/booking availability calculations, saved searches, and an audit trail for mutations.

---

## Technical Stack
- **Frontend**: Responsive Web UI (Vanilla HTML, CSS, JavaScript) using a unified API client ([api.js](file:///public/js/api.js))
- **Backend**: Express API server ([server.js](file:///server.js))
- **Database**: Persistent local SQLite3 ([db.js](file:///backend/db.js))
- **Testing**: Node.js test runner ([tests/](file:///tests))

---

## Local Setup & Run Instructions

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) and npm installed on your system.

### 2. Install Dependencies
Initialize the project dependencies:
```bash
npm install
```

### 3. Initialize & Seed Database
Reset the local database and seed it with deterministic mock data:
```bash
npm run seed
```
This script initializes the schema and creates `backend/trore.db` with sample hosts, renters, listings, availability blocks, bookings, and saved searches.

### 4. Start the Application
Start the local Express server:
```bash
npm start
```
The server will start on [http://localhost:3000](http://localhost:3000).

### 5. Running Automated Tests
To run the full suite of 57 automated tests covering renter workflows, host operations, bookings, auth middleware, and helper utilities:
```bash
npm test
```

---

## Exploring User Modes

Trore implements three user modes selectable directly from the navigation bar on the web interface:

### 1. Renter Mode 🏡
- **Search & Filtering**: Filter listings by title text, district, price range, bedroom count, amenities, and date range availability.
- **URL-Driven State**: All filters, search keywords, sorting, pagination, and view modes are synced in real-time with URL query parameters. Reloading the page or copying the link restores the exact same view.
- **Listings & Map View**: Toggle between a list/grid view and a dynamic map placeholder view. Both views reflect the exact same filtered result set.
- **Booking Requests**: Click on any listing card to see full details, host info, amenities, and blackout dates. Enter check-in/check-out dates to calculate a price quote. The booking form validates blackout dates locally on the client and enforces availability on the backend.
- **Saved Searches**: Click **Save Search** to save your filter setup. It persists to the backend and can be reopened to reload the search query parameters.

### 2. Host Mode 🔑
- **Actor Selector**: Select either **Alice (Host)** or **Bob (Host)** to view listings owned by them.
- **Listing Management**: Create new listings, edit details, and toggle publication status (Active/Inactive).
- **Availability & Blackouts**: Select a listing to view, add, or delete blackout date ranges. The system checks availability overlap before saving.
- **Booking Reviews**: Review and approve/decline incoming booking requests from renters. Approved bookings automatically create booked availability slots to block those dates for other renters.
- **Security Boundaries**: Host mutation endpoints enforce that hosts can only edit their own listings and booking requests.

### 3. Reviewer/Admin Mode 🛡️
- **Global Overview**: Inspect all system entities including listings, hosts, renters, and detailed audit log records.
- **Audit Trails**: View the mutation logs including creation, editing, status toggling, blackout updates, booking requests, booking reviews, and saved searches. Audit records record the actor, timestamp, action type, entity ID, and summary description.
- **Database Reset**: Trigger a full database seed/reset directly from the UI to test clean states.

---

## Central Technical Invariants
1. **Unified API client**: Every API call goes through `TroreAPI` which automatically signs requests with `X-Trore-Auth: v3-4-case-study`.
2. **Backend Authentication**: Protected routes reject calls with missing or invalid `X-Trore-Auth` headers.
3. **Availability & Ownership Enforcements**: Overlapping blackout dates and incorrect host listing mutations are strictly rejected on the backend.
