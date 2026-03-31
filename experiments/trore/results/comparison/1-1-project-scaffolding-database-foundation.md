# Story 1.1: Project Scaffolding & Database Foundation

**Artifacts Compared:**
- **Exp-B:** [1-1-project-scaffolding-database-foundation.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-b/implementation-artifacts/1-1-project-scaffolding-database-foundation.md)
- **Exp-C:** [1-1-project-scaffolding-database-foundation.md](file:///Users/mac/Git/coretext/experiments/trore/results/exp-c/implementation-artifacts/1-1-project-scaffolding-database-foundation.md)

#### Architecture Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| A1 | **Monorepo structure** (`apps/web`, `apps/api`, `packages/*`) | Architecture §Project Structure | 5 | 5 | Both correctly initialized Turborepo and the required workspaces. |
| A2 | **Feature-folder architecture** (`src/features/{name}/`) | Architecture §Structure Patterns | 5 | 1 | Exp-B explicitly created the `features/` directory in Web; Exp-C missed this entirely. |
| A3 | **Service-layer pattern** (Router → Service → DB) | Architecture §Source Organization | 4 | 2 | Exp-B created the db/models/schemas hierarchy. Exp-C only set up basic files like main.py. |
| A4 | **Naming conventions** (camelCase JSON, snake_case Python, PascalCase components) | Architecture §Naming Patterns | 5 | 4 | Exp-B called out the conventions explicitly in its notes. Exp-C only mentioned camelCase briefly. |
| A5 | **State management** (TanStack Query for server, Zustand for client) | Architecture §State Management | 5 | 1 | Exp-B successfully installed Zustand and TanStack Query. Exp-C completely missed them. |
| A6 | **API response format** (standard success/error objects) | Architecture §Format Patterns | N/A | N/A | Not applicable to the foundational scaffolding phase. |
| A7 | **Type safety pipeline** (Pydantic → `packages/types` → Web) | Architecture §Type Safety | 4 | 4 | Both created the `packages/types` workspace but pipeline integration isn't fully implemented yet. |
| A8 | **Error handling patterns** (HTTPException w/ codes, Toast notifications) | Architecture §Process Patterns | N/A | N/A | Not applicable to scaffolding stage. |
| A9 | **Testing co-location** (tests next to source) | Architecture §Structure Patterns | 3 | 4 | Exp-B centralized tests under `tests/scaffolding/`. Exp-C correctly co-located frontend tests (`App.test.tsx`). |
| | | **Architecture Subtotal** | **31/35** | **21/35** | *(Adjusted max due to N/A rows)* |

#### Epics Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| E1 | **Story description** matches epic user story verbatim | Epics §Story 1.1 | 5 | 5 | Story descriptions strictly match the Epics doc in both implementations. |
| E2 | **All Acceptance Criteria** scenarios reproduced | Epics §Story 1.1 ACs | 5 | 5 | All key scenarios were fully included and verified in both. |
| E3 | **Scenario details** faithfully preserved (Given/When/Then) | Epics §Story 1.1 ACs | 5 | 4 | Exp-B kept the bullet point formatting perfectly; Exp-C dropped some formatting. |
| | | **Epics Subtotal** | **15/15** | **14/15** | |

#### PRD Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| P1 | **Functional Requirements** covered (list relevant FR#s) | PRD §Functional Reqs | 5 | 5 | FR16 (UUID assignment) handled in db schema setup for both. |
| P2 | **Non-Functional Requirements** addressed (list relevant NFR#s) | PRD §Non-Functional Reqs | N/A | N/A | NFRs are performance/scaling-related, not applicable during foundational scaffolding. |
| P3 | **Technical stack** compliance (React 19, FastAPI, Pydantic v2, etc.) | PRD §Project Classification | 5 | 5 | Both properly integrated and installed the required dependency stacks. |
| | | **PRD Subtotal** | **10/10** | **10/10** | *(Adjusted max due to N/A rows)* |

#### UX Design Specification Alignment

| # | Requirement | Spec Reference | Exp-B | Exp-C | Notes |
|:-:|:------------|:---------------|:-----:|:-----:|:------|
| U1 | **Design system** (Tailwind CSS + Radix UI) | UX §Design System | 4 | 1 | Exp-B installed and set up Tailwind CSS. Exp-C completely missed Tailwind CSS. Neither mentioned Radix. |
| U2 | **Color system** (Trust Blue `#0066CC`, neutral grays) | UX §Color System | N/A | N/A | Not applicable. |
| U3 | **Component anatomy & states** (per UX component specs) | UX §Component Strategy | N/A | N/A | Not applicable. |
| U4 | **Responsive strategy** (mobile-first, grid breakpoints) | UX §Responsive Design | N/A | N/A | Not applicable. |
| U5 | **Feedback patterns** (toasts, empty states, loading/skeleton) | UX §Feedback Patterns | N/A | N/A | Not applicable. |
| | | **UX Subtotal** | **4/5** | **1/5** | *(Adjusted max due to N/A rows)* |

#### Summary Scorecard

| Spec Source | Max | Exp-B | Exp-C | Δ |
|:------------|:---:|:-----:|:-----:|:-:|
| Architecture | 35 | 31 | 21 | +10 |
| Epics | 15 | 15 | 14 | +1 |
| PRD | 10 | 10 | 10 | 0 |
| UX Design | 5 | 4 | 1 | +3 |
| **Total** | **65** | **60** | **46** | **+14** |

#### Key Differences

| Dimension | Exp-B | Exp-C |
|:----------|:------|:------|
| **Folder structure** | Explicitly created architectural layers (`features/`, `core/`, `components/`). | Missing architectural layer subfolders. |
| **API endpoint pattern** | Not implemented yet | Not implemented yet |
| **Form library / validation** | N/A | N/A |
| **State management approach** | Installed `zustand` and `tanstack-query` per architecture. | Missed state management setup entirely. |
| **Test strategy** | Centralized tests (`tests/scaffolding/`). | Co-located frontend tests (`App.test.tsx`). |
| **Notable omissions** | Did not explicitly implement Radix UI. | Missed Tailwind, Zustand, TanStack Query, and necessary folder structures. |

#### Verdict

> **Winner:** Exp-B
> **Rationale:** Exp-B demonstrated a much higher adherence to architectural constraints during the scaffolding phase by proactively setting up the required feature folders, Tailwind CSS configuration, and state management libraries (Zustand, TanStack), whereas Exp-C only delivered the bare minimum setup.
