### Story 1-3: Seeker Discovery Grid & Keyword Search

**Artifacts Compared:**
- **Exp-B:** [1-3-seeker-discovery-grid-keyword-search.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-b/implementation-artifacts/1-3-seeker-discovery-grid-keyword-search.md)
- **Exp-C:** [1-3-seeker-discovery-grid-keyword-search.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-c/implementation-artifacts/1-3-seeker-discovery-grid-keyword-search.md)

#### Architecture Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| A1 | **Monorepo structure** (`apps/web`, `apps/api`, `packages/*`) | Architecture §Project Structure | 5 | 5 | Both accurately implemented the monorepo structure utilizing `apps/web` and `apps/api`. |
| A2 | **Feature-folder architecture** (`src/features/{name}/`) | Architecture §Structure Patterns | 5 | 1 | Exp-B strictly followed the architecture by creating `apps/web/src/features/listing/`. Exp-C completely bypassed this, instead utilizing a standard global generic `apps/web/src/components/` and `apps/web/src/pages/` pattern. |
| A3 | **Service-layer pattern** (Router → Service → DB) | Architecture §Source Organization | 2 | 2 | Both implementations handled database queries and logic directly at the routing level (e.g. `routers/listings.py`) instead of abstracting into a distinct service layer. |
| A4 | **Naming conventions** (camelCase JSON, snake_case Python, PascalCase components) | Architecture §Naming Patterns | 4 | 4 | Both utilized standard framework-specific naming conventions implicitly. |
| A5 | **State management** (TanStack Query for server, Zustand for client) | Architecture §State Management | 5 | 1 | Exp-B successfully implemented the `useListings` hook using TanStack Query as the source of truth. Exp-C violated standards by depending solely on `useEffect` for fetching and keeping state intentionally "simple". |
| A6 | **API response format** (standard success/error objects) | Architecture §Format Patterns | 4 | 4 | Both implemented standard list responses with schema structures handling limit/offset parameters. |
| A7 | **Type safety pipeline** (Pydantic → `packages/types` → Web) | Architecture §Type Safety | 5 | 3 | Exp-B manually synced Pydantic models with `packages/types/index.d.ts` per instructions. Exp-C mentioned strict types but overlooked centralizing in `packages/types`. |
| A8 | **Error handling patterns** (HTTPException w/ codes, Toast notifications) | Architecture §Process Patterns | 3 | 3 | Handled basic API errors, although neither explicitly mentioned specific HTTP Exception patterns in their task lists. |
| A9 | **Testing co-location** (tests next to source) | Architecture §Structure Patterns | 5 | 4 | Exp-B explicitly co-located frontend tests `ListingCard.test.tsx` inside the feature folder. Exp-C also co-located tests next to the components layer. |
| | | **Architecture Subtotal** | **38/45** | **27/45** | |

#### Epics Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| E1 | **Story description** matches epic user story verbatim | Epics §Story 1.3 | 5 | 3 | Exp-B matched the verbatim description strictly. Exp-C modified the user story to account for missing PRD components ("...and search them by keyword..."). |
| E2 | **All Acceptance Criteria** scenarios reproduced | Epics §Story 1.3 ACs | 5 | 3 | Exp-B preserved the two exact scenarios provided in the Epics document. Exp-C added two fundamentally new scenarios (Keyword Search mapping to FR3, and explicit Pagination) absent from the Epics specs. |
| E3 | **Scenario details** faithfully preserved (Given/When/Then) | Epics §Story 1.3 ACs | 5 | 3 | Exp-B reproduced the Given/When/Then exactly. Exp-C slightly altered the Default View to mention multiple database statuses ("DRAFT") that were not in the specific original Epic format. |
| | | **Epics Subtotal** | **15/15** | **9/15** | |

