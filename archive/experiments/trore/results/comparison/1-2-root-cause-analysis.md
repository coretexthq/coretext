# Root Cause Analysis: Story 1-2 — Admin Manual Listing Creation

**Date:** 2026-03-31
**Alignment Comparison Source:** `1-2-admin-manual-listing-creation.md`

#### Failure Summary

| # | Dimension | Score (B/C) | Failure Description |
|:-:|:----------|:----------:|:--------------------|
| 1 | A2: Feature-folder architecture | 5 / 1 | Exp-C used a generic `pages/` directory instead of `features/admin/` |
| 2 | A5: State management | 5 / 1 | Exp-C omitted TanStack Query entirely |
| 3 | A7: Type safety pipeline | 5 / 2 | Exp-C skipped syncing type definitions to `packages/types/` |
| 4 | U1: Design system | 5 / 1 | Exp-C failed to include Tailwind CSS / Radix UI in the tech stack |

#### Detailed Investigation

##### Failure #1: A2: Feature-folder architecture

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** Architecture §Structure Patterns dictates a feature-folder architecture (`src/features/{name}/`).
**Actual (in artifact):** Exp-C created generic components in `/apps/web/src/pages/NewListingPage.tsx`.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successfully implemented)
- **Retrieval evidence**:
  - Spec files read: `epics.md`, `architecture.md`, `ux-design-specification.md`
  - Relevant spec section present in read files: Yes
- **Log evidence**: 
  - Exp-B directly accessed the full `architecture.md` file, providing complete context of the structure pattern.
- **Contributing factors:** Full file access guaranteed that the agent saw the explicit architectural mandate.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too vague / Spec not read
- **Retrieval evidence**:
  - Query used: `"UX design for New Listing Form and Architecture for Listing Creation"`
  - Nodes retrieved: `epics.md#story-1-2...`, `ux-design-specification.md`, `1-1-project-scaffolding...`
  - Expected node: `architecture.md#structure-patterns`
  - Was expected node in retrieved set: No
  - nearest retrieved node: `1-1-project-scaffolding-database-foundation.md#database-schema-details`
- **Log evidence**:
  - Log position: Turn 8, query_knowledge.
  - Tool call: `query_knowledge` → natural_query: `"UX design for New Listing Form and Architecture for Listing Creation"`
- **Contributing factors:** The query incorrectly assumed `architecture.md` was indexed by domain concepts like "Listing Creation." Since structural rules are global (in `#structure-patterns`), the vector search found no tight semantic overlap with the story name and thus dropped `architecture.md` entirely from the top 5 results.

**Retrieval Method Comparison:** Exp-B read the full `architecture.md` which ensures global patterns are seen. Exp-C's query structure heavily biases toward feature-specific concepts, accidentally filtering out global/foundational documentation that lacks the specific keywords of the current story topic.

---

##### Failure #2: A5: State management

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** Architecture §State Management dictates TanStack Query for server state and mutations.
**Actual (in artifact):** Exp-C omitted state management instructions entirely, relying implicitly on generic React features.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successfully implemented)
- **Retrieval evidence**: `architecture.md` was read in full.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too vague / Spec not read
- **Retrieval evidence**:
  - Query used: `"Architecture patterns for Admin Dashboard and Management Interface"` (from step 1.5) or `"Architecture for Listing Creation"`
  - Nodes retrieved: Missing `architecture.md` entirely.
  - Expected node: `architecture.md#state-management-patterns`
  - Was expected node in retrieved set: No
- **Contributing factors:** Identical to Failure #1. Standard queries scoped to the story name failed to traverse into `architecture.md`'s specific rules on state management.

**Retrieval Method Comparison:** The graph-based retrieval method repeatedly fails to surface cross-cutting standard operating procedures (error handling, state management, folder trees) when the agent's query focuses narrowly on the business feature ("Listing Creation").

---

##### Failure #3: A7: Type safety pipeline

**Alignment Score:** Exp-B: 5 / Exp-C: 2
**Expected (from spec):** Type generation script or syncing types between backend (Python) and frontend (TS) in `packages/types/`.
**Actual (in artifact):** Exp-C wrote: "Keep separate for now unless shared generator exists."

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successfully implemented)

