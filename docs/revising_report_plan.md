# Plan: Iterative Report Rewrite in 12 Hours

**TL;DR:** The report suffers from three core problems: (1) Chapter II is a bloated tech-stack tour mixing theory with implementation details, (2) the methodology reads as a technology list rather than a research process, and (3) rich data from existing artifacts (dogfooding metrics, retrospectives, FR tables, NFR targets) is absent. The fix is a 2-phase approach: first restructure (Sessions 0–1), then incrementally rewrite per-section (Sessions 2–7). Each session targets one chapter/section with specific artifact sources to pull from. The plan is designed so each session's agent receives this document + the relevant artifact files as context.

---

## Proposed New Structure (vs. Current)

| Current                                                                       | Proposed                                     | Change                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ch I. Introduction (4 short subsections)                                      | Ch 1. Introduction (5 subsections, expanded) | Expand problem statement, add report outline                                                                                                                                                                          |
| Ch II. Theoretical Background & Technology Stack (10 subsections, ~300 lines) | Ch 2. Theoretical Background & Related Work  | **Split**: Move tech justifications (SurrealDB, Gemini, Markdown, AST, MCP, Git, Typer) out of theory into Ch 3. Keep only conceptual frameworks (Agent anatomy, BMAD theory, KG theory). Absorb current Ch III here. |
| Ch III. Related Work (4 subsections)                                          | _(merged into Ch 2 as §2.4–2.5)_             | Merge into Ch 2                                                                                                                                                                                                       |
| Ch IV. Analysis, Design, and Methodology (~80 lines)                          | Ch 3. System Design & Methodology            | **Absorb** tech stack justifications from old Ch II. Add FR/NFR tables, architecture diagrams, step-by-step methodology with clear objectives per step.                                                               |
| _(no separate implementation chapter)_                                        | Ch 4. Implementation                         | Extract implementation details from old Ch II (§2.7–2.10) and old Ch IV (§4.3) into a dedicated chapter.                                                                                                              |
| Ch V. Results and Evaluation                                                  | Ch 5. Results & Evaluation                   | Expand Experiment 1 with dogfooding data + retro insights. Add Threats to Validity.                                                                                                                                   |
| Ch VI. Conclusion                                                             | Ch 6. Conclusion & Future Work               | Minor polish.                                                                                                                                                                                                         |
| _(missing)_                                                                   | Abstract, References                         | Add.                                                                                                                                                                                                                  |

## Content Migration Map

Sections that **move** (not rewrite — just relocate):

| Current Location                          | New Location                               | Rationale                                                |
| ----------------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| §2.4 SurrealDB (why not Neo4j, SurrealQL) | Ch 3 §3.3 Technology Selection             | Technology *choice* belongs in methodology, not theory   |
| §2.5 Gemini CLI & Model Ecosystem         | Ch 3 §3.3 Technology Selection             | Same — this is a project decision, not background theory |
| §2.6 Markdown choice                      | Ch 3 §3.3 Technology Selection             | Same                                                     |
| §2.7 AST Transformation Logic             | Ch 4 §4.1 Parsing Engine                   | This is *implementation*, not theory                     |
| §2.8 MCP interface                        | Ch 4 §4.4 MCP Integration                  | Implementation detail                                    |
| §2.9 Git Hooks & GitPython                | Ch 4 §4.3 Synchronization                  | Implementation detail                                    |
| §2.10 Typer & CLI                         | Ch 4 §4.5 CLI Interface                    | Implementation detail                                    |
| §3.1–3.4 Related Work                     | Ch 2 §2.4 Related Work + §2.5 Research Gap | Merge into theoretical chapter                           |
| §4.3.1–4.3.4 Implementation subsections   | Ch 4 (expanded)                            | Move from methodology to implementation chapter          |

---

## Session Plan (8 sessions, ~1.5 hrs each)

---

### Session 0: Restructure & Migrate (~1 hr)

**Goal:** Rearrange the report into the new 6-chapter structure. No rewriting — only cut/paste sections into correct positions, fix heading numbers, fix heading levels.

