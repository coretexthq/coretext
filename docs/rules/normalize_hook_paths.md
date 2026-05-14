# Normalize Hook Paths

**Trigger:** Using absolute file paths from CLI payload in hooks

## Context
Using absolute file paths from the CLI payload caused mismatches with the relative `docs/...` node IDs defined in the `coretext.jsonl` graph structure.

## Axiom
Always normalize file paths in hooks by stripping the `GEMINI_PROJECT_DIR` prefix to ensure relative matching.