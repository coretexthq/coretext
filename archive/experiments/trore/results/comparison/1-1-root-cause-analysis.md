# Root Cause Analysis: Story 1.1 — Project Scaffolding & Database Foundation

**Date:** 2026-03-31
**Alignment Comparison Source:** `1-1-project-scaffolding-database-foundation.md`

#### Failure Summary

| # | Dimension | Score (B/C) | Failure Description |
|:-:|:----------|:----------:|:--------------------|
| 1 | A2 (Feature Folders) | 5 / 1 | Exp-C completely missed the feature-based folder architecture requirement. |
| 2 | A3 (API Service Layer) | 4 / 2 | Exp-C missed the specific internal structure for the FastAPI backend (`app/core`, etc.). |
| 3 | A5 (State Management) | 5 / 1 | Exp-C missed the requirement to use Zustand and TanStack Query. |
| 4 | A9 (Testing Co-location) | 3 / 4 | Both experiments struggled. Exp-B intentionally skipped testing location instructions, leading the dev agent to create a `tests/scaffolding/` directory instead of co-locating tests. |
| 5 | U1 (Tailwind CSS) | 4 / 1 | Exp-C missed the Tailwind CSS framework requirement for styling. |

#### Detailed Investigation

##### Failure 1, 2, 3: A2, A3, A5 (Structural and Contextual Architectural Guidance)

**Alignment Score:** Exp-B: 5 / Exp-C: 1
**Expected (from spec):** Specific architectural constraints including feature-folders, FastAPI service layer structure, and Zustand/TanStack Query.
**Actual (in artifact):** Exp-C fell back to standard SPA routing and generic component structures without specifying state management libraries.

**Exp-B Root Cause (File-based):**
- *N/A (Exp-B scored highly by capturing these details from the full file read).*

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too vague / Wrong nodes retrieved
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: `"Requirements and stories for Epic 1, specifically story 1.1 project scaffolding and database foundation. Include architecture patterns, tech stack, and database schema relevant to this story."`
  - Nodes retrieved: `architecture.md#requirements-to-structure-mapping`, `epics.md#story-1-1-project-scaffolding-database-foundation`, `epics.md#fr-coverage-map`, `architecture.md#implementation-handoff`, `prd.md#project-classification`
  - Expected node: `architecture.md#structure-patterns` and `architecture.md#state-management-patterns`
  - Was expected node in retrieved set: No
  - Nearest retrieved node: `architecture.md#requirements-to-structure-mapping` (which mentions features at a high level but omits standard folder names and state management libraries).
- **Contributing factors:** The agent grouped several distinct search intents (epics, tech stack, db schema, architecture patterns) into a single, overly broad query. With a limited `top_k`, the semantic search prioritized business requirements and handoff summaries over detailed technical pattern nodes.

##### Failure 4: A9 (Testing Co-location)

**Alignment Score:** Exp-B: 3 / Exp-C: 4
**Expected (from spec):** "Tests: Co-located *.test.tsx (Web) or test_*.py (Backend) next to source files."
**Actual (in artifact):** Exp-B explicitly instructed the dev agent that "tests [are] not required for scaffolding" and omitted the test folder structure entirely. The subsequent Dev agent placed tests in an isolated `tests/scaffolding/` directory.

**Exp-B Root Cause (File-based):**
- **Category:** Spec read but ignored / misinterpreted
- **Retrieval evidence**:
  - Spec files read: `architecture.md`
  - Relevant spec section present in read files: Yes (`architecture.md#structure-patterns`)
- **Log evidence** (from `exp_B_1-1_cs.json`):
  - Log position: Line 211
  - Content: `**Web:** Vitest configuration (setup only, tests not required for scaffolding).`
- **Contributing factors:** The agent understood the project was in the scaffolding phase and made an independent, localized judgment that writing tests wasn't required yet. While logical, by completely omitting the testing rules from the story's "Developer Context", the dev agent was left without guardrails and defaulted to generic standard test placement.

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too vague
- **Retrieval evidence:** Did not retrieve `architecture.md#structure-patterns`.
- **Contributing factors:** Similar to A2/A3, because Exp-C never retrieved the structural patterns node, it had zero awareness of the co-location rule.

##### Failure 5: U1 (Tailwind CSS)

**Alignment Score:** Exp-B: 4 / Exp-C: 1
**Expected (from spec):** Tailwind CSS must be configured as the styling solution.
**Actual (in artifact):** Exp-C did not specify Tailwind CSS in the frontend scaffolding requirements.

**Exp-B Root Cause (File-based):**
- *N/A (Exp-B successfully extracted this requirement).*

**Exp-C Root Cause (Graph-based):**
- **Category:** Query too vague
- **Retrieval evidence:**
  - Query used: The same mega-query mentioned above.
  - Expected node: `architecture.md#starter-options-considered` or a node from `ux-design-specification.md`.
  - Was expected node in retrieved set: No.
- **Contributing factors:** The omnibus query did not contain styling or CSS-related keywords, failing to hit the relevant architecture tokens regarding choice of Tailwind.

---

#### Cross-Failure Patterns

1. **Systemic issues:** The `create-story` workflow instructs agents retrieving via CoreText to execute multiple distinct queries (e.g., `Query: "Architecture patterns for {{story_title}}"`, `Query: "Tech stack and coding standards"`). Exp-C completely ignored these implicit iterative instructions, concatenating them into a single "kitchen sink" query instead.
2. **Divergence root:** File-based retrieval (Exp-B) acts as a safety net against poor search formulation, as the entire document is loaded into context. Graph-based retrieval (Exp-C) is highly fragile when the AI agent lacks the search-strategy intelligence to break complex needs into granular semantic queries.
3. **Workflow gaps:** The workflow gives examples of queries to run but doesn't explicitly `force` the agent to run them iteratively before proceeding. LLMs typically try to minimize tool-use steps and thus combine queries to save turns.
4. **Retrieval quality:** The `top_k=5` limit is severely restrictive for a Kitchen-Sink query. Information density across business needs and technical patterns cannot fit in 5 nodes when the query intent covers both.

#### Recommendations

1. **Workflow Improvement:** Update the `create-story` XML workflow to explicitly forbid query concatenation. Enforce a rule: "You MUST make separate `query_knowledge` calls for (1) Epics/Requirements, (2) Architectural Standards/Tech Stack, and (3) Database/API models."
2. **Story Template Improvement:** Add a dedicated, mandatory section to the `template.md` explicitly requiring the inclusion of "Testing & Folder Structure Co-location Rules" so agents do not overlook transferring them even during scaffolding phases.
3. **CoreText Strategy:** Instruct agents relying on CoreText to adjust `top_k` dynamically up to 10 for broad exploration queries, particularly when starting a new Epic.
4. **Knowledge Graph Improvement:** Create semantic similarity edges or explicit "Related Pattern" links between `architecture.md#requirements-to-structure-mapping` and its more detailed sibling `architecture.md#structure-patterns`, so when the high-level mapping is retrieved, the agent can use `get_dependencies` to pull the precise details.
