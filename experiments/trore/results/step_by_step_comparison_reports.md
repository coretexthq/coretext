# Step-by-Step Experiment Comparison: Exp B (File-based) vs. Exp C-2 (Graph-based)

This report provides a granular, standardized comparison of each workflow step (Create-Story and Dev-Story) across five implementation stories (1.1 - 1.5).

---

## Story 1.1: Project Scaffolding & Database Foundation

### Step 1.1.CS: Create-Story (Planning)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Direct `read_file` of `epics.md` and `architecture.md`. Ingested full documents (high context noise). | Blocked from direct file access. Used `query_knowledge` to retrieve specific semantic fragments (e.g., `#requirements-to-structure-mapping`). |
| **Requirement Capture** | Good. Correctly identified the `listings` table and Turborepo structure. | High Fidelity. Correctly identified Supabase/PostgreSQL schema, JSONB, and SCD Type 2 history requirements. |
| **Task Planning** | Derived from full text reading, producing a standard task list. | Derived from specific graph nodes, leading to deliberate discovery and tech stack grounding (e.g., locking React 19.2.4). |
| **Architectural Alignment** | Used generic versions of FastAPI and React 19. | Performed proactive research (`google_web_search`) to identify specific stable versions. |
| **Related Files** | **Log:** `exp_B_1-1_cs.json`<br>**Artifact:** `exp-b/.../1-1-project-scaffolding-database-foundation.md`<br>**Spec:** `planning-artifacts/epics.md` | **Log:** `exp_C-2_1-1_cs.json`<br>**Artifact:** `exp-c/.../1-1-project-scaffolding-database-foundation.md`<br>**Spec:** `planning-artifacts/epics.md` |

### Step 1.1.DS: Dev-Story (Implementation)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Implementation Flow** | **Verification-Driven / TDD:** Created custom Python testing scripts in `tests/scaffolding/` to verify folder structures. | **Direct-Driven:** Task-oriented manual file construction without custom scaffolding test suites. |
| **Tech & Patterns** | **Code-First DB:** Created SQLAlchemy models then used Alembic `--autogenerate`. Targeted React 19 via Vite. | **Migration-First DB:** Manually wrote DDL logic in Alembic for PG extensions (`uuid-ossp`). Pinned `^19.0.0` in manual `package.json`. |
| **Spec Fidelity** | Followed the project structure, heavily utilizing standard file tools (`glob`, `read_file`). | Addressed complex `Hatchling` and `uv` backend configurations effectively using CoreText MCP tools for context. |
| **Resilience** | Resolved database connection issues during scaffolding by temporarily using a local SQLite URL. | Relied on standard testing frameworks (Vitest/Pytest) for simple smoke tests. |
| **Related Files** | **Log:** `exp_B_1-1_ds.json`<br>**Code:** `tests/scaffolding/test_root_structure.py`, `apps/api/migrations/env.py`, `apps/api/app/models/listings.py` | **Log:** `exp_C-2_1-1_ds.json`<br>**Code:** `apps/api/alembic/versions/*_create_listings_table.py`, `apps/api/app/main.py`, `apps/web/package.json` |
| **Full Implementation File List** | `tests/scaffolding/test_root_structure.py`, `tests/scaffolding/test_web_scaffold.py`, `tests/scaffolding/test_api_scaffold.py`, `tests/scaffolding/test_importer_scaffold.py`, `tests/scaffolding/test_types_scaffold.py`, `tests/scaffolding/test_db_migration.py`, `tests/scaffolding/test_dev_experience.py`, `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `pyproject.toml`, `.gitignore`, `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/tailwind.config.js`, `apps/web/postcss.config.js`, `apps/web/src/index.css`, `apps/api/pyproject.toml`, `apps/api/package.json`, `apps/api/vercel.json`, `apps/api/alembic.ini`, `apps/api/app/main.py`, `apps/api/app/db/base.py`, `apps/api/app/models/listings.py`, `apps/api/migrations/env.py`, `packages/importer/Dockerfile`, `packages/importer/pyproject.toml`, `packages/importer/main.py`, `packages/types/package.json`, `packages/types/tsconfig.json`, `packages/types/index.d.ts`, `_bmad-output/implementation-artifacts/sprint-status.yaml` | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, `apps/web/tsconfig.node.json`, `apps/web/index.html`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/App.css`, `apps/web/src/index.css`, `apps/web/src/setupTests.ts`, `apps/web/src/App.test.tsx`, `apps/api/pyproject.toml`, `apps/api/README.md`, `apps/api/app/main.py`, `apps/api/tests/test_main.py`, `apps/api/alembic.ini`, `apps/api/alembic/env.py`, `apps/api/alembic/script.py.mako`, `apps/api/alembic/versions/feb328d92ecc_create_listings_table.py`, `packages/importer/pyproject.toml`, `packages/importer/README.md`, `packages/importer/package.json`, `packages/types/package.json`, `packages/types/tsconfig.json`, `packages/types/src/index.ts` |

