# Trore-v3-4 Final Run Report (Baseline Arm)

This report summarizes the baseline implementation of **Trore**, a locally runnable full-stack short-term rental lodging marketplace and operations prototype.

## Completed Workflows

1. **Renter Workflows**:
   - **Search & Discovery**: Responsive grid and map-placeholder view synced to the same filtered list. Includes text query, district filter, price range, bedroom counts, amenities checklists, and date ranges.
   - **URL Query Param Sync**: Complete bi-directional synchronization (search state is restored on direct navigation/reload, and updates are pushed to history via `pushState`).
   - **Saved Searches**: Enabled users to save their current URL filter state, list saved combinations, and reopen them.
   - **Listing Details & Bookings**: Displays listing info, host details, blackout dates, price quoting, and checkout validation.

2. **Host Workflows**:
   - **Listing CRUD**: Host dashboard to view, create, edit, and toggle publication status of listings owned by the active host.
   - **Blackout Management**: Interface to add or remove blackout dates.
   - **Booking Request Review**: Display of host-specific bookings with actions to approve or decline them.
   - **Access Control**: Strict backend verification of host ownership for mutations.

3. **Reviewer/Admin Workflow**:
   - **Audit Logs View**: Tabular logs viewable by the reviewer role showing timestamps, actors, actions, entities, and summaries.
   - **Comprehensive Logs**: Automated logging for all required mutations (create/edit, publish, blackouts, booking requests, approvals/declines, and saved searches).

4. **API and Security**:
   - Centralized `X-Trore-Auth: v3-4-case-study` validation in the backend.
   - Shared client logic in the frontend client (`public/api.js`).
   - Rejection of missing/invalid headers.

5. **Persistence**:
   - SQLite storage (`trore.db`) managed via native `node:sqlite` connection.
   - Schema defined in `src/db/schema.sql`.
   - Seed script in `src/db/seed.js` with deterministic, isolated seed records.

---

## Verification Results

- **Automated Test Suite**: 40 tests running sequentially using Node's native test runner cover:
  - SQLite database schemas, relationships, and persistence across server connections.
  - Express routes, central authentication middleware rejection, and allowed access.
  - Renter search filters, sorting, details, saved searches, and booking request validations.
  - Host ownership validations, publication toggling, blackout additions/removals, booking updates.
  - Overlap collisions (auto-declining pending overlaps on approval, blocking blackout addition on approved bookings).
  - Admin audit logs completeness and headers check.
- **Manual Verification**: Detailed in `SMOKE_TESTS.md` covering step-by-step user interactions across all three roles.
- **Offline Self-Containment**: Replaced external Google Fonts links with a system default sans-serif font stack.

All 40 automated tests passed:
```text
✔ Database Schema and Seeding Verification (25.138417ms)
✔ Express Server and Middleware Verification (75.520417ms)
✔ Renter API Endpoints Verification (45.390823ms)
✔ Host API Endpoints Verification (62.812401ms)
✔ Admin and Audit Logs Verification (28.710319ms)
✔ Central Booking and Blackout Validation Constraints (35.618911ms)
✔ C5 Invariant Validation (55.489112ms)
ℹ tests 40
ℹ pass 40
```

---

## Known Gaps & Risks

- **Authentication**: Fully simulated via local actor selection dropdown. In production, this must be replaced with session-based JWT/OAuth auth.
- **SQLite Concurrency**: Standard single-threaded SQLite operations. Configured test runner sequentially (`--test-concurrency=1`) to avoid locks; production usage requires WAL mode or a multi-write DB like PostgreSQL.
- **Lexicographical Date Checks**: Dates stored as ISO string text (`YYYY-MM-DD`). Relies on JavaScript validation and string-based comparisons in SQLite.
- **Map Visuals**: Map view is a visual coordinate layout mapping results on an interactive grid rather than loading heavy external mapping APIs.

---

## Key File Locations

- **Backend**: `src/server.js`, `src/db/db.js`, `src/db/schema.sql`, `src/db/seed.js`
- **Frontend**: `public/index.html`, `public/app.css`, `public/api.js`, `public/app.js`
- **Tests**: `test/server.test.js`, `test/db.test.js`, `test/c5_invariants.test.js`
- **Handoff Files**: `handoff/session-00-coordinator.md` through `handoff/session-05-integration.md`
- **Documentation**: `README.md`, `SMOKE_TESTS.md`
