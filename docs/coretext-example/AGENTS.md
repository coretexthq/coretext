# Agent Rules (D-SDD)

1. **Truth:** `ARCHITECTURE.md`, `docs/`, `knowledge/`.
2. **Gate:** Code requires a Planner-authored failing test.
3. **Intent:** Never update architecture to justify code changes.
4. **Scope:** Plan only the immediate atomic step. No roadmaps.

## Artifacts
- `docs/superpowers/specs/*`: Active goal (Planner).
- `docs/superpowers/plans/*`: Immediate task and tests (Planner).
- `docs/handoffs/*`: Execution/Audit report (Executor/Reviewer).
- `knowledge/*.md`: Atomic architectural rules extracted during audits.
- `experience.json`: Edge graph mapping source code paths to `docs/` and `knowledge/` for SQLite injection.
- `backlog.md`: Human intent queue.