---

## Story 1.2: Admin Manual Listing Creation

### Step 1.2.CS: Create-Story (Planning)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Direct `read_file` on `epics.md` and `ux-design-specification.md`. | Semantic search via `query_knowledge` targeting specific scenarios. |
| **Requirement Capture** | Captured Scenario 2 (Negative Price) and Scenario 3 (503 Error) accurately. | Captured Scenarios 2 & 3 with higher granularity. |
| **Task Planning** | Generic tasks: "Ensure Pydantic validation", "Implement server error handling". | Explicit tasks: "validation for price (>0)", "return 503 on DB connect failure". |
| **Architectural Alignment** | Placed feature in `apps/web/src/features/dashboard`. | Placed feature in standard `apps/web/src/pages/`. |
| **Related Files** | **Log:** `exp_B_1-2_cs.json`<br>**Artifact:** `exp-b/.../1-2-admin-manual-listing-creation.md` | **Log:** `exp_C-2_1-2_cs.json`<br>**Artifact:** `exp-c/.../1-2-admin-manual-listing-creation.md` |

### Step 1.2.DS: Dev-Story (Implementation)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Implementation Flow** | Highly modular, using Feature-Sliced Design (`features/admin/components`). | Leaner, traditional page-based routing (`pages/NewListingPage.tsx`). |
| **Tech & Patterns** | Robust tech choices: `react-hook-form`, `zod`, and `@tanstack/react-query`. | Simpler tech choices: Vanilla React `useState` and native `fetch`. |
| **Spec Fidelity** | Negative price handled via Zod. Generic API error handling used for 503. | High-fidelity: Explicit `response.status === 503` logic. Retrieved specific hex codes (`#0066CC`) from CoreText. |
| **Resilience** | Encountered and resolved `ModuleNotFoundError` during tests by setting `PYTHONPATH`. | Clean execution without major roadblocks. |
| **Related Files** | **Log:** `exp_B_1-2_ds.json`<br>**Code:** `apps/web/src/features/admin/components/ListingForm.tsx`, `apps/web/src/features/admin/api/useCreateListing.ts` | **Log:** `exp_C-2_1-2_ds.json`<br>**Code:** `apps/web/src/pages/NewListingPage.tsx`, `apps/api/app/routers/listings.py` |
| **Full Implementation File List** | `apps/api/app/schemas/listing.py`, `apps/api/app/api/v1/listings.py`, `apps/api/app/api/v1/__init__.py`, `apps/api/app/main.py`, `apps/api/tests/api/v1/test_listings.py`, `apps/api/app/db/session.py`, `packages/types/index.d.ts`, `apps/web/src/features/admin/components/ListingForm.tsx`, `apps/web/src/features/admin/components/ListingForm.test.tsx`, `apps/web/src/features/admin/api/useCreateListing.ts`, `apps/web/src/features/admin/pages/NewListingPage.tsx`, `apps/web/src/lib/api.ts`, `apps/web/src/lib/auth.tsx`, `apps/web/src/App.tsx`, `apps/web/src/setupTests.ts`, `apps/web/vite.config.ts`, `apps/web/package.json` | `apps/api/app/models.py`, `apps/api/app/schemas.py`, `apps/api/app/routers/listings.py`, `apps/api/app/main.py`, `apps/api/tests/test_listings.py`, `apps/web/src/pages/NewListingPage.tsx`, `apps/web/src/pages/NewListingPage.test.tsx`, `apps/web/src/App.tsx`, `apps/web/src/App.test.tsx`, `_bmad-output/implementation-artifacts/1-2-admin-manual-listing-creation.md` |

---

## Story 1.3: Seeker Discovery Grid & Keyword Search

