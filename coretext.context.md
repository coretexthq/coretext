# Coretext Context

## Status
- Focus: agent-context management, path normalization, and the injected cues that keep context small.
- The current runtime injects hints or full files from `.coretext/{workspace}.jsonl` matches based on the file being read or written.

## Context Management
- A matched edge can inject a compact hint, or a full file/directory payload when the engine needs deeper hydration.
- `notify_action.py` normalizes absolute hook paths by stripping `GEMINI_PROJECT_DIR` so they match graph node IDs.
- The write hook can block until a file is acknowledged, which keeps the context contract explicit instead of silent.
- The graph favors file pointers and compact cues, leaving deeper inspection to the agent's native tools.

## Resource
- [[coretext.context.management]]
- [[coretext.architecture.bare_metal]]
- `docs/rules/normalize_hook_paths.md`
