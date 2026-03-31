# Story Artifact Alignment Comparison

> **Purpose:** Compare how well implementation story artifacts from different experiments align with the original planning specifications.
>
> **Specs Baseline:**
> - [architecture.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/architecture.md)
> - [epics.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/epics.md)
> - [prd.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/prd.md)
> - [ux-design-specification.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/ux-design-specification.md)

---

## Rating Scale

| Score | Label | Meaning |
|:-----:|:------|:--------|
| 5 | **Full** | Completely aligned — spec requirement addressed verbatim or faithfully |
| 4 | **Strong** | Addressed with minor deviations or omissions |
| 3 | **Partial** | Key aspects present but notable gaps or reinterpretations |
| 2 | **Weak** | Mentioned but substantially deviated or incomplete |
| 1 | **Missing** | Not addressed at all |
| N/A | **Not Applicable** | Requirement not relevant to this story |

---

## Per-Story Comparison Table

### Story 1-4: Property Detail View & Metadata

**Artifacts Compared:**
- **Exp-B:** [1-4-property-detail-view-metadata.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-b/implementation-artifacts/1-4-property-detail-view-metadata.md)
- **Exp-C:** [1-4-property-detail-view-metadata.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-c/implementation-artifacts/1-4-property-detail-view-metadata.md)

#### Architecture Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| A1 | **Monorepo structure** (`apps/web`, `apps/api`, `packages/*`) | Architecture §Project Structure | 5 | 4 | Exp-B explicitly addresses `packages/types`, whereas Exp-C omits any mention of shared `packages`. |
| A2 | **Feature-folder architecture** (`src/features/{name}/`) | Architecture §Structure Patterns | 5 | 2 | Exp-B strictly uses `apps/web/src/features/listing/`. Exp-C groups by type (`src/pages`, `src/components`, `src/hooks`). |
| A3 | **Service-layer pattern** (Router → Service → DB) | Architecture §Source Organization | 4 | 3 | Exp-B adheres closely with `api/v1/listings.py`. Exp-C places endpoints directly in `routers/listings.py`. |
| A4 | **Naming conventions** (camelCase JSON, snake_case Python, PascalCase components) | Architecture §Naming Patterns | 5 | 4 | Both follow standard naming. Exp-B explicitly mentions updating backend types to snake_case. |
| A5 | **State management** (TanStack Query for server, Zustand for client) | Architecture §State Management | 5 | 3 | Exp-B enforces TanStack Query for the data fetching hook. Exp-C implements a custom hook without explicit TanStack usage. |
| A6 | **API response format** (standard success/error objects) | Architecture §Format Patterns | 5 | 4 | Both implement 404 error responses. Exp-B relies on FastAPI's strict path type hint for 422 validations. |
| A7 | **Type safety pipeline** (Pydantic → `packages/types` → Web) | Architecture §Type Safety | 5 | 1 | Exp-B includes explicit shared type syncing tasks. Exp-C completely misses cross-stack typed syncing. |
| A8 | **Error handling patterns** (HTTPException w/ codes, Toast notifications) | Architecture §Process Patterns | 5 | 4 | Both handle HTTP exceptions for missing UUIDs and provide friendly frontend fallback states. |
| A9 | **Testing co-location** (tests next to source) | Architecture §Structure Patterns | 5 | 2 | Exp-B co-locates `ListingDetail.test.tsx` with its component. Exp-C lumps tests alongside flat components. |
| | | **Architecture Subtotal** | **44/45** | **27/45** | |

#### Epics Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| E1 | **Story description** matches epic user story verbatim | Epics §Story 1.4 | 5 | 5 | Both accurately transcribe the user story from the epics. |
| E2 | **All Acceptance Criteria** scenarios reproduced | Epics §Story 1.4 ACs | 5 | 5 | AC1 (Full Rendering) & AC2 (Invalid ID) explicitly listed in both. |
| E3 | **Scenario details** faithfully preserved (Given/When/Then) | Epics §Story 1.4 ACs | 5 | 5 | Preserved the exact Gherkin syntax formatting. |
| | | **Epics Subtotal** | **15/15** | **15/15** | |

#### PRD Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| P1 | **Functional Requirements** covered (list relevant FR#s) | PRD §Functional Reqs | 5 | 5 | Implicit requirements for UUID-based detail pages are addressed. |
| P2 | **Non-Functional Requirements** addressed (list relevant NFR#s) | PRD §Non-Functional Reqs | 5 | 5 | Covered basics of functional routing and page state loading smoothly. |
| P3 | **Technical stack** compliance (React 19, FastAPI, Pydantic v2, etc.) | PRD §Project Classification | 5 | 5 | Standard usage of FastAPI, React, and Tailwind in both. |
| | | **PRD Subtotal** | **15/15** | **15/15** | |

#### UX Design Specification Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| U1 | **Design system** (Tailwind CSS + Radix UI) | UX §Design System | 4 | 4 | Both mention Tailwind styling; Radix UI isn't explicitly brought up for this simple read view. |
| U2 | **Color system** (Trust Blue `#0066CC`, neutral grays) | UX §Color System | 3 | 3 | Implicit styling considerations rather than explicitly listed color rules. |
| U3 | **Component anatomy & states** (per UX component specs) | UX §Component Strategy | 5 | 5 | Handled JSONB `attributes` parsing into a Features grid successfully. |
| U4 | **Responsive strategy** (mobile-first, grid breakpoints) | UX §Responsive Design | 5 | 5 | Flex/Grid layouts via Tailwind implicitly invoked in AC solutions. |
| U5 | **Feedback patterns** (toasts, empty states, loading/skeleton) | UX §Feedback Patterns | 5 | 4 | Exp-B mentions Skeleton loaders for `isLoading`. Exp-C notes handling the loading state generically. |
| | | **UX Subtotal** | **22/25** | **21/25** | |

#### Summary Scorecard

| Spec Source | Max | Exp-B | Exp-C | Δ |
|:------------|:---:|:-----:|:-----:|:-:|
| Architecture | 45 | 44 | 27 | +17 |
| Epics | 15 | 15 | 15 | 0 |
| PRD | 15 | 15 | 15 | 0 |
| UX Design | 25 | 22 | 21 | +1 |
| **Total** | **100** | **96** | **78** | **+18** |

#### Key Differences

| Dimension | Exp-B | Exp-C |
|:----------|:------|:------|
| **Folder structure** | Feature-sliced design (`apps/web/src/features/listing/`) | Conventional grouping (`apps/web/src/pages/`, `apps/web/src/hooks/`) |
| **API endpoint pattern** | Versioned namespace (`app/api/v1/listings.py`) | Flat router (`app/routers/listings.py`) |
| **Form library / validation** | Path param inference via FastAPI dependencies | Standard path parameters |
| **State management approach** | TanStack Query (`useQuery`) | Custom non-specific data fetching hook |
| **Test strategy** | Co-located tests next to the source feature | Components and pages test layout separately |
| **Notable omissions** | None | Neglected the `packages/types` contract synchronization completely and dropped the feature-folder approach. |

#### Verdict

> **Winner:** Exp-B
> **Rationale:** Exp-B stays exceptionally loyal to the rigid architectural specifications outlined in `architecture.md`, such as strictly enforcing the feature-folder pattern, employing TanStack Query, and proactively syncing `packages/types`, whereas Exp-C defaults entirely to simplified standard single-page application patterns.
