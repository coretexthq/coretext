# Trore Lodging Marketplace Case Study (v3-4)

Trore is a fully functional full-stack prototype of a short-term lodging marketplace designed to evaluate agent-assisted software engineering. The application provides interactive features for renters, hosts, and admin reviewers, supported by a persistent SQLite database and robust validation rules.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: Version 18+ (verified on v26.0.0)
- **NPM**: Package manager included with Node.js

### 2. Installation
Clone the repository, navigate to the project directory, and install dependencies:
```bash
npm install
```

### 3. Database Initialization & Seeding
Initialize the SQLite schema and seed it with deterministic actors, listings, blackouts, and booking requests:
```bash
npm run seed
```
This reset/seed process deletes any existing `trore.db` file and recreates the tables to start from a clean state.

### 4. Running the Server Locally
Start the Express server locally:
```bash
npm start
```
The application will be accessible at: [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing and E2E Verification

### Automated Test Suite
Run the full automated E2E test suite sequentially to verify foundation, renter, host, and booking behaviors:
```bash
npm test
```
The test suite executes the following files:
1. `tests/test_foundation.js` – Verifies database integrity, seeding, and general API health / auth headers.
2. `tests/test_renter.js` – Verifies active listing discovery, sorting, filtering, saved searches, and booking validation.
3. `tests/test_host.js` – Verifies listing creation, editing, publish states, blackout additions, and host ownership isolation.
4. `tests/test_booking.js` – Verifies booking lifecycle workflows, approval cascade (rejecting overlapping booking requests), and audit logging.

### Individual Test Commands
You can also run any specific smoke test suite individually:
- **Foundation**: `npm run test:foundation` (or `node tests/test_foundation.js`)
- **Renter**: `node tests/test_renter.js`
- **Host**: `node tests/test_host.js`
- **Booking**: `npm run test:booking` (or `node tests/test_booking.js`)

---

## 📐 API Architecture & Route Reference

All backend endpoints require a robust auth header to check case-study compliance, except the health check.

### Authentication Headers
- **Case-Study Compliance**: All protected API requests must include the header:
  `X-Trore-Auth: v3-4-case-study`
- **Host Identity Context**: Host-level routes must include the header representing the host name:
  `X-Trore-Host: Alice Vance` (or other seeded hosts)

### Endpoint Directory

#### 🌐 General / Renter API
- `GET /api/health` – Public API health check.
- `GET /api/listings` – Search active listings. Query parameters supported:
  - `q`: Text search (titles/descriptions)
  - `district`: Filter by neighborhood (e.g. Downtown, Back Bay)
  - `minPrice` / `maxPrice`: Nightly price range boundaries
  - `bedrooms`: Minimum bedroom count
  - `amenities`: Comma-separated list of amenities (e.g., `pool,workspace`)
  - `startDate` / `endDate`: Filter listings available during date range
  - `sortBy`: Sorting criteria (`relevance`, `price`, `rating`, `newest`)
  - `page` / `limit`: Pagination parameters
- `GET /api/listings/:id` – Fetch listing details, including host name, amenities, blackout dates, and approved bookings.
- `GET /api/saved-searches` – Retrieve saved searches for a specific renter (`?renter_name=Emma Watson`).
- `POST /api/saved-searches` – Save the current search parameters (renter name, filter JSON, URL path).
- `POST /api/booking-requests` – Create a booking request (validated against blackout dates, host approval overlaps, and correct ranges).

#### 🏡 Host API (Requires `X-Trore-Host`)
- `GET /api/host/listings` – List all listings owned by the authenticated host.
- `POST /api/host/listings` – Create a new listing.
- `PUT /api/host/listings/:id` – Edit listing details (restricted to listing owner).
- `POST /api/host/listings/:id/publish` – Set a listing to active status.
- `POST /api/host/listings/:id/unpublish` – Set a listing to inactive status.
- `POST /api/host/listings/:id/blackouts` – Add availability blackout dates.
- `DELETE /api/host/listings/:id/blackouts/:blackoutId` – Remove a blackout date range.
- `GET /api/host/bookings` – Retrieve all booking requests targeting listings owned by the authenticated host.
- `POST /api/host/bookings/:id/approve` – Approve a pending booking request (cancels overlapping requests for the same listing).
- `POST /api/host/bookings/:id/decline` – Manually decline a pending booking request.

#### 🛡️ Admin / Audit API
- `GET /api/admin/audit-logs` – Retrieve the system mutation audit history.

---

## 🔒 Invariants and Security Constraints

1. **Authentication Compliance**: Any API request to a route starting with `/api` (excluding `/api/health` and `/api/protected-test`) is filtered by `troreAuthMiddleware` in `server.js` and rejected with `401 Unauthorized` if `X-Trore-Auth` header is missing or incorrect.
2. **Host Identity & Ownership Checks**: The `hostAuthMiddleware` extracts `X-Trore-Host` from the request header and validates the host's existence. In endpoints modifying listings (`PUT /api/host/listings/:id`, `/publish`, `/blackouts`, etc.), the database checks that the owner host corresponds to the `X-Trore-Host` header.
3. **centralized Booking Validation**: Availability check is run inside `POST /api/booking-requests` and `POST /api/host/bookings/:id/approve`. Dates are checked to prevent overlapping bookings or blackouts.
4. **URL-Driven Search State**: Listing filters are stored and updated in URL search parameters to make links easily shareable and restorable.

---

## 📁 Repository Structure

```text
├── README.md               # Setup and E2E validation documentation (this file)
├── server.js               # Full-stack backend server & API route logic
├── package.json            # Node.js manifest and test scripts
├── trore.db                # SQLite database (generated after seed)
├── src/
│   └── db.js               # Database schema definition & helper functions
├── scripts/
│   └── seed.js             # Seeding script for deterministic test data
├── public/
│   ├── index.html          # Interactive multi-role SPA frontend
│   └── smoke_renter.html   # Web-based manual renter smoke testing portal
├── tests/
│   ├── run_all_tests.js    # Sequentially runs all E2E test suites
│   ├── test_foundation.js  # Foundational smoke tests
│   ├── test_renter.js      # Renter discovery and request validation tests
│   ├── test_host.js        # Host management, publish, and blackouts tests
│   └── test_booking.js     # Booking lifecycle and approval cascade tests
└── knowledge/              # Coretext durable notes and AI session logs
```
