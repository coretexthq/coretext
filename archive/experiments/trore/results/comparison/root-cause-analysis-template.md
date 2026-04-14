# Root Cause Analysis Template — Story Alignment Failures

> **Purpose:** After a story alignment comparison is completed, use this template to investigate the agent conversation logs and determine **why** and **where** alignment failures occurred during artifact generation.

---

## Experiment Architecture Context

> [!NOTE]
> **Read these files first** to fully understand the experimental setup before investigating failures.

This evaluation compares two **architecturally different** retrieval strategies for AI-driven spec-to-story generation:

| | Exp-B (Control) | Exp-C (Test) |
|:--|:----------------|:-------------|
| **Retrieval method** | **File-based** — reads full spec `.md` files directly | **Graph-based** — uses CoreText `query_knowledge` MCP tool |
| **Spec access** | Full files: `read_file("architecture.md")` loads the entire document | Partial nodes: `query_knowledge(natural_query="...")` returns only top-k relevant header sections |
| **Access restriction** | None — agent can read any file | `.geminiignore` **blocks** `_bmad-output/planning-artifacts/` |
| **Context shape** | Complete but large (entire files in context window) | Focused but potentially incomplete (graph-traversed subgraph) |
| **Tool calls** | `read_file`, `write_file`, `replace`, `list_directory` | `query_knowledge`, `get_dependencies`, `search_topology`, `write_file`, `replace` |

**Key implication for root cause analysis:**
- **Exp-B failures** are typically caused by the agent **reading but ignoring/misinterpreting** spec content (the information was available).
- **Exp-C failures** may be caused by the agent's **query not retrieving** the relevant spec section at all, or retrieving **wrong/tangential nodes** from the knowledge graph.

### Required Reading (for the investigating agent)

1. **Evaluation Methodology** — explains the full experimental design, isolation strategy, and metrics:
   - Read: `experiments/trore/coretext-evaluation-methodology.md`
2. **CoreText User Guide** — explains how `query_knowledge` works (vector search → filtering → graph traversal):
   - Read: `docs/coretext-user-guide.md` (specifically §3.3 "Available MCP Tools")
3. **Retrieved Knowledge Comparison** — manually extracted data showing exactly which specs were read (Exp-B) and which nodes were retrieved (Exp-C) for each story:
   - Read: `experiments/trore/results/comparison/retrieved-knowledge-comparison.md`

---

## Scope & Prerequisites

> [!IMPORTANT]
> **Single-story scope:** This analysis is for **one story at a time**. The user's prompt will specify which story to analyze (e.g., "analyze story 1-2 root causes").

**Before starting, you MUST read (in this order):**
1. `experiments/trore/coretext-evaluation-methodology.md` — understand the experiment design
2. `docs/coretext-user-guide.md` §3.3 — understand how `query_knowledge` works
3. `experiments/trore/results/comparison/retrieved-knowledge-comparison.md` — the pre-extracted retrieval data for the target story
4. The **completed alignment comparison** for this story (from `results/comparison/{story-id}-{story-slug}.md`)
5. The **original specs** (architecture, epics, PRD, UX design) — only the sections relevant to identified failures
6. The **conversation logs** (JSON files in `results/exp-{x}/logs/`) — grep-only, targeted investigation

---

## Input Files

### Experiment Context (read first)
- `experiments/trore/coretext-evaluation-methodology.md` — experiment design, isolation rules, metrics
- `docs/coretext-user-guide.md` — CoreText tool reference (`query_knowledge`, `get_dependencies`, `search_topology`)
- `experiments/trore/results/comparison/retrieved-knowledge-comparison.md` — pre-extracted retrieval data per story

### Alignment Comparison (read second)
- `experiments/trore/results/comparison/{story-id}-{story-slug}.md`

### Original Planning Specs (reference as needed)
- `experiments/trore/_bmad-output/planning-artifacts/architecture.md`
- `experiments/trore/_bmad-output/planning-artifacts/epics.md`
- `experiments/trore/_bmad-output/planning-artifacts/prd.md`
- `experiments/trore/_bmad-output/planning-artifacts/ux-design-specification.md`

### Conversation Logs

**Naming convention:** `exp_{EXP}_{story-id}_{phase}.json`

| Phase | Suffix | Description |
|:------|:-------|:------------|
| Create-story | `_cs` | The workflow that generates the story artifact from specs |
| Dev-story | `_ds` | The workflow that implements the story (writes code) |

**Log file mapping for create-story phase (primary investigation target):**

| Story | Exp-B Log | Exp-C Log |
|:------|:----------|:----------|
| 1-1 | `exp-b/logs/exp_B_1-1_cs.json` | `exp-c/logs/exp_C-2_1-1_cs.json` |
| 1-2 | `exp-b/logs/exp_B_1-2_cs.json` | `exp-c/logs/exp_C-2_1-2_cs.json` |
| 1-3 | `exp-b/logs/exp_B_1-3_cs.json` | `exp-c/logs/exp_C-2_1-3_cs.json` |
| 1-4 | `exp-b/logs/exp_B_1-4_cs.json` | `exp-c/logs/exp_C-2_1-4_cs.json` |
| 1-5 | `exp-b/logs/exp_B_1-5_cs.json` | `exp-c/logs/exp_C-2_1-5_cs.json` |

