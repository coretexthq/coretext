# Coretext Architecture

## Status
- Coretext is implemented as a deterministic, typed edge graph that maps source globs to target docs and skills.
- The source of truth is the workspace filesystem plus the append-only `.coretext/{workspace}.jsonl` ledger.
- Matching uses pure Python `fnmatch` in `.coretext/coretext_engine.py`, with folder fallback and hook filtering for `read`, `write`, or `both`.
- Hint edges keep context small by default, while full edges can hydrate the target file or directory when the engine needs deeper context.
- The hidden package mirror and dashboard are part of the current runtime, not separate side projects.

## Core Model
- AI agent = OS/process.
- LLM = CPU.
- Context window = RAM.
- Coretext = virtual MMU.
- Markdown headings = segmentation table.
- JSONL edges = paging/index metadata.
- Hooks = page faults and write guards.

## Current Mapping
- Source globs in `.coretext/coretext.jsonl` select which docs are injected for a given file.
- `hint` edges keep payloads small; `full` edges hydrate entire targets when deeper context is needed.
- `read` and `write` hooks let the engine distinguish passive recall from guarded modification.
- Session JSONL files provide the audit trail for hook activity and highlights.

## Components
- `.coretext/coretext_engine.py`
- `.coretext/inject_context.py`
- `.coretext/add_rules.py`
- `.coretext/notify_action.py`
- `.coretext/visualize_graph.py`
- `.coretext/coretext-graph-ui/`
- `coretext_package/`
- `docs/rules/`

## Resource
- [[coretext.architecture.cognitive_infra]]
- [[coretext.architecture.headless_os]]
- [[coretext.architecture.bare_metal]]
- [[coretext.architecture.unified_platform]]
- [[coretext.architecture.VMMU]]
- [[archived.coretext.database]]
- [[archived.coretext.sandbox]]
- `docs/ARCHITECTURE.md`
- `docs/coretext/coretext_flowchart.md`
