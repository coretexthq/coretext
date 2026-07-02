# Trore-v3-4 Target Product Goal

Build **Trore**, a locally runnable full-stack lodging marketplace prototype for short-term rental discovery and host operations.

This is a bounded product build. Produce working software, tests or smoke checks, and clear local run instructions. Do not treat this as a design-only exercise.

## Required Stack Boundary

The final artifact must include:

- a responsive web frontend;
- a backend API;
- persistent local database storage;
- deterministic seed data;
- local setup and run commands;
- automated tests or documented smoke checks that can be run locally.

You may choose specific libraries and project structure, but the app must be inspectable from the repository and must not depend on external hosted services to run. CDN-loaded CSS, JavaScript, fonts, icons, or map assets count as external hosted services unless they are vendored locally.

## Core Users

Trore has three user modes:

- **Renter:** searches listings, compares options, views details, saves searches, and submits booking requests.
- **Host:** manages listings, updates availability, and reviews booking requests for their listings.
- **Reviewer/Admin:** inspects audit logs and verifies that important mutations were recorded.

Production authentication is out of scope. Use a simple local role or actor selector if needed, but permission checks must still be represented in backend behavior for host-owned resources.

## Renter Workflows

Implement listing discovery with:

- listing cards showing title, district, nightly price, bedrooms, amenities, rating, short description, and availability signal;
- text search;
- district filter;
- price range filter;
- bedroom count filter;
- amenities filter with at least air conditioning, balcony, parking, pool, workspace, and pet friendly;
- date range filter;
- sort options for relevance, price, rating, and newest;
- pagination;
- grid view and map-placeholder view over the same filtered result set.

Search, filter, sort, pagination, and view mode state must be represented in URL query parameters. The UI must restore the same state after reload or direct navigation to the URL. Do not store canonical filter state only in component-local state.

Implement listing detail with:

- full listing information;
- host name;
- amenities;
- availability or blackout dates;
- simple price quote for a selected date range;
- booking request form;
- clear validation errors for unavailable dates, invalid ranges, missing renter information, or inactive listings.

Implement saved searches:

- save the current filter combination through the backend;
- list saved searches;
- reopen a saved search so the URL-driven filter state is restored.

## Host Workflows

Implement host operations with:

- list of host-owned listings;
- create listing;
- edit listing;
- publish or unpublish listing;
- manage availability or blackout date ranges;
- view booking requests for owned listings;
- approve or decline pending booking requests.

The backend must enforce that a host can mutate only listings and booking requests owned by that host. UI hiding alone is not enough.

## Reviewer/Admin Workflow

Implement an audit view or endpoint that shows mutation history for:

- listing creation and edits;
- publish or unpublish actions;
- availability changes;
- booking request creation;
- booking approval or decline;
- saved-search creation.

Audit records must include timestamp, actor, action type, entity type, entity ID, and a concise summary.

## Backend Requirements

Implement API routes for:

- listing search and listing detail;
- saved searches;
- booking requests;
- host listing management;
- availability management;
- booking review;
- audit log retrieval.

Every frontend API request must include this header:

```text
X-Trore-Auth: v3-4-case-study
```

The backend must reject protected API requests that omit the header.

Use a shared frontend API client or equivalent central mechanism so the header rule is not reimplemented differently on each screen.

## Persistence Requirements

Use a persistent local database. Data that must persist includes:

- listings;
- hosts or local actors;
- availability or blackout periods;
- booking requests;
- saved searches;
- audit records.

Seed data must be deterministic and isolated from UI components. UI components must not import or mutate the seed data array directly.

Provide a documented reset or seed command if useful.

## Cross-Cutting Invariants

These invariants must hold across the application:

- URL query parameters are the source of truth for listing search state, filters, sort, pagination, and view mode.
- The frontend sends `X-Trore-Auth: v3-4-case-study` on every API request.
- Protected backend routes reject missing or incorrect Trore auth headers.
- Persistent entities survive server restart unless an explicit reset is run.
- Seed data remains isolated from UI components.
- Booking validation is centralized enough that listing detail and host review cannot disagree about availability or ownership.
- Shared search/filter parsing should not be copy-pasted into unrelated views.
- The map view may be a placeholder, but it must reflect the same filtered result set as the grid view.

## Verification Expectations

At minimum, verify:

- local setup succeeds from a clean checkout;
- backend API starts;
- frontend starts;
- listing search updates and restores URL query state;
- API requests include the Trore auth header;
- missing backend auth header is rejected;
- saved searches persist and reopen filter state;
- booking requests validate unavailable dates and invalid ranges;
- host ownership checks block unauthorized mutations;
- audit records are created for required mutation types.

Prefer automated tests for shared parsing, API auth behavior, persistence, booking validation, and permission checks. If a full browser test is not feasible, include a documented manual smoke-test script with exact steps and expected results.

## Out of Scope

Do not implement:

- real payments;
- real map provider integration;
- production authentication or OAuth;
- email, SMS, or push notifications;
- real-time messaging;
- deployment to a hosted service;
- external brand assets or copied marketplace branding.

## Final Deliverables

The final repository must include:

- source code for frontend and backend;
- persistent database setup or migration/seed mechanism;
- tests or smoke checks;
- local run instructions;
- a short implementation report covering completed workflows, known gaps, verification commands, and important files.
