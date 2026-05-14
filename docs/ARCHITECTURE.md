# Coretext Architecture

## Vision
Coretext implements an Event Sourcing architecture to map system state and code paths to architectural intent via a deterministic, typed edge graph.

## Axioms
- **Data Storage:** The graph is an append-only Event Log stored as NDJSON/JSONL in `.coretext/coretext.jsonl`. This avoids merge conflicts inherent to standard JSON arrays.
- **Matching Engine:** Replaces exact-match SQLite queries with pure Python glob-matching (`fnmatch`) to resolve `source` globs against modified file paths, ensuring context injects even for newly created files. A specificity hierarchy resolves conflicts (more specific patterns override broader ones).
- **Background Intuition:** Coretext does not act as a gatekeeper forcing agents to run external queries. Instead, it provides subconscious recall by injecting *compact cues* (e.g., heading names, target paths, and short relational reasons). The agent then relies on native tools (`grep`, `read`, LSP) to inspect the full content, preserving context limits.
- **Validation:** Edges must conform to the strict schema defined in `.coretext/coretext_schema.json` to guarantee loud failures on invalid states.
- **Philosophy:** Refer to `README.md` for the underlying D-SDD (Deterministic State-Driven Development) principles.

## Components
- `Coretext Engine`: The core Python matching and routing system (`.coretext/coretext_engine.py`) that parses the JSONL event log.
- `Event Log (.coretext/coretext.jsonl)`: The source of truth for all edges. Each line is an independent JSON object mapping a source path to a constraint.
- `Schema (.coretext/coretext_schema.json)`: Enforces the structure of the JSONL events. Required fields:
  - `source`: A file path or glob pattern (e.g., agent prompt, source code file).
  - `target`: The file path being linked to.
  - `type`: Defines how Coretext routes context (`full` for mandatory full-text injection, or `hint` for injecting just the title as a cue).
  - `description`: Agent's detailed reasoning or intent for the link.
  - `hook` (Optional): Specifies when the injection should occur (`read`, `write`, or `both`).
- `Rules (docs/rules/)`: Atomic architectural constraint files injected into agent context.
- `Scripts`: Utilities provided in `.coretext/` for interacting with the engine:
  - `add_rules.py`: Appends a new constraint edge to the JSONL log.
  - `inject_context.py`: Runs the glob-matching engine to dynamically inject context for a given file.
  - `visualize_graph.py`: Generates Mermaid structural diagrams from the edge graph.