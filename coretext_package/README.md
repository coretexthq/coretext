# Coretext

Coretext is an Event Sourced architecture routing and review engine for AI agents implementing Deterministic State-Driven Development (D-SDD).

It serves as a strict, deterministic routing and review engine for AI agents. Rather than relying on prompt-heavy frameworks that suffer from "Topological Blindness" regarding global constraints, Coretext uses an Event Sourcing architecture to map system state, active agents, and code to architectural intent and historical provenance.

## Philosophy

Coretext is built on the philosophy of **Simplicity on the far side of complexity**.

### Core Principles
1. **Isolation:** Agents boot cold in isolated worktrees.
2. **Constraints:** `docs/ARCHITECTURE.md`, `docs/`, and `docs/rules/` are immutable rules.
3. **Execution Triad:** Goal (`docs/superpowers/specs/*`) + Gate (Failing Tests) + Scope (`docs/superpowers/plans/*`).
4. **Context Injection:** A deterministic engine passively injects `docs/` and `docs/rules/` files directly into an agent's context based on glob paths defined in `.coretext/{workspace_name}.jsonl`. This structural state, alongside real-time telemetry of active agent file interactions, can be visualized interactively by running the local dashboard.

## Features
- **Deterministic Context Routing**: Context is resolved via strict pure Python glob-matching (`fnmatch`), enforcing the "Virtual MMU" concept.
- **Append-only Event Log**: Instead of standard databases, Coretext maps knowledge into an NDJSON/JSONL event log (`.coretext/coretext.jsonl`) avoiding merge conflicts and brittle structures.
- **Interactive Visualization**: Live React dashboard for structural diagrams and session state.
- **Agent Workflows Support**: Clear separation of roles via specialized skills (`planner`, `executor`, `reviewer`).

## Architecture Overview

Coretext implements an Event Sourcing architecture to map system state and code paths to architectural intent via a deterministic, typed edge graph.

The system relies on an **append-only Event Log** stored as NDJSON/JSONL in `.coretext/coretext.jsonl`. This avoids merge conflicts inherent to standard JSON arrays.

The **Matching Engine** replaces exact-match SQLite queries with pure Python glob-matching (`fnmatch`) to resolve `source` globs against modified file paths, ensuring context injects even for newly created files. A specificity hierarchy resolves conflicts.

Coretext acts as a **Virtual MMU (Memory Management Unit)**. If the LLM is the CPU and its Context Window is RAM, Coretext acts as the Virtual MMU mapping a large project space to a limited execution space.

See the detailed [Architecture](docs/ARCHITECTURE.md) and [System Flowchart](docs/coretext/coretext_flowchart.md) for more details.

## Installation

### Prerequisites
- Node.js (for the dashboard)
- Python >= 3.8

### Setup

Run the setup script from the root of the project to install dependencies for the local dashboard and the Python package:

```bash
./setup_coretext.sh
```

Alternatively, you can install the python package directly using `pip`:
```bash
pip install -e .
```

## Usage

### The D-SDD Loop (Agent Workflow)

Coretext structures the AI agent loop into the following workflow:

1. **Plan:** The Planner translates human intent (`docs/BACKLOG.md`) into a Goal (`docs/superpowers/specs/*`), Scope (`docs/superpowers/plans/*`), and failing Tests. It must organically explore architecture docs.
2. **Execute:** The Executor writes code to pass tests, guided by injected constraints. It documents decisions in `docs/handoffs/*` and halts on paradox.
3. **Review:** The Reviewer audits the diff against the architecture. It extracts new knowledge to `docs/rules/` and updates the `.coretext/{workspace_name}.jsonl` event log.
4. **Merge:** A Human verifies the Reviewer's audit against original intent. Planner merges.

### Interactive Dashboard

Start the live interactive state visualization dashboard, which highlights nodes touched by agents and supports selecting dynamic workspace graphs and sessions:

```bash
cd .coretext/coretext-graph-ui
npm run start
```

### CLI / Engine Scripts

Coretext provides utility scripts inside `.coretext/` for interacting with the core matching engine:

- **Append Rules**: Append a new constraint edge to the JSONL log.
  ```bash
  python .coretext/add_rules.py
  ```
- **Inject Context**: Run the glob-matching engine to dynamically inject context for a given file.
  ```bash
  python .coretext/inject_context.py
  ```
- **Telemetry Hook**: Log file reads/writes for real-time visual feedback.
  ```bash
  python .coretext/notify_action.py
  ```
- **Visualizations**: Generate structural diagrams from the edge graph.
  ```bash
  python .coretext/visualize_graph.py
  ```

## Artifact Management

- **Human:** Provide intent via `docs/BACKLOG.md`.
- **Planner:** Outputs active specs to `docs/superpowers/specs/*` and tasks to `docs/superpowers/plans/*`.
- **Executor / Reviewer:** Documents execution decisions and audit reports in `docs/handoffs/*`.
- **Reviewer:** Extracts atomic architectural lessons to `docs/rules/*.md` and appends new routing edges to the event log.

## Evolution

Coretext has evolved from a spec-driven methodology using a complex graph database (SurrealDB, Coretext v1) to a passive SQLite injection engine (early Coretext v2), and finally to an Event Sourced architecture using an append-only `.jsonl` file with pure Python glob-matching (`fnmatch`). This pivot resolves brittleness around exact file path matching and mitigates JSON merge conflicts, offering a minimalist foundation for continuous architectural experimentation.
