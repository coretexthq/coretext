# Root Cause Analysis: Story 1-5 — Admin Listing Management

**Date:** 2026-03-31
**Alignment Comparison Source:** `1-5-admin-listing-management.md`

#### Failure Summary

| # | Dimension | Score (B/C) | Failure Description |
|:-:|:----------|:----------:|:--------------------|
| 1 | A2 & A9: Architecture Structure | 5 / 2 (A2), 5 / 3 (A9) | Exp-C completely missed the `features/{name}/` folder architecture requirement and the test co-location requirement, opting instead for standard React `pages/` and `components/` folders. |
| 2 | E1: Epics Verbatim Match | 4 / 3 | `epics.md` does not actually contain "Story 1.5" explicitly. Exp-C hallucinated extended requirements (deletion flow) beyond FR20's strict bounds. |

---

#### Detailed Investigation

##### Failure #1: A2 / A9 Architecture Structure Constraints

**Alignment Score:** Exp-B: 5 / Exp-C: 2 (A2), 3 (A9)
**Expected (from spec):** The application must use feature-slice architecture (e.g. `src/features/{name}/`) and tests must be co-located next to the source files within these feature folders (`Architecture §Structure Patterns`).
**Actual (in artifact):** Exp-B correctly followed the feature folder layout (`features/dashboard/pages/EditListingPage.tsx`). Exp-C ignored feature slicing entirely and placed files in `src/pages/admin/` and `src/components/`, with tests adjacent to the pages.

**Exp-B Root Cause (File-based):**
- **Category:** Not a failure (Success)
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `epics.md`, `architecture.md`, `ux-design-specification.md`
  - Relevant spec section present in read files: Yes (`architecture.md`)
- **Contributing factors:** Because Exp-B reads the entire `architecture.md` file, the `§Structure Patterns` section is intrinsically injected into its context window, ensuring compliance.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query missed target / Node content truncation
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"Architecture patterns for Admin Dashboard and Management Interface"`
  - Nodes retrieved: `architecture.md#state-management-patterns`, `prd.md#quality-control-administration`, `1-2-admin-manual-listing-creation.md#dev-notes`, `1-1-project-scaffolding-database-foundation.md#architecture-compliance`, `ux-design-specification.md#platform-strategy`
  - Expected node (the one that contains the answer): `architecture.md#structure-patterns`
  - Was expected node in retrieved set: No
  - If No, nearest retrieved node: `architecture.md#state-management-patterns`
- **Contributing factors:** 
  Exp-C's query (`"Architecture patterns for Admin Dashboard..."`) was too semantically focused on the *feature* ("Admin Dashboard") rather than the global *structure* of the application. The vector search returned state management patterns, but failed to return the global folder structure requirements (`§Structure Patterns`). Without this node, the agent reverted to standard React default patterns (`src/pages`, `src/components`).

**Retrieval Method Comparison:** 
Exp-B's file-based retrieval guarantees that global constraints (like folder routing and testing paradigms) are always loaded via the monolithic `architecture.md` read. Exp-C's graph-based retrieval relies heavily on the semantic proximity of the query to the constraint. Because Exp-C queried for feature-specific architecture ("Admin Dashboard"), the general `Structure Patterns` node was pushed out of the top-k results, causing complete loss of structural guidelines.

---

##### Failure #2: E1 Epics Verbatim Story Match

**Alignment Score:** Exp-B: 4 / Exp-C: 3
**Expected (from spec):** Story descriptions and criteria should match the Epic documentation verbatim.
**Actual (in artifact):** Neither implementation could copy the story verbatim because "Story 1.5" is not explicitly delineated in `epics.md` (FR20 and FR27 are grouped elsewhere or implicit). Exp-B focused exclusively on "Edit", while Exp-C added "Delete" functionalities.

**Exp-B Root Cause (File-based):**
- **Category:** Template limitation / Spec hallucination
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `epics.md`, `architecture.md`, `ux-design-specification.md`
  - Relevant spec section present in read files: No (Story 1.5 does not exist in `epics.md`)
- **Contributing factors:** Exp-B detected the lack of a "1.5" and intelligently hallucinated a matching story based on FR20 ("Admins can manually override and edit any attribute").

**Exp-C Root Cause (Graph-based):**
- **Category:** Wrong nodes retrieved / Scope expansion
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"Full content of Story 1.5 Admin Listing Management"`
  - Nodes retrieved: `1-2-admin-manual-listing-creation.md#story`, `epics.md#story-3-2-listing-description-normalizer`, `prd.md#quality-control-administration`, etc.
  - Expected node (the one that contains the answer): `epics.md#story-1-5` (Does not exist)
  - Was expected node in retrieved set: No
- **Contributing factors:** 
  When Exp-C queried for "Story 1.5", the vector database returned prior completed stories (`1-2-admin-manual-listing-creation.md`) and unrelated epics (`epics.md#story-3-2-listing-description-normalizer`). Lacking clear boundaries, Exp-C leaned on `prd.md#quality-control-administration` and prior context to build the story, resulting in scope creep (adding a deletion mechanism).

**Retrieval Method Comparison:** 
When the target information does not exist in the source material, both methods struggle. However, Exp-C's graph-retrieval exacerbates the problem by serving "nearest neighbor" nodes (like prior story `1-2` and `epics 3-2`) which pollute the context window with semi-relevant data, leading to higher rates of scope creep and requirement hallucinations.

---

#### Cross-Failure Patterns

1. **Systemic issues:** Both experiments struggled with Story 1.5 simply because the source material (`epics.md`) lacks an explicit mapping for a "Story 1.5".
2. **Divergence root:** Global structural constraints (like folder layouts) are inherently difficult for graph-based models to fetch unless specifically queries. Exp-C queries mostly centered around the specific feature being built ("Admin Dashboard"), missing global setup constraints found higher up in architecture docs.
3. **Workflow gaps:** The create-story workflow does not force agents to check global routing or folder structures on every story, leading Exp-C to forget context that was present in Story 1-1.
4. **Retrieval quality:** Exp-C's queries were highly specific to the *current story text*. Because `query_knowledge` operates via vector similarity, "Admin Dashboard Architecture" retrieved state management but entirely missed "Structure Patterns." Furthermore, querying for missing data (Story 1.5) returns highly distracting nearest-neighbor nodes (like Story 1-2).
5. **Information coverage:** Exp-B consistently loads all global constraints via full file reads. Exp-C retrieved 15 nodes total across 3 queries, providing a narrow, feature-specific slice of context that completely omitted global file structural rules.

#### Recommendations

1. **Improvement to CoreText query strategy:** Agents should be trained or prompted to ALWAYS append a query for global structural constraints (e.g., `"Global folder structure and testing patterns"`) when starting a new story, rather than only querying for feature-specific architecture.
2. **Improvement to the knowledge graph structure:** Global architectural nodes (like `Structure Patterns`) should ideally have forced graph edges to all feature nodes, or the `get_dependencies` tool needs to surface global rules automatically.
3. **Improvement to spec documents:** `epics.md` should be rigorously audited so there are no "gaps" in story numbering, preventing nearest-neighbor vector space pollution when an agent searches for a missing story.
