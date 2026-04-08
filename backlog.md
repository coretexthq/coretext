# Backlog

- [ ] **Architecture:** Synthesize historical BMAD artifacts into `ARCHITECTURE.md`.
- [ ] **Testing:** Define project-specific physics in `docs/testing.md`.
- [ ] **Benchmarks:** Re-evaluate quantitative and qualitative reporting. Adopt **SlopCodeBench** for testing D-SDD. Use the first task in a sequence as the "intent/greenfield", and subsequent tasks to evaluate Coretext v2's ability to resist architectural rot and enforce constraints via `knowledge/*.md` injections and the Planner-Executor-Reviewer triad. Drop ProjDevBench and `trore`.
- [ ] **Engine:** Implement SQLite JIT injection logic for `experience.json`.
- [ ] **Visualization:** Build a graph UI for `experience.json` (abstract JSON for humans).
- [ ] **AST Enforcement:** Research/implement AST patch mechanisms instead of raw text output.
- [ ] **Sandboxing:** Implement isolated, ephemeral Nix/Docker environments for Executor.
- [ ] **Property-Based Testing:** Refactor the Planner's testing axioms to generate property-based tests (Hypothesis/fast-check).
- [ ] **Cryptographic Intent Hashing:** Hash target states/atomic steps to commit metadata for traceability.
- [ ] **Linter Generation:** Build a pipeline to convert structural `knowledge/*.md` axioms into custom AST linter rules.
- [ ] **Backlog Infrastructure:** Migrate `backlog.md` into a `backlog/` directory (or external GitHub Issues) to isolate human draft ideation from the Planner's context window.

---

## Appendix: The Rule Lifecycle (Human Reference)

*Note: As the system matures, these human-facing philosophical notes should be kept strictly separated from the Planner's execution queue to prevent context contamination.*

### The Boundary of Constraints
1. **`ARCHITECTURE.md` (Generative Blueprint):** 
   - The map. It tells the agent what to do *right* initially (e.g., Folder structures, naming conventions). Prevents the "Cold Start" problem.
2. **`knowledge/*.md` (The Evolving Frontier / Case Law):** 
   - Atomic lessons extracted by the Reviewer. Passively injected via SQLite (`experience.json`). Tells the Executor how to avoid previously encountered traps.
3. **Custom Linters (Restrictive Enforcement):** 
   - The electric fence. Invisible to the LLM's context window. Sits in the CI pipeline to physically block structural violations instantly (e.g., "Module A cannot import Module B"). Zero token cost.

### The D-SDD Rule Funnel
Your goal as the Human Orchestrator is to push knowledge down this funnel to minimize token cost and maximize determinism:
1. **Discovery:** Reviewer catches an error and writes `knowledge/*.md`. (High Token Cost: Injected as a passive hint).
2. **Formalization:** Synthesize global lessons into `ARCHITECTURE.md`. (Medium Token Cost: Read by Planner/Reviewer globally).
3. **Mechanization:** Convert the rule into a Custom Linter. (Zero Token Cost: Enforced by the compiler).