### Step 1.3.CS: Create-Story (Planning)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Direct `read_file` on `epics.md`. Followed the linear text structure. | Semantic query pulled specific requirements based on the Story 1.3 entity. |
| **Requirement Capture** | **Failed:** Missed the "Keyword Search" (FR3) requirement mapped to Epic 1. | **Success:** CoreText queried the PRD node and synthesized the detached FR3 requirement. |
| **Task Planning** | Incomplete: Lacked search-related scenarios. | Comprehensive: Added new AC Scenarios specifically for Keyword Search. |
| **Architectural Alignment** | Focused strictly on the explicit list in the story block. | Prevented 'Requirement Leakage' by looking at the broader topological mapping. |
| **Related Files** | **Log:** `exp_B_1-3_cs.json`<br>**Artifact:** `exp-b/.../1-3-seeker-discovery-grid-keyword-search.md` | **Log:** `exp_C-2_1-3_cs.json`<br>**Artifact:** `exp-c/.../1-3-seeker-discovery-grid-keyword-search.md` |

### Step 1.3.DS: Dev-Story (Implementation)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Implementation Flow** | Implemented `ListingGrid` and pagination, tested thoroughly. | Implemented `HomePage` with grid and search bar. |
| **Tech & Patterns** | Reused existing schemas, separated API hooks. | Added search input state and debouncing. |
| **Spec Fidelity** | Backend logic only included status filtering (`AVAILABLE`) and pagination. | Backend logic correctly implemented robust `ilike` search across `title` and `description` with `OR` conditions. |
| **Resilience** | Addressed address parsing brittleness by displaying the full address. | Smooth implementation of the discovered ACs. |
| **Related Files** | **Log:** `exp_B_1-3_ds.json`<br>**Code:** `apps/api/app/api/v1/listings.py`, `apps/web/src/features/listing/components/ListingGrid.tsx` | **Log:** `exp_C-2_1-3_ds.json`<br>**Code:** `apps/api/app/routers/listings.py`, `apps/web/src/pages/HomePage.tsx` |
| **Full Implementation File List** | `apps/api/app/api/v1/listings.py`, `apps/api/tests/api/v1/test_listings.py`, `packages/types/index.d.ts`, `apps/web/src/lib/format.ts`, `apps/web/src/features/listing/components/ListingCard.tsx`, `apps/web/src/features/listing/components/ListingGrid.tsx`, `apps/web/src/features/listing/api/useListings.ts`, `apps/web/src/features/listing/pages/ListingListPage.tsx`, `apps/web/src/lib/api.ts`, `apps/web/src/App.tsx`, `apps/web/src/features/listing/components/ListingCard.test.tsx`, `apps/web/src/features/listing/components/ListingGrid.test.tsx`, `apps/web/package.json` | `apps/api/app/routers/listings.py`, `apps/api/tests/test_listings.py`, `apps/web/src/components/ListingCard.tsx`, `apps/web/src/components/ListingCard.test.tsx`, `apps/web/src/pages/HomePage.tsx`, `apps/web/src/pages/HomePage.css`, `apps/web/src/pages/HomePage.test.tsx`, `apps/web/src/App.tsx` |

---

## Story 1.4: Property Detail View

### Step 1.4.CS: Create-Story (Planning)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Standard `read_file` and `grep` on planning artifacts. | Used `query_knowledge` for planning artifacts (due to a block) and direct file reads for source code. |
| **Requirement Capture** | Successfully captured JSONB formatting requirements and 404 handling. | Captured backend 404 raising and frontend 404 catching with 'Return to Home'. |
| **Task Planning** | High detail (5.9 KB artifact): Explicit tasks for Pydantic `Dict` sync and JS loops. | Planned to create a `FeaturesList` component specifically for JSONB `attributes`. |
| **Architectural Alignment** | Explicit component hierarchy defined (`useListing`, `ListingDetail`). | Grounded in specific nodes from `epics.md`, `ux-design-specification.md`, and `architecture.md`. |
| **Related Files** | **Log:** `exp_B_1-4_cs.json`<br>**Artifact:** `exp-b/.../1-4-property-detail-view-metadata.md` | **Log:** `exp_C-2_1-4_cs.json`<br>**Artifact:** `exp-c/.../1-4-property-detail-view-metadata.md` |