**Actions:**
1. Create the new chapter skeleton with correct `##` / `###` / `####` hierarchy
2. Move sections per the Content Migration Map above
3. Fix numbering: remove gap at §2.3.2, fix §2.5.2/2.5.3 order, normalize heading levels in Related Work
4. Add placeholder headings for missing sections: Abstract, §1.5 Report Structure, §3.1 Requirements Analysis (FR/NFR tables), §5.4 Threats to Validity, References
5. Verify: every section has a heading and at least its original content or a `[TODO]` marker

**Input artifacts:** Only `docs/report.md`
**Output:** Restructured report with correct chapter organization

---

### Session 1: Chapter 1 — Introduction (~1 hr)

**Goal:** Rewrite the introduction to clearly explain the problem, solution, and report structure. Advisor's main complaint: "introduction is short, shallow, and unclear."

**Actions:**
1. §1.1 Problem Statement — Expand from 10 lines to ~1 page. Structure as: (a) the rise of AI coding agents, (b) the three-layer failure (Model/Tool/Context) with concrete examples, (c) why this matters (autonomy gap). Use the framing already in §2.1.3 (Context paragraph about "Topological Blindness") — pull that up here.
2. §1.2 Research Objective — Keep but tighten. State the hypothesis clearly: "A Knowledge Graph layer can bridge the specification-implementation gap for autonomous agents."
3. §1.3 Scope — Keep as-is, minor polish.
4. §1.4 Methodology Overview — Expand to briefly name each phase (Specification → Design → Implementation → Evaluation) and what each produces. **Add a figure placeholder** describing the overall research flow.
5. §1.5 Report Structure — Add a new subsection: "Chapter 2 covers... Chapter 3 covers..." (standard academic practice).

**Input artifacts:** `docs/report.md` (current §1.1–1.4 + §2.1.3 Context paragraph)
**Key source:** The 3-layer problem framing from §1.1 + §2.1.3 of the original report

---

### Session 2: Chapter 2 — Theoretical Background & Related Work (~2 hrs)

**Goal:** Rewrite Chapter 2 as a proper literature/theory chapter. Remove all technology-specific decisions; keep only conceptual frameworks. Merge Related Work here.

**New structure:**
- §2.1 AI-Driven Software Development — General landscape paragraph (2–3 paragraphs introducing the concept of coding agents)
- §2.2 The Anatomy of a Coding Agent — Keep the Model/Tools/Context framework from current §2.1, but trim the tool category list (currently too long and reads like a blog post). Focus on the *framework*, not product reviews.
- §2.3 Agentic Agile & The BMad Method — Keep §2.2 content but **rewrite** the description of each phase more concisely. The advisor says: "Simply describe how an AI-driven development process works." Add a **figure** showing the BMad workflow phases. Remove "Party Mode" and "Quick Dev" details (irrelevant to thesis).
- §2.4 Knowledge Graph Theory — Keep §2.3 content (Property Graph Model, Vector vs Graph comparison, GraphRAG).
- §2.5 Related Work — Absorb current Ch III (§3.1–3.3). Restructure as a proper literature review comparing approach categories, not product reviews.
- §2.6 The Research Gap — Absorb current §3.4 ("The Critical Gap"). This becomes the bridge to Chapter 3.

**Input artifacts:** `docs/report.md` (current Ch II + Ch III)
**Key rewriting:** Remove non-academic language ("vibe coding", "USB port for AI"), replace with formal equivalents. Add citation placeholders `[ref]` for all claims.

---

### Session 3: Chapter 3 — System Design & Methodology (~2 hrs)

**Goal:** Build the methodology chapter the advisor is asking for. Clear steps, clear objectives, clear connections. This is the **most critical chapter to fix**.

