# Trore Lodging Marketplace Run Report

## Bounded Scope
`trore.integration`: Bounded integration hardening, test execution, run documentation compiling, and full marketplace validation.

---

## 1. Completed Workflows

### Renter Workflow
- **lodging Discovery**: Grid display of listing cards showing title, district, price, bedroom count, rating, description, and status.
- **Search & Filters**: Supports keyword text search, district matching, min/max price range, bedroom count, multiple checkbox amenities (must match all selected), and date range availability checking.
- **URL Query Parameters Integration**: Syncs search states dynamically in the URL (e.g. `?q=Loft&district=Downtown&min_price=100&page=1`). Restores parameters and page state on browser refresh, direct navigation, and popstate navigation.
- **Listing Details & Bookings**: Clicking any card shows detailed information, host info, amenities, and blackout dates. Check-in/check-out dates generate real-time price quotes. Dates are checked locally against availability blocks, disabling the book button if they overlap.
- **Saved Searches**: Saves filter criteria to the backend under the renter's account. Reopening restores the filter inputs and updates the URL-driven state.
- **Map View Placeholder**: A layout switcher toggles between Grid and Map. The map places pins dynamically based on district offsets using the exact same filtered dataset.

### Host Workflow
- **Host Context Switcher**: A dropdown toggles between Alice and Bob to show respective host listings.
- **Listing Management**: Hosts can create new listings, edit details, and publish/unpublish listings (Active/Inactive toggle).
- **Date Availability Management**: Shows blackout date blocks. Hosts can add new blackout blocks (validated against overlaps) or delete them.
- **Booking Review**: Displays incoming bookings for host-owned listings. Hosts can Approve or Decline pending bookings. Approving a booking automatically updates the availability blocks with type `booked` to block the calendar.

### Reviewer/Admin Workflow
- **Global Overview**: Displays tables of all listings, hosts, and renters.
- **Audit Trails**: Displays system-wide mutation events detailing the timestamp, actor name/type, action type, entity ID, and summary.
- **Database Reset**: Features a "Reset Database" button that calls the backend DB seeder to wipe and reinitialize deterministic seed data.

---

## 2. Technical Validation & Permission Rules

- **Unified API Client**: All frontend requests use `TroreAPI` which automatically injects the `X-Trore-Auth: v3-4-case-study` header. Direct `fetch` calls in the host management module have been refactored to use the unified `TroreAPI` client, ensuring complete enforcement of authorization headers.
- **Protected Backend Routes**: Express auth middleware rejects unprotected requests, returning a 401 Unauthorized status if the token is missing or incorrect.
- **Security Boundaries**: Host endpoints verify that the requesting actor owns the target listing before updating it, creating blackouts, or reviewing bookings. Unauthorized operations return a 403 Forbidden status.
- **Availability Validations**: Centralized logic checks booking requests and host blackout updates against existing availability blocks to prevent double-booking.
- **Shared Helpers**: Logic for pricing queries, search parameter parsing, date validations, and availability checking is centralized in `backend/renterHelper.js` to prevent duplication.

---

## 3. Persistence Mechanisms

- **Database Engine**: Persistent local SQLite3 stored in `backend/trore.db` (for development) and `backend/trore.test.db` (for testing).
- **Data Models**:
  - `hosts` & `renters`: Simple names and accounts.
  - `listings`: Title, district, nightly price, rating, amenities (JSON string), host foreign key, and active flag.
  - `availability_blocks`: Dates blocked for a listing with type `blackout` or `booked`.
  - `booking_requests`: Booking fields, total price, guest info, and status (`pending`, `approved`, `declined`).
  - `saved_searches`: Search parameters (JSON string) and renter foreign key.
  - `audit_records`: Audit log entries mapping timestamps, actors, mutations, and summaries.

---

## 4. Verification Commands & Test Run Output

### Setup Commands
```bash
npm install
npm run seed
npm start
```

### Test Suite Execution
To run all tests:
```bash
npm test
```

### Automated Test Output
```text
✔ Trore Foundation Tests (116.437375ms)
✔ Trore Host Operations Tests (157.045583ms)
✔ Trore Renter Workflow Tests (169.326959ms)
ℹ tests 57
ℹ suites 19
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 358.650708
```

---

## 5. Implementation File Structure

```text
├── server.js                 # Express server & API routes
├── package.json              # Script shortcuts & npm packages
├── README.md                 # Setup & usage instructions
├── RUN_REPORT.md             # Integration & verification report
├── backend/
│   ├── db.js                 # SQLite database config & initialization
│   ├── seed.js               # Deterministic seed data script
│   └── renterHelper.js       # Centralized business logic helpers
├── public/
│   ├── index.html            # Marketplace Web UI
│   ├── css/
│   │   └── index.css         # Modern, responsive stylesheet
│   └── js/
│       └── api.js            # Unified Trore API client
└── tests/
    ├── foundation.test.js    # Basic server, DB, and auth tests
    ├── renter.test.js        # Search, details, and saved searches tests
    ├── operations.test.js    # Host listing and availability tests
    └── booking.test.js       # Booking validations and review tests
```

---

## 6. Known Limitations & Gaps
- **Placeholder Map**: Dynamic map markers scatter using district calculations rather than true geographic coords.
- **Auth Simulation**: Simulated authorization via custom headers (`X-Trore-Actor-Id`) instead of OAuth/JWT.
