# Agent Instructions & Workflows

You are a Coretext Agent operating under the Session-Structured Knowledge Lifecycle (SSKL) framework, utilizing a session-first, constraint-driven workflow.

## Foundational Rules
1. **Truth:** Stable/durable project and scope notes under `knowledge/` (outside `knowledge/ai/`) and technical specifications in `docs/` are absolute mandates (acting as system contracts). You cannot change architecture or rules to justify a code change.
2. **Session-First Workflow:** Break work into focused sessions, preserve reusable summaries, and update stable project/scope notes only with durable deltas.
3. **Scope:** Plan and execute only the immediate step. Do not invent roadmaps.
4. **Path Conventions:** Use general practices like `~/` for the global root, and `./` for the repository root.

## Packaged Agent Instruction
For Coretext evaluation runs, project/scope/sub-scope delegation, or nested subagent work, use [docs/coretext_agent_instruction.md](./docs/coretext_agent_instruction.md) as the single packaged operating contract. It consolidates this repository instruction, the knowledge workflow, the Coretext rule-promotion workflow, and the recursive subagent protocol.

## Project Structure
This project organizes documentation, event ledgers, rules, and scripts across three main directories:

- **`knowledge/`:** The project-level knowledge base root (equivalent to `{{project_root}}` in the `knowledge` skill).
  - Durable scope and strategy notes reside directly in this directory (e.g., [coretext.workflow.md](./knowledge/coretext.workflow.md)).
- **`knowledge/ai/`:** Houses AI session notes, summaries, and transcripts (e.g., [coretext.workflow.knowledge-pivot.md](./knowledge/ai/coretext.workflow.knowledge-pivot.md)).
- **`.coretext/`:** Contains engine scripts (`coretext_engine.py`), linter utilities (`lint_graph.py`, `clean_graph.py`). It also houses the visualization UI in `coretext-graph-ui/`.
- **`.coretext-data/`:** Stores local workspace data, including event ledgers (`{workspace_name}_rules.jsonl`).
- **`docs/`:** Holds technical specifications and runtime hook references (e.g., [coretext_hooks.md](./docs/coretext_hooks.md)).

## Specialized Skills & Workflows
Leverage custom skills in `.agents/skills/` to execute tasks in this repository. Refer to each skill's `SKILL.md` for specific instructions.

### 1. `knowledge` Skill
* **When to use:** Use for exploring project context, starting/ending working sessions, organizing backlog items, distilling session evidence into stable notes, and promoting confirmed lessons/rules into deterministic constraints.
* **Workflow mapping:** 
  - Read durable notes in `knowledge/` to orient yourself before coding.
  - Summarize session outcomes into new notes under `knowledge/ai/`.
  - Distill stable project knowledge into the relevant MOC/scope notes directly in `knowledge/`.
  - Run the Coretext rule-promotion workflow consolidated in [coretext.md](./.agents/skills/knowledge/references/coretext.md) to audit/clean the ledger, distill constraints into durable scope notes, and register routing edges using `uv run .coretext/add_rules.py`.

### 2. `export` Skill
* **When to use:** Use when exporting conversation logs and transcripts for external ingestion or sync.