---

## Agent Instructions for Log Investigation

> [!CAUTION]
> **Context window protection:** The JSON log files are **extremely large** (90KB–375KB each). **DO NOT** read the full file. You MUST follow the targeted investigation approach below or your context window will overflow.

### Step 0: Read Experiment Context

Before any investigation:
1. Read `experiments/trore/coretext-evaluation-methodology.md` to understand the experiment design
2. Read `docs/coretext-user-guide.md` §3.3 to understand how `query_knowledge` pipeline works (vector → filter → graph traversal)
3. Read `experiments/trore/results/comparison/retrieved-knowledge-comparison.md` and extract the section for the target story — this is your **primary evidence** for Exp-C retrieval gaps

### Step 1: Read the Completed Alignment Comparison

Read the alignment comparison file for this story to identify:
- Which dimensions scored **3 or below** (Partial/Weak/Missing)
- The specific **notes** describing what went wrong
- Which **spec requirement** was not met

Create a shortlist of **failure points** to investigate. Only investigate these.

### Step 1.5: Cross-Reference Retrieved Knowledge

For each failure point, check `retrieved-knowledge-comparison.md`:
- **Exp-B:** Was the relevant spec file listed under "Spec files read"? If not, the agent never read it.
- **Exp-C:** Was the relevant spec section listed under "Retrieved Nodes"? Check:
  - Was the **right node** retrieved at all? (e.g., `architecture.md#naming-patterns`)
  - Was a **wrong/tangential node** retrieved instead? (e.g., retrieving `story-3-2` when investigating story `1-5`)
  - Was the query **well-formed** enough to surface the needed section?

This step often reveals the root cause without needing to grep logs at all.

### Step 2: Targeted Log Search Strategy

For each failure point identified in Step 1, use **grep/search** (NOT full-file reads) to investigate the logs. The JSON structure is:

```json
[
  {
    "role": "user" | "model",
    "parts": [
      { "text": "..." },
      { "functionCall": { "name": "read_file|write_file|replace|list_directory", "args": { ... } } },
      { "functionResponse": { "name": "...", "response": { "output": "..." } } }
    ]
  }
]
```

**Search targets by failure type:**

**For Exp-B (file-based) logs:**

| Failure Type | What to Search For | grep Pattern |
|:-------------|:-------------------|:-------------|
| Wrong folder structure | `write_file` or `replace` calls with wrong paths | `"file_path"` |
| Missing spec content | Whether spec file was `read_file`'d at all | `"name": "read_file"` + spec filename |
| Wrong API pattern | `write_file` content for endpoint definitions | `"/api/"` or `"POST"` or `"GET"` |
| Missing component | `write_file` calls — check if component was created | `"name": "write_file"` |
| Naming deviation | Content of `write_file` calls | `camelCase` or specific wrong pattern |
| Library omission | Whether architecture was read before building tasks | `"architecture"` in `read_file` args |

**For Exp-C (graph-based) logs — additional search targets:**

| Failure Type | What to Search For | grep Pattern |
|:-------------|:-------------------|:-------------|
| Query missed target | `query_knowledge` call with the query text | `"query_knowledge"` |
| Wrong nodes returned | `functionResponse` after `query_knowledge` showing retrieved nodes | `"functionResponse"` near `query_knowledge` |
| No retrieval attempted | Whether `query_knowledge` was called at all for a topic | `"natural_query"` |
| Hallucinated from prior story | Whether agent reused context from a previous story's artifact | `"1-2-admin"` (or other story slugs) in retrieved nodes |
| Graph depth insufficient | Whether `depth` parameter was adequate | `"depth"` near `query_knowledge` |

### Step 3: Investigation Protocol

For **each failure point**, do the following in order:

1. **grep the log** for the relevant tool call name or file path
2. If a match is found, read only a **small window** (20-50 lines) around that match to understand context
3. Determine root cause from one of these categories:
   **Common to both experiments:**
   - **Spec not read:** The agent never loaded the relevant spec section
   - **Spec read but ignored:** The agent read the spec but made a different choice
   - **Spec misinterpreted:** The agent read the spec but drew wrong conclusions
   - **Spec conflict:** Two specs gave contradictory guidance
   - **Agent hallucination:** The agent invented something not in any spec
   - **Template limitation:** The story template didn't have a section for this requirement
   - **Context overflow:** The agent likely lost earlier context (long conversation)

   **Exp-C only (graph retrieval failures):**
   - **Query too vague:** The `natural_query` was too broad, causing the vector search to miss the target section
   - **Query too narrow:** The query was overly specific, missing related but differently-worded spec sections
   - **Wrong nodes retrieved:** The top-k results were dominated by semantically similar but irrelevant sections (e.g., story 3-2 retrieved when investigating story 1-5)
   - **Insufficient graph depth:** The `depth` parameter didn't traverse far enough to reach linked architectural constraints
   - **Missing cross-reference:** The knowledge graph lacked an edge between the retrieved node and the needed spec section
   - **Node content truncation:** The retrieved node returned a header but not enough content to capture the full requirement

