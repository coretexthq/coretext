### Story 1-2: Admin Manual Listing Creation

**Artifacts Compared:**
- **Exp-B:** [1-2-admin-manual-listing-creation.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-b/implementation-artifacts/1-2-admin-manual-listing-creation.md)
- **Exp-C:** [1-2-admin-manual-listing-creation.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-c/implementation-artifacts/1-2-admin-manual-listing-creation.md)

#### Architecture Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| A1 | **Monorepo structure** (`apps/web`, `apps/api`, `packages/*`) | Architecture §Project Structure | 5 | 5 | Both correctly scaffolded the monorepo structure. |
| A2 | **Feature-folder architecture** (`src/features/{name}/`) | Architecture §Structure Patterns | 5 | 1 | Exp-B utilized `features/admin/`. Exp-C reverted to a standard `pages/` directory. |
| A3 | **Service-layer pattern** (Router → Service → DB) | Architecture §Source Organization | 3 | 3 | Both implemented router and DB layers directly, leaving the service layer somewhat ambiguous. |
| A4 | **Naming conventions** (camelCase JSON, snake_case Python, PascalCase components) | Architecture §Naming Patterns | 5 | 3 | Exp-B used proper `/api/v1/listings`. Exp-C skipped API versioning (`/listings`). |
| A5 | **State management** (TanStack Query for server, Zustand for client) | Architecture §State Management | 5 | 1 | Exp-B used TanStack Query `useCreateListing`. Exp-C omitted state management specifics entirely. |
| A6 | **API response format** (standard success/error objects) | Architecture §Format Patterns | 4 | 4 | Both handled 503s and basic validation formats well. |
| A7 | **Type safety pipeline** (Pydantic → `packages/types` → Web) | Architecture §Type Safety | 5 | 2 | Exp-B manually synced `packages/types`. Exp-C explicitly skipped syncing them. |
| A8 | **Error handling patterns** (HTTPException w/ codes, Toast notifications) | Architecture §Process Patterns | 5 | 4 | Both implemented toasts and inline errors; B was more explicit about HTTP error codes mapped to UI. |
| A9 | **Testing co-location** (tests next to source) | Architecture §Structure Patterns | 5 | 4 | Exp-B perfectly co-located in `features`. Exp-C co-located but in the non-compliant `pages/` folder. |
| | | **Architecture Subtotal** | **42/45** | **27/45** | |

#### Epics Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| E1 | **Story description** matches epic user story verbatim | Epics §Story 1.2 | 5 | 5 | Verbatim match in both. |
| E2 | **All Acceptance Criteria** scenarios reproduced | Epics §Story 1.2 ACs | 5 | 5 | All 3 scenarios reproduced in both. |
| E3 | **Scenario details** faithfully preserved (Given/When/Then) | Epics §Story 1.2 ACs | 5 | 5 | Gherkin syntax preserved exactly. |
| | | **Epics Subtotal** | **15/15** | **15/15** | |

#### PRD Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| P1 | **Functional Requirements** covered (list relevant FR#s) | PRD §Functional Reqs | 5 | 5 | Both covered FR27 (Admin manual input) and support for FR20. |
| P2 | **Non-Functional Requirements** addressed (list relevant NFR#s) | PRD §Non-Functional Reqs | 4 | 3 | Addressing NFR4/NFR7: Exp-B mocked auth and ensured DB session handling. Exp-C had looser auth definitions. |
| P3 | **Technical stack** compliance (React 19, FastAPI, Pydantic v2, etc.) | PRD §Project Classification | 5 | 5 | Both conformed to React + FastAPI + Pydantic. |
| | | **PRD Subtotal** | **14/15** | **13/15** | |

#### UX Design Specification Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| U1 | **Design system** (Tailwind CSS + Radix UI) | UX §Design System | 5 | 1 | Exp-B used Tailwind CSS UI primitives. Exp-C failed to mention the design system. |
| U2 | **Color system** (Trust Blue `#0066CC`, neutral grays) | UX §Color System | 4 | 4 | Exp-C referenced the palette; Exp-B implicitly used it via primitives. |
| U3 | **Component anatomy & states** (per UX component specs) | UX §Component Strategy | 5 | 3 | Exp-B built form with react-hook-form managing local states optimally. |
| U4 | **Responsive strategy** (mobile-first, grid breakpoints) | UX §Responsive Design | 3 | 3 | Not explicitly detailed in either implementation artifact. |
| U5 | **Feedback patterns** (toasts, empty states, loading/skeleton) | UX §Feedback Patterns | 5 | 5 | Both fully implemented success toasts and inline errors. |
| | | **UX Subtotal** | **22/25** | **16/25** | |

#### Summary Scorecard

| Spec Source | Max | Exp-B | Exp-C | Δ |
|:------------|:---:|:-----:|:-----:|:-:|
| Architecture | 45 | 42 | 27 | +15 |
| Epics | 15 | 15 | 15 | 0 |
| PRD | 15 | 14 | 13 | +1 |
| UX Design | 25 | 22 | 16 | +6 |
| **Total** | **100** | **93** | **71** | **+22** |

#### Key Differences

| Dimension | Exp-B | Exp-C |
|:----------|:------|:------|
| **Folder structure** | Strictly adhered to feature-based structure (`apps/web/src/features/admin/`). | Resorted to standard un-patterned SPA folder structure (`apps/web/src/pages/`). |
| **API endpoint pattern** | Included API versioning (`POST /api/v1/listings`). | Missed API versioning (`POST /listings`). |
| **Form library / validation** | Explicitly used `react-hook-form` coupled with `zod`. | Did not specify form state management library. |
| **State management approach** | Used `TanStack Query` for mutations per Architecture Spec. | Omitted state management specifics entirely. |
| **Test strategy** | Tests flawlessly co-located within the specific feature folder. | Tests co-located, but within the non-architecturally aligned `pages` directory. |
| **Notable omissions** | Service layer skipped (direct router to DB). | Missing TanStack Query, `packages/types` sync, feature-folders, Tailwind usage. |

#### Verdict

> **Winner:** Exp-B
> **Rationale:** Exp-B successfully executed complex architectural constraints (feature-folder structure, TanStack Query, and typed package syncing), whereas Exp-C drifted toward a generic React pattern heavily reducing its structural alignment.
