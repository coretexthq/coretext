# Root Cause Analysis: Story 1-3 — Seeker Discovery Grid & Keyword Search

**Date:** 2026-03-31
**Alignment Comparison Source:** `1-3-seeker-discovery-grid-keyword-search.md`

#### Failure Summary

| # | Dimension | Score (B/C) | Failure Description |
|:-:|:----------|:----------:|:--------------------|
| 1 | PRD (Functional Requirements) | 1 / 5 | Exp-B missed PRD FR3 (Keyword Search). Exp-C successfully implemented it. |
| 2 | Architecture (Feature Folders) | 5 / 1 | Exp-C deviated from the feature-folder architecture and used flat `components/` and `pages/`. |
| 3 | Architecture (State Management) | 5 / 1 | Exp-C missed TanStack Query and Zustand rules, using only raw `useEffect` and `useState`. |

#### Detailed Investigation

##### Failure #1: PRD (Functional Requirements) - Keyword Search

**Alignment Score:** Exp-B: 1 / Exp-C: 5
**Expected (from spec):** FR3: Seekers can perform standard keyword searches across property descriptions. (Described in `prd.md` and mapped to Epic 1).
**Actual (in artifact):** Exp-B implemented a simple grid without any search capability. Exp-C implemented a functional keyword search bar and backend support.

**Exp-B Root Cause (File-based):**
- **Category:** Spec read but ignored / Template limitation
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `epics.md`, `prd.md`, `architecture.md`, `ux-design-specification.md`
  - Relevant spec section present in read files: Yes (`prd.md` has FR3).
- **Log evidence** (from grep investigation):
  - Log position: Turn 4, Line 153.
  - Tool call: `read_file` → `_bmad-output/planning-artifacts/epics.md`
  - What agent said: Prompt instructs to "Extract our story... details".
- **Contributing factors:** `epics.md` under subset `### Story 1.3: Seeker Discovery Grid` only listed ACs for scenarios "Default View" and "Card Content". It failed to map FR3 directly into the Story 1.3 ACs. Exp-B rigidly followed the local Story 1.3 ACs in `epics.md` and ignored the global FR3 mapping in `prd.md` and the Epic 1 coverage map.

**Exp-C Root Cause (Graph-based):**
- **Category:** Not a failure for Exp-C. Exp-C succeeded here.
- **Retrieval evidence**:
  - Query used: `Requirements and acceptance criteria for seeker discovery grid`
  - Nodes retrieved: `epics.md#story-1-3-seeker-discovery-grid`, `prd.md#property-discovery-search`, `ux-design-specification.md#defining-experience`, `ux-design-specification.md#core-user-experience`, `epics.md#epic-1-the-mvp-core-listing-viewing`
  - Expected node: `prd.md#property-discovery-search`
  - Was expected node in retrieved set: Yes.
- **Contributing factors:** Because Exp-C retrieves discrete nodes across files, it saw `prd.md#property-discovery-search` (which contains FR3) right next to the `epics.md` story constraints, treating them with equal localized weight, prompting it to add keyword search.

**Retrieval Method Comparison:** Exp-B's file-based approach resulted in it relying too heavily on the hierarchical structure of `epics.md` (which omitted FR3 in the 1.3 ACs). Exp-C's graph-based retrieval effectively "flattened" the requirements, pulling in FR3 from the PRD node and merging it seamlessly into the story implementation.

---

##### Failure #2: Architecture (Feature Folders)

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** Code should be organized using a feature-based structure (e.g., `apps/web/src/features/search/`).
**Actual (in artifact):** Exp-C used `apps/api/app/routers/listings.py`, `apps/web/src/pages/HomePage.tsx`, `apps/web/src/components/ListingCard.tsx`.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow / Expected node not retrieved
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"Architecture patterns, tech stack, and database schema for seeker discovery grid"`
  - Nodes retrieved: `epics.md#story-1-3-seeker-discovery-grid`, `prd.md#property-discovery-search`, `epics.md#functional-requirements`, `ux-design-specification.md#target-users`, `prd.md#project-classification`
  - Expected node: `architecture.md#structure-patterns`
  - Was expected node in retrieved set: No.
  - Nearest retrieved node: `prd.md#project-classification` (which only mentions Tech Stack: Hybrid Multi-Cloud SPA).
- **Log evidence**:
  - Log position: Turn 4, Lines 156-208.
  - Tool call: `query_knowledge` → natural_query: `"Architecture patterns, tech stack, and database schema for seeker discovery grid"`
- **Contributing factors:** The query appended `"for seeker discovery grid"`, which semantically biased the vector search toward functional and UX requirements related to the grid, pulling PRD and Epics nodes rather than global architecture rules.

**Exp-B Root Cause (File-based):**
- **Category:** Not a failure.
- **Retrieval evidence**:
  - Spec files read: `architecture.md`
  - Relevant spec section present in read files: Yes.

**Retrieval Method Comparison:** Exp-B reads the entirety of `architecture.md`, so global structural rules are always in context. Exp-C's vector search failed because global architecture nodes like `#structure-patterns` are not semantically close enough to "seeker discovery grid", so they drop out of the top-k results.

---

##### Failure #3: Architecture (State Management)

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** Use TanStack Query for server state and Zustand for client state.
**Actual (in artifact):** Exp-C explicitly prescribed using `useEffect` for fetching and keeping state simple.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow / Expected node not retrieved
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"Architecture patterns, tech stack, and database schema for seeker discovery grid"`
  - Expected node: `architecture.md#state-management-patterns`
  - Was expected node in retrieved set: No.
- **Contributing factors:** Similar to Failure #2, the query was too specific to the "discovery grid", missing the global state management directives in the architecture spec. Furthermore, without the spec, the LLM hallucinated basic React patterns (`useEffect`) to fill the void.

**Retrieval Method Comparison:** Exp-B had the full `architecture.md` file in context and correctly prescribed TanStack Query. Exp-C retrieved 0 architecture nodes, leading to a complete deviation from the project's state management rules.

---

#### Cross-Failure Patterns

1. **Systemic issues:** Graph-based retrieval struggles to consistently retrieve global architectural constraints when queries are overly tailored to a specific story's functional name.
2. **Divergence root:** Exp-B is excellent at adhering to strict structural and hierarchical rules but can miss implicit mapped functional requirements if the epic file is poorly written. Exp-C is excellent at cross-referencing functional requirements (finding FR3 in the PRD), but performs poorly at enforcing global, non-semantic rules (architecture).
3. **Retrieval quality:** Exp-C queries like "Architecture patterns ... for seeker discovery grid" are fundamentally flawed in a vector search environment. Global architecture rules do not contain the text "seeker discovery grid", so they are never retrieved.
4. **Information coverage:** Exp-B read all 4 documents fully. Exp-C retrieved highly relevant functional nodes but completely missed `architecture.md`.

#### Recommendations

1. **Improve CoreText Query Strategy:** Agents using `query_knowledge` should decouple functional queries from architectural queries. A query should be `"Global architecture patterns, structure, and state management"` *without* appending the story name, to ensure global rules are retrieved.
2. **Improve Knowledge Graph Structure:** Global architecture nodes should have generic baseline relevance or sticky weights, or cross-reference edges should be explicitly created between `epics.md#story-1-3` and `architecture.md#structure-patterns`.
3. **Improve Spec Documents:** The PM agent shouldn't rely on implicit mappings. `epics.md` should explicitly restate global cross-cutting requirements (like search capability) inside the specific story's Acceptance Criteria.