**New structure:**
- §3.1 Research Methodology Overview — **New section.** Explain: "This research follows a Design Science Research methodology. The artifact is CoreText. The evaluation uses two case studies." Add a **figure** showing the DSR cycle or the research methodology flow.
- §3.2 Requirements Analysis
  - §3.2.1 Functional Requirements — Pull FR1–FR24 table from `_coretext/planning-artifacts/epics.md` (FR inventory). Format as a proper academic table.
  - §3.2.2 Non-Functional Requirements — Pull NFR targets from `_coretext/planning-artifacts/architecture.md`: sub-500ms query RTT, sub-1s sync, 10K files / 100K edges, memory caps.
- §3.3 System Architecture
  - §3.3.1 High-Level Design — Keep current §4.2.1 content. **Add a figure** showing the 4-layer architecture (CLI → Server/MCP → Core → DB). Use the component boundaries from `architecture.md`.
  - §3.3.2 Data Architecture: Schema Projection — Keep current §4.2.2. Expand with Schema Projection detail from `architecture.md` (`schema_map.yaml`, Pydantic models ↔ Markdown headers).
- §3.4 Technology Selection & Justification — **Absorb** relocated content from old §2.4 (SurrealDB), §2.5 (Gemini CLI), §2.6 (Markdown). Restructure as a decision table: "Requirement → Evaluated Options → Selected → Rationale." Include Nomic Embed MRL rationale from `architecture.md`.

**Input artifacts:** `_coretext/planning-artifacts/epics.md`, `_coretext/planning-artifacts/architecture.md`, `docs/report.md` (relocated sections)

---

### Session 4: Chapter 4 — Implementation (~1.5 hrs)

**Goal:** Describe HOW the system was built, step by step, with connections between components. The advisor wants to see the *process* and the *role/objective* of each step, not just what was built.

**New structure:**
- §4.1 Development Process — Brief description of the BMad-driven implementation process: 5 epics, 29 stories, iterative with retrospectives. Reference the sprint structure.
- §4.2 Parsing Engine (AST & Normalization) — Expand old §2.7 + §4.3.1. Describe: input (Markdown) → AST parsing → node extraction → normalization. **Add a figure** showing the parsing pipeline.
- §4.3 Knowledge Graph Construction — Expand old §4.3.2. Describe: node types (DocumentNode, SectionNode) → edge types (Contains, Parent_of, References) → upsert strategy. Reference Schema Projection.
- §4.4 Semantic Retrieval (Hybrid Search) — Expand old §4.3.3. Describe the three-mode query: vector + graph traversal + lexical.
- §4.5 Synchronization Mechanism — Expand old §2.9 + §4.3.4. Describe: Git hooks → change detection → incremental sync → fail-open policy.
- §4.6 MCP Integration — Expand old §2.8. Describe: CoreText as MCP server → exposed tools → how Gemini CLI invokes them.
- §4.7 CLI Interface — Brief, from old §2.10.

**Input artifacts:** `docs/report.md` (relocated sections), `_coretext/planning-artifacts/architecture.md`, source code structure for reference

---

### Session 5: Chapter 5 — Results & Evaluation (~2 hrs)

**Goal:** Strengthen the results chapter. Experiment 1 is critically thin. Add dogfooding data, retrospective insights, and a Threats to Validity section.

**Actions:**
1. §5.1 Experiment 1 (Self-Reflexive Case Study) — **Major expansion.** Currently ~12 lines. Incorporate:
   - Quantitative data from `docs/dogfooding-report.md`: 17 files synced, 214 nodes, 25s sync time
   - Qualitative insights from `_coretext/implementation-artifacts/epic-1-retro.md`: the "Lost in the Middle" trap, SurrealDB 2.0 version drift, process pivot from "tests pass" to "demo verified"
   - Friction points: path normalization, discovery bloat (1000+ files before filtering)
2. §5.2 Experiment 2 (Project Trore) — Keep existing tables. Polish language. Ensure each story observation connects back to the thesis.
3. §5.3 Discussion — Keep existing 3 themes. Add connections to the Chapter 2 theoretical framework. Reference specific data from both experiments.
4. §5.4 Threats to Validity — **New section.** Cover: (a) small sample size (2 projects, 1 epic evaluated quantitatively), (b) SurrealDB version instability, (c) single-model evaluation (Gemini only), (d) path portability issues, (e) the "author-as-evaluator" bias in the self-reflexive study.

