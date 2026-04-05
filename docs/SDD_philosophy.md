# Deterministic State-Driven Development (D-SDD)

## 1. Principles
- **Process Isolation:** Agents must boot cold in isolated Git branches or worktrees to prevent context pollution.
- **Strict Constraints:** `ARCHITECTURE.md` and `docs/` contain pure structural rules that must not be violated.
- **Causality:** Intent precedes execution. Architecture is updated before code is written, never after to justify a workaround.

## 2. The Development Loop
1. **Issue:** Human describes the problem to the Planner.
2. **Plan:** Planner writes `target_state.md` (expected state) and `atomic_step.md` (atomic step).
3. **Execute:** Executor subagent boots cold, writes code and tests, and halts. If blocked by constraints, it logs to `handoff.md` and halts.
4. **Review:** Reviewer subagent boots cold, reviews the diff against `target_state.md` and `ARCHITECTURE.md`, and writes a concise summary to `handoff.md`.
5. **Distill:** Planner reads `handoff.md`, merges the branch, updates `ARCHITECTURE.md`, and updates the dependency graph. Temporary artifacts are deleted.

## 3. Telemetry and Context Routing
- Agents log their tool usage (e.g., reading a specific doc to modify a specific file) to `experience.json`.
- The Planner periodically analyzes `experience.json` to create explicit, hard-coded dependency edges in the SurrealDB graph.
- Coretext uses these hard edges to passively inject precise context hints to future agents modifying those files.