### Step 1.4.DS: Dev-Story (Implementation)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Implementation Flow** | Feature-sliced structure with a dedicated `NotFound` component. | Component-based with a modular `FeaturesList` component. |
| **Tech & Patterns** | **TanStack Query** used for robust data fetching and caching. JS Regex for title-casing. | Manual `fetch` inside `useEffect`. Used CSS `capitalize` for JSONB formatting. |
| **Spec Fidelity** | Deep synchronization of shared types (`BaseEntity` changed to snake_case). | Correctly handled 404 state within the main detail page. |
| **Resilience** | Environment was stable. | **Autonomous Recovery:** Downgraded Tailwind v4 to v3 to fix init errors. Fixed cascading React Router test failures using `MemoryRouter`. |
| **Related Files** | **Log:** `exp_B_1-4_ds.json`<br>**Code:** `apps/web/src/features/listing/api/useListing.ts`, `apps/web/src/components/NotFound.tsx` | **Log:** `exp_C-2_1-4_ds.json`<br>**Code:** `apps/web/src/components/FeaturesList.tsx`, `apps/web/tailwind.config.js` |
| **Full Implementation File List** | `apps/api/app/api/v1/listings.py`, `apps/api/tests/api/v1/test_listings.py`, `packages/types/index.d.ts`, `apps/web/src/features/listing/api/useListing.ts`, `apps/web/src/features/listing/components/ListingDetail.tsx`, `apps/web/src/features/listing/components/ListingDetail.test.tsx`, `apps/web/src/features/listing/pages/ListingDetailPage.tsx`, `apps/web/src/components/NotFound.tsx`, `apps/web/src/App.tsx` | `_bmad-output/implementation-artifacts/1-4-property-detail-view-metadata.md`, `apps/api/app/schemas.py`, `apps/api/app/routers/listings.py`, `apps/api/tests/test_listings.py`, `apps/web/package.json`, `apps/web/src/App.tsx`, `apps/web/src/components/FeaturesList.tsx`, `apps/web/src/components/FeaturesList.test.tsx`, `apps/web/src/hooks/useListing.ts`, `apps/web/src/pages/ListingDetailPage.tsx`, `apps/web/src/pages/ListingDetailPage.test.tsx`, `apps/web/src/components/ListingCard.tsx`, `apps/web/src/components/ListingCard.test.tsx`, `apps/web/src/pages/HomePage.test.tsx`, `apps/web/tailwind.config.js`, `apps/web/src/index.css`, `apps/web/postcss.config.js` |

---

## Story 1.5: Admin Listing Management

### Step 1.5.CS: Create-Story (Planning)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Structural/Keyword-based (`grep`, `ls`). Found Story 1.5 via physical file proximity. | Intent-based: Used `natural_query` ("Full content of Story 1.5"). |
| **Requirement Capture** | Focused primarily on the Edit Form functionality. | Comprehensive: Captured Dashboard, Edit, and Delete flows. |
| **Task Planning** | Planned the refactoring of `ListingForm`. | Provided specific guidance on handling loading states. |
| **Architectural Alignment** | Generic alignment check. | **Source-Aware:** Checked `package.json` and identified missing `TanStack Query` dependency. |
| **Related Files** | **Log:** `exp_B_1-5_cs.json`<br>**Artifact:** `exp-b/.../1-5-admin-listing-management.md` | **Log:** `exp_C-2_1-5_cs.json`<br>**Artifact:** `exp-c/.../1-5-admin-listing-management.md` |

### Step 1.5.DS: Dev-Story (Implementation)