**Input artifacts:** `docs/dogfooding-report.md`, `_coretext/implementation-artifacts/epic-1-retro.md`, `docs/report.md` (existing Ch V)

---

### Session 6: Chapter 6, Abstract, References (~1 hr)

**Goal:** Polish conclusion, write abstract, compile references.

**Actions:**
1. §6.1 Conclusion — Rewrite to directly answer the research objective from §1.2. Summarize key findings from both experiments with numbers.
2. §6.2 Future Work — Keep 3-phase vision but add concrete items from `docs/technical_debt.md` and `docs/dogfooding-report.md` gap analysis.
3. Abstract — Write last (after all sections are stable). 200–300 words: problem → approach → key result → contribution.
4. References — Compile citation placeholders left during Sessions 2–5 into a proper reference list. Key references to include: MCP specification (Anthropic 2024), SurrealDB docs, BMad framework, GraphRAG papers, "Lost in the Middle" paper (Liu et al. 2023), SWE-bench.

**Input artifacts:** `docs/report.md` (full revised version), `docs/technical_debt.md`

---

### Session 7: Final Pass — Figures & Consistency (~1.5 hrs)

**Goal:** Address the advisor's explicit request for figures. Review the full report for consistency.

**Actions:**
1. Add/finalize all figure descriptions (at minimum, describe each figure in text so it can be created separately):
   - **Figure 1:** Research methodology flow (Introduction)
   - **Figure 2:** AI Coding Agent architecture (Model/Tools/Context) (Ch 2)
   - **Figure 3:** BMad workflow phases (Ch 2)
   - **Figure 4:** CoreText system architecture — 4-layer diagram (Ch 3)
   - **Figure 5:** Markdown → AST → Graph pipeline (Ch 4)
   - **Figure 6:** MCP integration flow (Ch 4)
   - **Figure 7:** Token efficiency comparison chart (Ch 5)
2. Consistency check: heading levels, numbering, cross-references between chapters, table numbering, academic tone throughout
3. Verify all `[TODO]` markers are resolved
4. Check total page count meets minimum threshold

**Input artifacts:** Full revised `docs/report.md`

---

## Session Routing Quick Reference

| Session | Chapter                    | Time   | Priority               | Key Artifact Sources                  |
| ------- | -------------------------- | ------ | ---------------------- | ------------------------------------- |
| 0       | Structure migration        | 1 hr   | **P0 — do first**      | report.md only                        |
| 1       | Ch 1 Introduction          | 1 hr   | P1                     | report.md                             |
| 2       | Ch 2 Theory + Related Work | 2 hr   | P1                     | report.md (Ch II + III)               |
| 3       | Ch 3 Design & Methodology  | 2 hr   | **P0 — most critical** | epics.md, architecture.md             |
| 4       | Ch 4 Implementation        | 1.5 hr | P2                     | architecture.md, report.md            |
| 5       | Ch 5 Results & Evaluation  | 2 hr   | P1                     | dogfooding-report.md, epic-1-retro.md |
| 6       | Ch 6 + Abstract + Refs     | 1 hr   | P2                     | technical_debt.md                     |
| 7       | Figures & Final Pass       | 1.5 hr | P1                     | Full report                           |

**If time runs out**, prioritize: Session 0 → Session 3 → Session 5 → Session 1 → Session 2 → Session 7 → Session 4 → Session 6.

---

## Per-Session Agent Prompt Template

At the start of each new chat session, provide:

```
You are helping rewrite an academic report. Here is the master plan: [paste this plan].
We are now in **Session N: [title]**.
The current report is at docs/report.md.
The relevant source artifacts for this session are: [list files].
Your task: [copy the specific session's Actions list].
Constraints:
1. **Tone & Style:** Academic tone, formal language, no slang. Describe figures in text (e.g., "Figure N shows...") even if the image isn't created yet. Add [ref] placeholders for citations.
2. **Coherence & Unity:** Maintain a seamless narrative flow. Ensure logical transitions between sections to support the continuous development of core arguments. **Strictly enforce terminological consistency**, using agreed-upon keywords throughout to bind the report together.
3. **Iterative Workflow:** Perform edits strictly subsection by subsection.
	- *Step 1:* Focus on the current subsection (e.g., 1.1).
	- *Step 2:* Propose edits/drafts for that specific part.
	- *Step 3:* **Stop and wait.** Discuss with the user and only apply edits after explicit approval.
	- *Step 4:* Move to the next subsection (e.g., 1.2) only when instructed.
```

---

## Architectural Decisions

- **Merged Related Work into Ch 2** rather than keeping it as a separate chapter — standard practice for SE theses and reduces the "thin chapter" problem.
- **Separated Implementation (Ch 4) from Methodology (Ch 3)** — the advisor wants methodology to explain the *research process*, not the code. Implementation details belong in their own chapter.
- **Technology justifications moved to Ch 3** — SurrealDB/Gemini/Markdown choices are design decisions, not theoretical background.
- **Session 0 (restructure) is non-negotiable** — all subsequent sessions depend on the correct structure being in place.

---

## Artifact Inventory (Available Sources)

### Planning Artifacts (`_coretext/planning-artifacts/`)
| File                        | Lines | Key Content                                                    |
| --------------------------- | ----- | -------------------------------------------------------------- |
| prd.md                      | 308   | Product Requirements, success criteria, user journeys          |
| architecture.md             | 497   | NFR targets, Schema Projection, tech rationale, directory tree |
| epics.md                    | 656   | FR1–FR24 inventory, 5 epics / 29 stories, acceptance criteria  |
| project_context.md          | 61    | Tech stack rules, implementation constraints                   |
| test-design-epic-{1-4}.md   | —     | Testing methodology per epic                                   |
| sprint-change-proposal-*.md | —     | 5 change proposals documenting course corrections              |

### Implementation Artifacts (`_coretext/implementation-artifacts/`)
| File                               | Key Content                         |
| ---------------------------------- | ----------------------------------- |
| story-{epic}-{story}.md (29 files) | Per-story implementation details    |
| epic-{1,3,4}-retro.md              | Retrospective data, lessons learned |
| sprint-status.yaml                 | Sprint tracking state               |

### Documentation (`docs/`)
| File                     | Key Content                                            |
| ------------------------ | ------------------------------------------------------ |
| dogfooding-report.md     | Self-dogfooding metrics: 17 files, 214 nodes, 25s sync |
| technical_debt.md        | Known technical debt items                             |
| coretext-user-guide.md   | Operational usage details                              |
| epic-{1-4}-demo-guide.md | Per-epic demo procedures                               |

### Source Code (`coretext/`)
```
coretext/
├── main.py, config.py
├── cli/ (commands.py, adapter.py, utils.py)
├── core/
│   ├── graph/ (manager.py, models.py)
│   ├── parser/ (markdown.py, path_utils.py, schema.py)
│   ├── sync/ (engine.py, git_utils.py, timeout_utils.py)
│   ├── lint/ (manager.py, models.py)
│   ├── system/ (maintenance.py, memory.py, process.py)
│   └── vector/ (embedder.py)
├── db/ (client.py, migrations.py)
├── server/
│   ├── mcp/ (manifest.py, routes.py)
│   └── routers/ (lint.py)
└── templates/ (architecture.md, epic.md, prd.md, story.md)
```

### Known Structural Issues in Current Report
- Section 2.3.2 is missing (jumps 2.3.1 → 2.3.3)
- Section 2.5.2 and 2.5.3 are out of order
- Inconsistent heading levels in Ch III (§3.1–3.3 use `####`, §3.4 uses `###`)
- §2.4.2 uses `###` instead of `####`
- No diagrams/figures anywhere
- No Abstract, no References section, no Table of Contents
