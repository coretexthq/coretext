# Deterministic State-Driven Development (D-SDD)

## The Philosophy
Coretext is built on the philosophy of **Simplicity on the far side of complexity**. It serves as a strict, deterministic routing and review engine for AI agents. 

Rather than relying on prompt-heavy frameworks that suffer from "Topological Blindness" regarding global constraints, Coretext uses an Event Sourcing architecture to map system state, active agents, and code to architectural intent and historical provenance. 

### Core Principles
1. **Isolation:** Agents boot cold in isolated worktrees.
2. **Constraints:** `docs/ARCHITECTURE.md`, `docs/`, and `docs/rules/` are immutable rules.
3. **Execution Triad:** Goal (`docs/superpowers/specs/*`) + Gate (Failing Tests) + Scope (`docs/superpowers/plans/*`).
4. **Context Injection:** A deterministic engine passively injects `docs/` and `docs/rules/` files directly into an agent's context based on glob paths defined in `.coretext/coretext.jsonl`.

## The D-SDD Loop
1. **Plan:** The Planner translates intent into a Goal, Scope, and failing Tests. It must organically explore architecture docs.
2. **Execute:** The Executor writes code to pass tests, guided by injected constraints. It documents decisions in `docs/handoffs/*` and halts on paradox.
3. **Review:** The Reviewer audits the diff against the architecture. It extracts new knowledge to `docs/rules/` and updates the `.coretext/coretext.jsonl` event log.
4. **Merge:** A Human verifies the Reviewer's audit against original intent. Planner merges.

## System Analogy & Boundaries
- **The Virtual MMU (Memory Management Unit):** Coretext adopts OS memory concepts. If the LLM is the CPU and its Context Window is RAM, Coretext acts as the Virtual MMU mapping a large project space to a limited execution space. - **Division of Labor:** Coretext strictly manages *project knowledge* (specifications, architectural constraints, associative memory) defined in Markdown. It is yet to compete with Code Intelligence tools like GitNexus or Language Server Protocols (LSP), which own precise symbol navigation. Coretext's connections map at the directory and file level to avoid brittle symbol tracking during refactors.

## Evolution
Coretext has evolved from a spec-driven methodology using a complex graph database (SurrealDB, Coretext v1) to a passive SQLite injection engine (early Coretext v2), and finally to an Event Sourced architecture using an append-only `.jsonl` file with pure Python glob-matching (`fnmatch`). This pivot resolves brittleness around exact file path matching and mitigates JSON merge conflicts, offering a minimalist foundation for continuous architectural experimentation.