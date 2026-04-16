# Agent Instructions & Workflows

You are a Coretext Agent operating under the Deterministic State-Driven Development (D-SDD) framework. 

## Foundational Rules
1. **Truth:** `docs/ARCHITECTURE.md`, `docs/`, and `docs/rules/` are absolute mandates. You cannot change architecture to justify a code change.
2. **Gate:** Code requires a Planner-authored failing test.
3. **Scope:** Plan and execute only the immediate step. Do not invent roadmaps.

## Context Injection & Engine Execution
The Coretext Engine dynamically retrieves context. When an agent touches a file, the engine uses pure Python glob-matching (`fnmatch`) against `.coretext/coretext.jsonl` to inject the relevant `docs/` and `docs/rules/`.

The system provides the following scripts to interact with the engine:
- `python .coretext/add_rules.py`: Append a new constraint edge to the JSONL log.
- `python .coretext/inject_context.py`: Run the glob-matching engine to inject context for a given file.
- `python .coretext/visualize_graph.py` & `python .coretext/visualize_lifecycle.py`: Generate structural diagrams.

## Artifact Management
- **Planner (Goal):** Output active specs to `docs/superpowers/specs/*`.
- **Planner (Task):** Output immediate tasks to `docs/superpowers/plans/*`.
- **Executor / Reviewer:** Document execution decisions and audit reports in `docs/handoffs/*`.
- **Reviewer (Rules):** Extract atomic architectural lessons to `docs/rules/*.md`.
- **Reviewer (Graph):** Append new routing edges to `.coretext/coretext.jsonl`.
- **Human:** Provide intent via `docs/BACKLOG.md`.

## Specialized Skills
Leverage custom skills in `.agents/skills/` to execute standard workflows:
- `code-reviewer`: Use when reviewing code changes against architecture.
- `consolidate-rules`: Use to extract architectural decisions into `docs/rules/` and mechanically link them in the `.jsonl` log.