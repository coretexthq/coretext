# Story Artifact Alignment Comparison Template

> **Purpose:** Compare how well implementation story artifacts from different experiments align with the original planning specifications.
>
> **Specs Baseline:**
> - [architecture.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/architecture.md)
> - [epics.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/epics.md)
> - [prd.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/prd.md)
> - [ux-design-specification.md](file:///Users/mac/Git/coretext/experiments/trore/_bmad-output/planning-artifacts/ux-design-specification.md)

---

## Output Files

**Output directory:** `experiments/trore/results/comparison/`

**Naming convention:** `{story-id}-{story-slug}.md`

---

## Per-Story Comparison Table

### Story 1-5: Admin Listing Management

**Artifacts Compared:**
- **Exp-B:** [1-5-admin-listing-management.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-b/implementation-artifacts/1-5-admin-listing-management.md)
- **Exp-C:** [1-5-admin-listing-management.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-c/implementation-artifacts/1-5-admin-listing-management.md)

#### Architecture Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| A1 | **Monorepo structure** (`apps/web`, `apps/api`, `packages/*`) | Architecture §Project Structure | 5 | 5 | Both implementations correctly utilized the predefined `apps/web` and `apps/api` monorepo structure. |
| A2 | **Feature-folder architecture** (`src/features/{name}/`) | Architecture §Structure Patterns | 5 | 2 | Exp-B followed feature-folder structure (`features/dashboard`, `features/admin`). Exp-C used standard page-based routing (`src/pages/admin`) and standard components (`src/components/`), violating the feature-slice architecture pattern. |
| A3 | **Service-layer pattern** (Router → Service → DB) | Architecture §Source Organization | 5 | 4 | Exp-B created a `ListingUpdate` schema and added service logic specifically for partial updates. Exp-C added endpoints directly to routers. |
| A4 | **Naming conventions** (camelCase JSON, snake_case Python, PascalCase components) | Architecture §Naming Patterns | 5 | 5 | Both implementations followed standard naming conventions (PascalCase for React components, snake_case for Python). |
| A5 | **State management** (TanStack Query for server, Zustand for client) | Architecture §State Management | 5 | 5 | Both successfully utilized React Query. Exp-C explicitly noted the package was missing and installed it. |
| A6 | **API response format** (standard success/error objects) | Architecture §Format Patterns | 5 | 4 | Exp-B closely adhered to standard error reporting. Both implemented standard success formats. |
| A7 | **Type safety pipeline** (Pydantic → `packages/types` → Web) | Architecture §Type Safety | 5 | 5 | Both leveraged Pydantic models (e.g., `ListingUpdate`) correctly. |
| A8 | **Error handling patterns** (HTTPException w/ codes, Toast notifications) | Architecture §Process Patterns | 5 | 5 | Implementation of error toasts and validations natively handled by both. |
| A9 | **Testing co-location** (tests next to source) | Architecture §Structure Patterns | 5 | 3 | Exp-B correctly co-located tests inside feature folders. Exp-C placed tests adjacent to regular pages rather than feature modules. |
| | | **Architecture Subtotal** | **45/45** | **38/45** | |

#### Epics Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| E1 | **Story description** matches epic user story verbatim | Epics §Story 1-5 | 4 | 3 | The Epics spec does not explicitly separate Story 1.5, yet both implementations structured specific flows extrapolating correctly from FR20 (Admin overrides). Exp-B aligned purely with edits while Exp-C incorporated deletion patterns. |
| E2 | **All Acceptance Criteria** scenarios reproduced | Epics §Story 1-5 ACs | 5 | 5 | Both successfully targeted and successfully implemented their generated Acceptance Criteria. |
| E3 | **Scenario details** faithfully preserved (Given/When/Then) | Epics §Story 1-5 ACs | 5 | 5 | Both use the standard Given/When/Then BD behavior testing formats for their criteria planning. |
| | | **Epics Subtotal** | **14/15** | **13/15** | |

#### PRD Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| P1 | **Functional Requirements** covered (list relevant FR#s) | PRD §Functional Reqs | 5 | 5 | Fully covers Admin overrides (FR20) and ties functionally into Admin inputs (FR27) and Review Dashboards (FR19). |
| P2 | **Non-Functional Requirements** addressed (list relevant NFR#s) | PRD §Non-Functional Reqs | 5 | 5 | Proper attention was given to secured Admin routes across both setups. |
| P3 | **Technical stack** compliance (React 19, FastAPI, Pydantic v2, etc.) | PRD §Project Classification | 5 | 5 | Complete adherence to the specified tools (TanStack Query, FastAPI, Pydantic). |
| | | **PRD Subtotal** | **15/15** | **15/15** | |

#### UX Design Specification Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| U1 | **Design system** (Tailwind CSS + Radix UI) | UX §Design System | 5 | 5 | Tailwind styling is used consistently. |
| U2 | **Color system** (Trust Blue `#0066CC`, neutral grays) | UX §Color System | 4 | 4 | Implicitly handled via standard predefined theme variables. |
| U3 | **Component anatomy & states** (per UX component specs) | UX §Component Strategy | 5 | 5 | Reusability of `ListingForm` mapped perfectly to the unified Edit Mode component guidelines. |
| U4 | **Responsive strategy** (mobile-first, grid breakpoints) | UX §Responsive Design | 5 | 5 | Responsive structure and tabular representations incorporated cleanly. |
| U5 | **Feedback patterns** (toasts, empty states, loading/skeleton) | UX §Feedback Patterns | 5 | 5 | Implementation of loading states inside forms and success toasts post-mutation completed natively. |
| | | **UX Subtotal** | **24/25** | **24/25** | |

#### Summary Scorecard

| Spec Source | Max | Exp-B | Exp-C | Δ |
|:------------|:---:|:-----:|:-----:|:-:|
| Architecture | 45 | 45 | 38 | +7 |
| Epics | 15 | 14 | 13 | +1 |
| PRD | 15 | 15 | 15 | 0 |
| UX Design | 25 | 24 | 24 | 0 |
| **Total** | **100** | **98** | **90** | **+8** |

#### Key Differences

| Dimension | Exp-B | Exp-C |
|:----------|:------|:------|
| **Folder structure** | Strictly adheres to the project's requirement of feature-slices (`features/dashboard`, `features/admin`). | Simplifies directory structure down to standard pages (`pages/admin`), discarding strict feature-slicing logic. |
| **API endpoint pattern** | Implemented `PATCH /listings/{id}` for robust partial attribute updates. | Added standard `PUT /listings/{id}` for entire object replacement, coupled with a `DELETE` implementation. |
| **Form library / validation** | Strong emphasis on server-side partial validations tying strictly into Pydantic overrides. | Managed complex visual loading states successfully prior to edits to avoid display popping. |
| **State management approach** | Standard `useListingDetails` queries combined with explicit mutations. | Found omission of core dependency `@tanstack/react-query`, installing it as a fix before implementing robust fetch cycles (`useListings`, `useDeleteListing`, `useUpdateListing`). |
| **Test strategy** | Tests explicitly co-located adjacent to features directly impacting the module. | Standard testing placed alongside core UI pages regardless of logical boundaries. |
| **Notable omissions** | Did not include a strict "Delete" feature from the prompt extrapolations (although not firmly dictated by ACs). | Completely skipped architectural mandates requiring `features/{name}/` encapsulation. |

#### Verdict

> **Winner:** Exp-B
> **Rationale:** While Exp-C displayed great proactiveness installing missing dependencies and addressing dashboard deletions, Exp-B comprehensively adhered to the vital architectural layout constraints (feature-folders) and utilized tighter REST API patterns (PATCH), ultimately leading to higher compliance with project specifications.