#### PRD Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| P1 | **Functional Requirements** covered (list relevant FR#s) | PRD §Functional Reqs | 1 | 5 | Foundational divergence. FR3 implicitly mapped to Story 1.3 in planning, but was omitted from the explicit Epics documentation. Exp-B blindly followed Epics and missed FR3 (Keyword Search). Exp-C identified the PRD requirement and successfully implemented full keyword search. |
| P2 | **Non-Functional Requirements** addressed (list relevant NFR#s) | PRD §Non-Functional Reqs | 4 | 4 | Addressed fast contentful paint through pagination limitations and correct bounding box DB querying. |
| P3 | **Technical stack** compliance (React 19, FastAPI, Pydantic v2, etc.) | PRD §Project Classification | 5 | 3 | Exp-B utilized the designated stack and tooling seamlessly. Exp-C failed to utilize TanStack Query, relying on legacy React structures (`useEffect`). |
| | | **PRD Subtotal** | **10/15** | **12/15** | |

#### UX Design Specification Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| U1 | **Design system** (Tailwind CSS + Radix UI) | UX §Design System | 5 | 4 | Exp-B heavily notes and uses Tailwind grid/flex utilities. Exp-C specifies "CSS Grid", deviating from specific mandated framework semantics for styling. |
| U2 | **Color system** (Trust Blue `#0066CC`, neutral grays) | UX §Color System | 3 | 3 | Neither explicitly specifies handling deep color theming within their task lists, favoring standard structural implementation. |
| U3 | **Component anatomy & states** (per UX component specs) | UX §Component Strategy | 5 | 5 | Both accurately represent the formatting requirements for the ListingCard (Price truncation, M^2 parsing, District rendering, Placeholder images). |
| U4 | **Responsive strategy** (mobile-first, grid breakpoints) | UX §Responsive Design | 5 | 3 | Exp-B perfectly followed the required UX responsive strategy constraints exactly reading components: `1 col mobile, 3-4 col desktop`. Exp-C only abstracted with generic `CSS Grid`. |
| U5 | **Feedback patterns** (toasts, empty states, loading/skeleton) | UX §Feedback Patterns | 3 | 5 | Exp-C extensively focused on UX States, resolving "Loading", "Error", and standard empty state components ("No properties found") as per the UX spec. |
| | | **UX Subtotal** | **21/25** | **20/25** | |

#### Summary Scorecard

| Spec Source | Max | Exp-B | Exp-C | Δ |
|:------------|:---:|:-----:|:-----:|:-:|
| Architecture | 45 | 38 | 27 | +11 (B) |
| Epics | 15 | 15 | 9 | +6 (B) |
| PRD | 15 | 10 | 12 | +2 (C) |
| UX Design | 25 | 21 | 20 | +1 (B) |
| **Total** | **100** | **84** | **68** | **+16 (B)** |

#### Key Differences

| Dimension | Exp-B | Exp-C |
|:----------|:------|:------|
| **Folder structure** | Strictly maintained `features/listing/*` module layout. | Abandoned feature structure; utilized legacy flat `src/components/`, `src/pages/` pattern globally. |
| **State management approach** | Validated utilizing architectural required `useListings` TanStack Query integrations. | Hardcoded basic `useEffect` hooks for frontend data fetching; missing ecosystem consistency. |
| **Requirements interpretation** | Explicitly locked onto verbatim Epic ACs, causing major PRD oversight. Did not implement search functionalities. | Flexed inference limits, successfully crossing PRD mapping gaps and implementing the missing Keyword Search (FR3). |
| **Responsive design pattern** | Matched specific semantic column breakpoints matching UX Spec expectations closely. | Relied only on conceptual layout architectures without strict constraint parameters highlighted. |
| **Notable omissions** | Did not support FR3 (Keyword Search). Missed UI empty states. | Missed core architecture components (Feature-folder topology, TanStack Query standard). |

#### Verdict

> **Winner:** Exp-B
> **Rationale:** Although Exp-C intuitively recognized and implemented a systemic gap representing Keyword Search functionally (FR3), Exp-B delivered a considerably more architecturally sound asset that fully respected feature-folder constraints and required state-management utilities, showcasing tighter overall spec alignment.
