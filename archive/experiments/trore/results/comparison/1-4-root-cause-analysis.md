### Root Cause Analysis: Story 1-4 — Property Detail View & Metadata

**Date:** 2026-03-31
**Alignment Comparison Source:** `1-4-property-detail-view-metadata.md`

#### Failure Summary

| # | Dimension | Score (B/C) | Failure Description |
|:-:|:----------|:----------:|:--------------------|
| 1 | A2: Feature-folder architecture | 5 / 2 | Exp-C grouped files by generic type (`src/pages`) rather than grouping by feature slice (`src/features/{name}/`) |
| 2 | A3: Service-layer pattern | 4 / 3 | Exp-C merged business logic and the endpoint directly into `routers/` rather than specifying service layers |
| 3 | A5: State management | 5 / 3 | Exp-C failed to dictate TanStack Query usage, letting the developer implement a custom internal hook |
| 4 | A7: Type safety pipeline | 5 / 1 | Exp-C completely omitted the requirement to sync the backend python types with `packages/types` |
| 5 | A9: Testing co-location | 5 / 2 | Exp-C split the testing architecture into generic parallel folders against the spec's co-location rule |
| 6 | U2: Color system | 3 / 3 | Both systems failed to mandate the usage of "Trust Blue", defaulting to implicit "Use Tailwind" rules |

#### Detailed Investigation

##### Failure 1: A2: Feature-folder architecture

**Alignment Score:** Exp-B: 5 / Exp-C: 2
**Expected (from spec):** The architectural guideline dictates creating elements within `apps/web/src/features/{name}/`.
**Actual (in artifact):** Exp-C explicitly directed placing pages in `apps/web/src/pages/`.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successful Alignment)
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `epics.md`, `architecture.md`, `ux-design-specification.md`, `project-context.md`
  - Relevant spec section present in read files: Yes
- **Log evidence** (from grep investigation):
  - Log position: ~280
  - Tool call: `write_file` → `1-4-property-detail-view-metadata.md`
  - What agent said: Wrote the files adhering to the feature slicing.
- **Contributing factors:** Reading the entirety of `architecture.md` passively provided `§Structure Patterns` directly into the context window.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"1-4-property-detail-view-metadata details requirements acceptance criteria"`
  - Nodes retrieved: `epics.md#story-1-4-property-detail-view`, `epics.md#functional-requirements`, etc.
  - Expected node (the one that contains the answer): `architecture.md#structure-patterns`
  - Was expected node in retrieved set: No
  - If No, nearest retrieved node: `architecture.md#requirements-coverage-validation`
- **Log evidence** (from grep investigation, if needed):
  - Log position: ~108
  - Tool call: `query_knowledge` → natural_query: `"1-4-property-detail-view-metadata details requirements acceptance criteria"`
  - Response nodes: Failed to mention structure topology.
- **Contributing factors:** The LLM's query logic skipped asking for architectural patterns during this specific iteration.

**Retrieval Method Comparison:** 
Exp-B succeeded because `read_file("architecture.md")` dumps the entire contents into context, making omissions impossible for the planning stage. Exp-C failed because the vector search (`query_knowledge`) is strictly dependent on the query strings provided. Since the agent only explicitly asked for "requirements" and "acceptance criteria" and omitted "architecture", the retrieved nodes correctly avoided architecture components.

---

##### Failure 2: A3: Service-layer pattern

**Alignment Score:** Exp-B: 4 / Exp-C: 3
**Expected (from spec):** Router → Service → DB segregation (`architecture.md§Source Organization`).
**Actual (in artifact):** Exp-C placed all backend logic instructions into `routers/listings.py`.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successful Alignment)
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `architecture.md`
  - Relevant spec section present in read files: Yes

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"1-4-property-detail-view-metadata details requirements acceptance criteria"`
  - Expected node: `architecture.md#source-organization`
  - Was expected node in retrieved set: No
- **Retrieval Method Comparison:** Caused by the identical query omission explained in Failure 1.

---

##### Failure 3: A5: State management

**Alignment Score:** Exp-B: 5 / Exp-C: 3
**Expected (from spec):** Use TanStack Query for server state.
**Actual (in artifact):** Exp-C tells the dev to build a custom `useListing` fetcher hook.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successful Alignment)
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `architecture.md`
  - Relevant spec section present in read files: Yes

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"1-4-property-detail-view-metadata details requirements... "`
  - Expected node: `architecture.md#state-management`
  - Was expected node in retrieved set: No
- **Retrieval Method Comparison:** Caused by the identical query omission explained in Failure 1.

---

