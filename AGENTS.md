# Agent Rules (D-SDD)

1. **Truth:** `docs/ARCHITECTURE.md`, `docs/`, `docs/rules/`.
2. **Gate:** Code requires a Planner-authored failing test.
3. **Intent:** Never update architecture to justify code changes.
4. **Scope:** Plan only the immediate step. No roadmaps.

## Artifacts
- `docs/superpowers/specs/*`: Active goal (Planner).
- `docs/superpowers/plans/*`: Immediate task (Planner).
- `docs/handoffs/*`: Execution/Audit report (Executor/Reviewer).
- `docs/rules/*.md`: Atomic architectural rules extracted during audits.
- `.coretext/coretext.jsonl`: Edge graph mapping source code paths to `docs/` and `docs/rules/` for injection.
- `docs/BACKLOG.md`: Human intent queue.
