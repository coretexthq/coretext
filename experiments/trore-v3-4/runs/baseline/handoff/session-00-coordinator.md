# Session 00 Coordinator Handoff

## Product Goal Summary
Trore is a locally runnable, full-stack lodging marketplace prototype for short-term rental discovery and host operations. It has three core user roles:
1. **Renter:** Searches listings, compares options with filters/sorting/pagination (with state synchronized to/from the URL query parameters), saves searches, views details, and requests bookings.
2. **Host:** Manages listings (creation, editing, publishing/unpublishing), manages availability/blackout dates, and approves or declines booking requests for owned listings.
3. **Reviewer/Admin:** Views audit logs tracking all key mutations (creation, edits, publication, availability, bookings, saved searches).

## Constraints that Every Checkpoint Must Preserve (Cross-Cutting Invariants)
All workers must preserve these constraints across the codebase:
- **URL Source of Truth:** URL query parameters are the source of truth for renter search state (filters, sort, pagination, and view mode). Direct navigation or page reload must restore this state completely.
- **X-Trore-Auth Header:** The frontend must send the header `X-Trore-Auth: v3-4-case-study` on every API request. This must be managed via a shared API client or centralized mechanism rather than manually on each screen.
- **Backend Header Verification:** Protected backend routes must reject any API requests with a missing or incorrect `X-Trore-Auth` header.
- **Database Persistence:** Persistent entities (listings, actors/hosts, availability/blackout periods, booking requests, saved searches, audit logs) must survive server restart and reside in a persistent local database.
- **Seed Data Isolation:** Seed data must be deterministic and isolated from UI components. UI components must not import or mutate seed data arrays directly.
- **Centralized Booking Validation:** Booking validation must be centralized, ensuring listing details and host reviews cannot disagree on availability or ownership.
- **No Copy-Pasted Code:** Shared search/filter parsing should be structured cleanly and not copy-pasted into unrelated views.
- **Result Set Consistency:** The map view (which can be a placeholder) must reflect the exact same filtered result set as the grid view.
- **Out of Scope:** No real payments, no real map provider integration, no real authentication/OAuth (use simple local actor/role selection), no notification systems, and no hosted deployment.

## Fixed Checkpoint Names and Responsibilities
The build is split into five sequential checkpoints:
1. **C1 (Application Foundation):** Sets up application foundation, database schema, seed data, and local setup instructions. Handoff file: `handoff/session-01-foundation.md`.
2. **C2 (Renter Discovery):** Implements renter discovery, URL search state sync, saved searches, and listing details view. Handoff file: `handoff/session-02-renter.md`.
3. **C3 (Host Listing Management):** Implements host listing management, publication toggle, and blackout date management. Handoff file: `handoff/session-03-host.md`.
4. **C4 (Booking Lifecycle):** Implements booking lifecycle (requests, approval/decline), auth header, host ownership checks, and audit records creation. Handoff file: `handoff/session-04-booking-audit.md`.
5. **C5 (Integration Hardening):** Implements integration hardening, final automated/smoke tests, local run docs, and known-risk review. Handoff file: `handoff/session-05-integration.md`.

## Allowed Handoff Inputs
Future workers are allowed to read:
- `PROMPT_PRODUCT_GOAL.md`
- Any prior flat `handoff/session-*.md` files (e.g., `handoff/session-00-coordinator.md`, `handoff/session-01-foundation.md`, etc.)

## Handoff Style Rule
All future workers must write only flat chronological summaries to their respective `handoff/session-*.md` files. They must NOT use hierarchical notes, scoped session summaries, route ledgers, or any Coretext-specific formats.
