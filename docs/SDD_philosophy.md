# Deterministic State-Driven Development (D-SDD)

1. **Isolation:** Agents boot cold in isolated worktrees.
2. **Constraints:** `ARCHITECTURE.md`, `docs/`, and `knowledge/` are immutable rules.
3. **Execution Triad:** Goal (`target_state.md`) + Gate (Failing Tests) + Scope (`atomic_step.md`).
4. **Loop:**
   - **Plan:** Planner translates intent into Goal, Scope, and failing Tests.
   - **Execute:** Executor writes code to pass tests, guided by injected SQLite hints. Halts on paradox.
   - **Review:** Reviewer audits diff against architecture. Extacts knowledge to `knowledge/` and updates `experience.json`.
   - **Merge:** Human verifies Reviewer's audit against original intent. Planner merges.
5. **Context Injection:** SQLite passively injects `docs/` and `knowledge/` files directly into agent context based on glob paths defined in `experience.json` when those files are modified.