**Exp-C Root Cause (Graph-based):**
- **Category:** Spec not read (Missing cross-reference)
- **Retrieval evidence**:
  - Query used: `"details for story 1-2-admin... and epic-1 requirements"`
  - Nodes retrieved: various nodes in `epics.md`
  - Expected node: `architecture.md#type-safety` 
  - Was expected node in retrieved set: No
- **Contributing factors:** Lacking the global architectural context, the agent fell back on its training data for generic full-stack monorepos, explicitly assuming types should remain separate until a generator is built, directly contradicting the project's strategy.

**Retrieval Method Comparison:** Without explicit topological links connecting "New Listing Creation" to the overarching "Type Safety Pipeline" constraint, Graph-based retrieval abandons the constraint, leaving the agent to hallucinate industry standard assumptions.

---

##### Failure #4: U1: Design system

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** The application relies on Tailwind CSS and Radix UI primitives.
**Actual (in artifact):** Exp-C completely ignored Tailwind CSS / Radix UI, stating "React 19 + Vite. Use functional components."

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successfully implemented)

**Exp-C Root Cause (Graph-based):**
- **Category:** Spec read but ignored (Context overflow)
- **Retrieval evidence**:
  - Query used: `"UX design for New Listing Form..."`
  - Nodes retrieved: Included the gigantic unchunked file node `ux-design-specification.md`.
  - Expected node: `ux-design-specification.md`
  - Was expected node in retrieved set: Yes (containing "Tailwind CSS paired with Radix UI").
- **Log evidence**:
  - Log position: Turn 8, response.
  - The node `node:⟨_bmad-output/planning-artifacts/ux-design-specification.md⟩` contained the entire markdown file in one string.
- **Contributing factors:** The agent retrieved an enormous text chunk spanning the entirety of the UX design specification. Because the structural chunking was lost or the target was simply too voluminous, the agent failed to extract the salient technical details (Tailwind) while building the story artifact, acting as though it had not read the design specs at all.

**Retrieval Method Comparison:** Exp-B read the entire file but systematically processed it. Exp-C retrieved the file as an unformatted JSON string dump within a `query_knowledge` response, likely compromising its ability to attend to the specific instructions about Tailwind CSS amidst the dense JSON payload.

---

#### Cross-Failure Patterns

1. **Systemic issues:** Exp-C consistently misses cross-cutting architectural mandates (folders, types, naming, tech stacks).
2. **Divergence root:** Exp-B loaded the entirety of `architecture.md` into context. Exp-C relied on `query_knowledge`, which failed to return any nodes from `architecture.md` when queried with feature-specific search vectors (e.g. "Listing creation architecture").
3. **Workflow gaps:** The create-story workflow allows the model to specify queries. Because the agent formulates queries based on the *business feature*, it mathematically filters out the *technical foundation*. 
4. **Retrieval quality:** The `natural_query` mechanism in `query_knowledge` is fundamentally misaligned with retrieving global constraints under the CoreText mode. Additionally, when a node is retrieved without proper sub-heading chunking (e.g. `ux-design-specification.md`), the payload is too massive for the model to parse effectively out of a JSON block.
5. **Information coverage:** Exp-B ingested 100% of the architecture and UX specs. Exp-C ingested roughly 10% of the architecture specs (relying heavily on previously injected bits or skipping it fully) and retrieved the UX spec in a dense, unstructured format that led to data dropping.

#### Recommendations

1. **Workflow Update:** Force the `create-story` workflow to always retrieve core architectural pillars globally rather than relying on natural-language semantic searches for each specific story.
2. **CoreText Tool Update:** Modify the `query_knowledge` tool to automatically attach "Global Rule" nodes (like project structure and standard tech stacks) to all responses, overriding vector distance constraints.
3. **Chunking Mechanism:** Improve the indexing process for files such as `ux-design-specification.md` to ensure they are properly chunked by Header/Section rather than returned as one massive `file` type node.
4. **Agent Training:** Instruct the agent to execute two separate queries: one targeting specific business requirements ("Story 1.2 details") and an entirely separate, explicit query for global constraints ("List all global architecture patterns, folder structures, and tech stacks").