##### Failure 4: A7: Type safety pipeline

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** Pydantic mapping into `packages/types` index file across the stack.
**Actual (in artifact):** Exp-C fully omits shared type management in the subtasks.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successful Alignment)
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `architecture.md`
  - Relevant spec section present in read files: Yes

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"1-4-property-detail-view-metadata details requirements... "`
  - Expected node: `architecture.md#type-safety`
  - Was expected node in retrieved set: No
- **Retrieval Method Comparison:** Caused by the identical query omission explained in Failure 1. Without architectural prompt cues, vector db did not expose cross-ecosystem package integrations.

---

##### Failure 5: A9: Testing co-location

**Alignment Score:** Exp-B: 5 / Exp-C: 2
**Expected (from spec):** Co-locate tests tightly with the components `*.test.tsx`.
**Actual (in artifact):** Exp-C grouped tests strictly apart or without explicit localization.

**Exp-B Root Cause (File-based):**
- **Category:** N/A (Successful Alignment)
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `architecture.md`
  - Relevant spec section present in read files: Yes

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too narrow
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"1-4-property-detail-view-metadata details requirements... "`
  - Expected node: `architecture.md#structure-patterns`
  - Was expected node in retrieved set: No
- **Retrieval Method Comparison:** Caused by the identical query omission explained in Failure 1.

---

##### Failure 6: U2: Color system

**Alignment Score:** Exp-B: 3 / Exp-C: 3
**Expected (from spec):** Adherence to "Trust Blue" `#0066CC` and neutral grays.
**Actual (in artifact):** Both simply told the builder to "Use Tailwind CSS".

**Exp-B Root Cause (File-based):**
- **Category:** Spec read but ignored / Template limitation
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: `ux-design-specification.md`
  - Relevant spec section present in read files: Yes
- **Log evidence** (from grep investigation):
  - Log position: N/A
  - Tool call: `write_file` 
  - What agent said: Handled style using Tailwind without color specifics.
- **Contributing factors:** The story template focuses heavily on functional ACs, missing a spot to explicitly transcribe micro-styling decisions, so the model relies on the underlying Tailwind config assumption rather than dictating color variables.

**Exp-C Root Cause (Graph-based):**
- **Category:** Spec read but ignored / Template limitation
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"Property Detail View UX Design wireframe"`
  - Nodes retrieved: `ux-design-specification.md` (Entire file embedding due to chunking size context)
  - Expected node (the one that contains the answer): `ux-design-specification.md#color-system`
  - Was expected node in retrieved set: Yes (embedded inside the main file retrieval)
- **Log evidence** (from grep investigation, if needed):
  - Log position: ~137
  - Tool call: `query_knowledge`
  - Response nodes: Included the full UX specification text block (which includes Color System).
- **Contributing factors:** Similar to Exp-B, the agent didn't consider detailing the color necessary for writing a story AC, likely due to the "Design System" already handling it.

**Retrieval Method Comparison:** The retrieval method played no part in this divergence. Both agents retrieved the color knowledge but elected to omit the microscopic design variables in order to keep the story artifact functionally targeted.

---

#### Cross-Failure Patterns

1. **Systemic issues:** Both systems generally struggle with explicitly dictating micro-requirements (like exact CSS variables) if a superseding styling mechanism (Tailwind framework) is mentioned. They view the lower-level variable as implicitly resolved.
2. **Divergence root:** In Exp-C, the model **failed to include the word "architecture" in the search** (which it notably did include when generating stories 1-1, 1-2, 1-3, and 1-5). By only searching for "details, requirements, acceptance criteria", the vector search strictly returned PRD/Epic data.
3. **Workflow gaps:** The workflow fails to enforce a "guaranteed spec coverage query" in Graph-based modes. It allows the agent to construct an arbitrary search query. When that arbitrary query slips, all dependent structures fail synchronously.
4. **Retrieval quality:** The vector search performed correctly given the prompt. The failure was primarily in the non-deterministic query generation.
5. **Information coverage:** Due to one slightly malformed search query, Exp-C missed almost the entirety of the application boundaries (Tests, Folders, Hooks, Pipelines) which represented a 17-point deficit on the alignment scorecard against Exp-B for this iteration.

#### Recommendations

1. Modifying the `create-story` workflow in Graph mode to forcibly require checking architectural topology *before* resolving the context, avoiding hallucinated omission of queries. (e.g. Provide a checklist: "Did you retrieve UI, PRD, AND Architecture?").
2. The Story template should be updated with a "Design System specifics" line if explicit color adherence is deemed critically required.
3. Configure the `query_knowledge` capability to cross-reference architectural dependencies automatically whenever an Epic/Story node is retrieved.
4. Encourage LLM agents generating queries in Graph mode to concatenate `architecture constraints and tech stack` to their prompt-generated search phrases automatically to surface node linkages safely.
