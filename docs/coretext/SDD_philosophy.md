# Deterministic State-Driven Development (D-SDD)

1. **Isolation:** Agents boot cold in isolated worktrees.
2. **Constraints:** `docs/ARCHITECTURE.md`, `docs/`, and `docs/rules/` are immutable rules.
3. **Execution Triad:** Goal (`docs/superpowers/specs/*`) + Gate (Failing Tests) + Scope (`docs/superpowers/plans/*`).
4. **Loop:**
   - **Plan:** Planner translates intent into Goal, Scope, and failing Tests.
   - **Execute:** Executor writes code to pass tests, guided by injected SQLite hints. Documents decisions in `docs/handoffs/*`. Halts on paradox.
   - **Review:** Reviewer audits diff against architecture. Extracts knowledge to `docs/rules/` and updates `.coretext/coretext.jsonl`.
   - **Merge:** Human verifies Reviewer's audit against original intent. Planner merges.
5. **Context Injection:** SQLite passively injects `docs/` and `docs/rules/` files directly into agent context based on glob paths defined in `.coretext/coretext.jsonl` when those files are modified.