> [!WARNING]
> **Strictly forbidden actions:**
> - Do NOT use `view_file` to read the entire JSON log
> - Do NOT load more than 50 lines of the JSON at a time
> - Do NOT attempt to read both exp-b AND exp-c logs simultaneously — investigate one experiment fully, then the other

---

## Output Template

Save the completed analysis to: `experiments/trore/results/comparison/{story-id}-root-cause-analysis.md`

### Root Cause Analysis: Story {STORY_ID} — {STORY_TITLE}

**Date:** {date}
**Alignment Comparison Source:** `{story-id}-{story-slug}.md`

#### Failure Summary

| # | Dimension | Score (B/C) | Failure Description |
|:-:|:----------|:----------:|:--------------------|
| 1 | | | |
| 2 | | | |
| ... | | | |

#### Detailed Investigation

##### Failure #{N}: {Dimension}

**Alignment Score:** Exp-B: {score} / Exp-C: {score}
**Expected (from spec):** _{what the spec says}_
**Actual (in artifact):** _{what the artifact produced}_

**Exp-B Root Cause (File-based):**
- **Category:** {Spec not read | Spec read but ignored | Spec misinterpreted | Spec conflict | Agent hallucination | Template limitation | Context overflow}
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Spec files read: _{list from retrieved-knowledge-comparison}_
  - Relevant spec section present in read files: {Yes/No}
- **Log evidence** (from grep investigation):
  - Log position: _{approximate line range or turn number}_
  - Tool call: `{read_file|write_file|replace}` → `{file_path}`
  - What agent said: _{brief quote of model text before the call}_
- **Contributing factors:** _{any additional context}_

**Exp-C Root Cause (Graph-based):**
- **Category:** {Common categories OR Exp-C specific: Query too vague | Query too narrow | Wrong nodes retrieved | Insufficient graph depth | Missing cross-reference | Node content truncation}
- **Retrieval evidence** (from `retrieved-knowledge-comparison.md`):
  - Query used: _{exact query string}_
  - Nodes retrieved: _{list of nodes returned}_
  - Expected node (the one that contains the answer): _{spec#section}_
  - Was expected node in retrieved set: {Yes/No}
  - If No, nearest retrieved node: _{what was returned instead}_
- **Log evidence** (from grep investigation, if needed):
  - Log position: _{approximate line range or turn number}_
  - Tool call: `query_knowledge` → natural_query: `"{query}"`
  - Response nodes: _{list}_
- **Contributing factors:** _{any additional context}_

**Retrieval Method Comparison:** _{How did the retrieval method difference directly cause the divergence? e.g., "Exp-B read the full architecture.md which contains §Naming Patterns on line 208. Exp-C's query 'requirements for story 1-2' did not surface the Naming Patterns section because it is semantically distant from 'admin listing creation'."}_

---

_(Repeat for each failure)_

---

#### Cross-Failure Patterns

> _After investigating all failures for this story, identify recurring patterns:_

1. **Systemic issues:** _{e.g., "Neither experiment read the UX spec", "Both experiments skip error handling patterns"}_
2. **Divergence root:** _{What fundamental difference between the experiments caused different outcomes?}_
3. **Workflow gaps:** _{Does the create-story workflow itself fail to enforce certain spec reads?}_
4. **Retrieval quality:** _{For Exp-C: Were the queries well-formed? Did top-k=5 surface enough context? Were irrelevant nodes displacing relevant ones?}_
5. **Information coverage:** _{Compare: Exp-B read N files totaling ~X tokens. Exp-C retrieved M nodes totaling ~Y tokens. What was the coverage gap?}_

#### Recommendations

1. _{Specific improvement to the create-story workflow}_
2. _{Specific improvement to the story template}_
3. _{Specific improvement to the spec documents}_
4. _{Specific improvement to CoreText query strategy (e.g., better query formulation, higher top_k, deeper graph traversal)}_
5. _{Specific improvement to the knowledge graph structure (e.g., missing cross-references, node granularity)}_

---

## Output Files

| Story | Root Cause Analysis File |
|:------|:------------------------|
| 1-1 | [`1-1-root-cause-analysis.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-1-root-cause-analysis.md) |
| 1-2 | [`1-2-root-cause-analysis.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-2-root-cause-analysis.md) |
| 1-3 | [`1-3-root-cause-analysis.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-3-root-cause-analysis.md) |
| 1-4 | [`1-4-root-cause-analysis.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-4-root-cause-analysis.md) |
| 1-5 | [`1-5-root-cause-analysis.md`](file:///Users/mac/Git/coretext/experiments/trore/results/comparison/1-5-root-cause-analysis.md) |
