# Coretext Memory

## Status
- Current focus: backend-agnostic trace sync, session logs, and durable rule extraction.
- The source of truth is still the Markdown vault plus the append-only graph, not a heavyweight database.

## Memory Layers
1. Episodic memory: session-backed structured logs in `.coretext/sessions/*.jsonl` and summaries.
2. Semantic memory: distilled rules and concept links in `docs/rules/*` and the graph.
3. Associative memory: optional search and retrieval layers on top of the file graph.

## The Index
- The file system and Git history are the primary memory substrate.
- The event log and session traces act as the JIT index for recall.
- The current implementation favors deterministic paging of compact cues over probabilistic weighting.

## Agent Trace Sync
- Session logs are backend-agnostic at the point of capture.
- The engine can later digest them into summaries, graph links, and scoped hints.
- This keeps trace handling portable while still feeding the durable knowledge graph.

## Resource
- [[coretext.memory.trace-sync]]
- [[coretext.memory.hippocampal_index]]
- [[coretext.memory.digital_hippocampus]]
- [[coretext.memory.decoupled_graph]]
- [[coretext.memory.background_intuition]]
- `docs/rules/session_based_hooks.md`