| Criteria | **Experiment B (File-based)** | **Experiment C-2 (Graph-based)** |
| :--- | :--- | :--- |
| **Implementation Flow** | **Methodical TDD:** Wrote `ListingForm.test.tsx` and resolved validation errors systematically. | **Feature-First:** Direct implementation of the required UI features based on schema. |
| **Tech & Patterns** | Refactored `ListingForm` via prop-based initial values to support Create/Edit. | Refactored `ListingForm` and integrated `@tanstack/react-query` based on CS plan. |
| **Spec Fidelity** | Missing the Delete functionality and full Tabular view. Focused highly on status lifecycle edge cases. | Produced a full Admin Dashboard (Tabular View + Edit + Delete). |
| **Resilience** | Systematically resolved `QueryClient` missing provider errors in tests. | Achieved functional breadth efficiently. |
| **Related Files** | **Log:** `exp_B_1-5_ds.json`<br>**Code:** `apps/web/src/features/admin/components/ListingForm.tsx`, `apps/web/src/features/dashboard/pages/EditListingPage.tsx` | **Log:** `exp_C-2_1-5_ds.json`<br>**Code:** `apps/web/src/pages/admin/AdminDashboard.tsx`, `apps/api/app/routers/listings.py` |
| **Full Implementation File List** | `apps/web/src/features/dashboard/pages/EditListingPage.tsx`, `apps/web/src/features/admin/api/useListingDetails.ts`, `apps/web/src/features/admin/api/useUpdateListing.ts`, `apps/web/src/features/admin/components/ListingForm.tsx`, `apps/web/src/features/admin/components/ListingForm.test.tsx`, `apps/web/src/features/admin/api/useCreateListing.ts`, `apps/web/src/features/admin/pages/NewListingPage.tsx`, `apps/web/src/features/listing/components/ListingDetail.tsx`, `apps/web/src/features/listing/pages/ListingDetailPage.tsx`, `apps/web/src/App.tsx`, `apps/api/app/schemas/listing.py`, `apps/api/app/api/v1/listings.py`, `apps/api/tests/api/v1/test_listings.py`, `apps/web/src/lib/api.ts` | `apps/api/app/routers/listings.py`, `apps/api/app/schemas.py`, `apps/api/tests/test_listings.py`, `apps/web/package.json`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/pages/NewListingPage.tsx`, `apps/web/src/components/ListingForm.tsx`, `apps/web/src/features/admin/hooks/useAdminListings.ts`, `apps/web/src/pages/admin/AdminDashboard.tsx`, `apps/web/src/pages/admin/EditListingPage.tsx`, `apps/web/src/pages/admin/AdminDashboard.test.tsx`, `apps/web/src/pages/admin/EditListingPage.test.tsx` |

---

## Final Assessment: Qualitative Analysis of Retrieval Paradigms

This section provides a qualitative analysis of the behavioral and architectural differences observed between the file-based retrieval baseline (Experiment B) and the graph-augmented approach (Experiment C-2). The findings indicate a clear trade-off between structural rigor (depth) and semantic synthesis (breadth).

### 1. Context Synthesis and the Mitigation of Information Loss
A primary advantage observed in the graph-based paradigm is its mitigation of "skimming errors," a limitation common in LLMs processing massive linear contexts. In Story 1.3, the baseline agent processed the entire `epics.md` file but failed to synthesize the "Keyword Search" requirement, which was mapped to the Epic but physically detached from the primary story block. Conversely, the graph-augmented agent, utilizing targeted subgraph retrieval, successfully bridged this gap by pulling the logically connected requirement directly from the PRD node. This suggests that graph-based retrieval enforces a more comprehensive synthesis of distributed requirements.

### 2. Architectural Rigor vs. Pragmatic Delivery
While the graph-based approach improved functional coverage, the file-based baseline consistently yielded more architecturally mature and defensively engineered code. Having immediate access to the full text of architectural guidelines allowed Experiment B to adopt complex, forward-looking patterns, such as Feature-Sliced Design (Story 1.2) and comprehensive Test-Driven Development (TDD) pipelines (Stories 1.1 and 1.5). Experiment B frequently utilized robust industry-standard libraries (e.g., `react-hook-form`, `zod`). 

In contrast, Experiment C-2, operating on semantic fragments, often defaulted to pragmatic but structurally simpler implementations (e.g., utilizing vanilla React `useState` and native `fetch` in Story 1.2). While C-2 met the exact Acceptance Criteria with high fidelity to the text (e.g., specific error strings), it occasionally lacked the engineering depth and maintainability focus exhibited by the baseline.

### 3. Environmental Resilience vs. Discovery Overhead
The restriction from direct file access forced the CoreText agent into a continuous mode of "semantic discovery." This yielded a positive side effect: heightened environmental awareness. For instance, in Story 1.5, Experiment C-2 actively queried the codebase state and correctly identified a missing dependency, whereas Experiment B assumed the environment matched the static architectural specification. Furthermore, this discovery-oriented posture made C-2 more adaptable to environmental roadblocks, as seen in its autonomous resolution of a broken Tailwind CSS configuration in Story 1.4.

However, this resilience introduces operational overhead. The reliance on `query_knowledge` requires the agent to formulate effective semantic queries. When initial queries are suboptimal or the underlying graph is incomplete, it can lead to navigational friction, necessitating multiple iterative searches to establish context. In contrast, the baseline approach benefits from the straightforward, deterministic reading of known file paths.

### 4. Conclusion
The comparative analysis suggests that neither retrieval paradigm is universally superior; rather, they optimize for different dimensions of the software engineering lifecycle. File-based retrieval (Experiment B) excels in establishing deep structural integrity, test coverage, and adherence to comprehensive engineering standards, particularly when context is well-localized. Graph-based retrieval (Experiment C-2) demonstrates distinct advantages in complex, highly-coupled domains where requirements are fragmented across multiple documents. It acts as a forcing function for functional completeness and dynamic environmental reconciliation, though occasionally at the expense of architectural sophistication.