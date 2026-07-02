Trore is a bounded full-stack lodging marketplace case study used to evaluate Coretext-assisted software work. The project goal is to build a locally runnable rental-property application with renter discovery, host management, booking requests, saved searches, persistent data, and explicit cross-cutting invariants.

The active evaluation claim is narrow: Coretext should make the project easier to inspect, steer, resume, and reuse than a native session, not prove universal coding-agent superiority.

# Backlog
- [ ] Coordinator session creates or verifies the fixed scope notes.
- [ ] C1 `trore.foundation`: build application foundation, database schema, seed data, and local setup.
- [ ] C2 `trore.renter`: build renter discovery, URL search state, saved searches, and listing details.
- [ ] C3 `trore.operations.host`: build host listing management, publication, and blackout management.
- [ ] C4 `trore.operations.booking`: build booking lifecycle, auth header, ownership checks, and audit records.
- [ ] C5 `trore.integration`: run integration hardening, final tests, run docs, and known-risk review.
- [ ] Parent scopes verify child summaries before durable distillation.
- [ ] Promote only reusable, future-facing, verifiable constraints into rules or route edges.

---

# Resource
- `PROMPT_PRODUCT_GOAL.md`: frozen product requirement used by both arms.
- `RUN_PROMPT.md` or transcript input: Coretext arm init prompt for this run.
- Experiment controller artifacts: case-study protocol and artifact requirements outside the arm workspace.

---

# Product Boundary

Trore-v3-4 is a local prototype, not a production marketplace. It must include a frontend, backend API, persistent local database, seed data, tests or smoke checks, and local run instructions.

In scope:

- renter listing discovery with URL-driven search, filters, sorting, pagination, and view mode;
- listing detail page with availability and booking request flow;
- saved searches persisted through the backend;
- host listing management, availability management, and booking review;
- audit trail for listing, booking, and saved-search mutations;
- responsive UI for desktop and mobile-width inspection.

Out of scope:

- real payments;
- real geocoding or map provider integration;
- production identity, OAuth, or email delivery;
- live messaging;
- external deployment;
- brand cloning or external assets.

# Core Invariants

- Search, filter, sort, pagination, and view mode state must be URL-driven.
- API calls from the frontend must use the configured Trore auth header.
- Seed data must stay isolated from UI components.
- Persistent entities must survive server restart unless the database is explicitly reset.
- Booking requests must validate availability, date ranges, listing status, and host ownership rules.
- Shared filtering, API-client, pricing, and booking-validation logic should not be duplicated across screens.

# Fixed Scope Tree

The Coretext arm must use this scope tree. The project coordinator owns `trore`; product checkpoint workers operate at the appropriate depth; parent scope agents verify and distill child evidence.

- `knowledge/trore.foundation.md`
- `knowledge/trore.renter.md`
- `knowledge/trore.operations.md`
- `knowledge/trore.operations.host.md`
- `knowledge/trore.operations.booking.md`
- `knowledge/trore.integration.md`

Audit and recovery agents must not write ordinary build summaries under `knowledge/ai/`. If post-run summaries are required, mark them as audit or recovery evidence and exclude them from implementation-session counts.

# Starting Strategy

Begin from the frozen product goal and this durable note. Use repository search and focused reads before editing. Preserve session evidence in `knowledge/ai/`. Distill only confirmed final state into this durable note after the parent/integrating agent verifies files and commands directly.

Delegation is mandatory for this experiment version. Do not collapse the product build into one project-level session. The experiment compares flat baseline handoffs against structured Coretext scope ownership.
