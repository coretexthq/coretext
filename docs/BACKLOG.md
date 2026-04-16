# Backlog

## Now

- [ ] **Architecture:** Write a new `ARCHITECTURE.md`.
- [ ] **Readme:** Write new `README.md`
- [ ] **Testing:** Define project-specific physics in `docs/testing.md`.
- [ ] **Engine (Coretext v2 JSONL Pivot):** 
  - [ ] **Migrate to JSONL Event Sourcing:** Strip out SQLite dependencies. Rewrite `experience_engine.py` to use a pure Python append-only event log (`experience.jsonl`).
  - [ ] **Glob-Matching Routing:** Implement `fnmatch` logic in Python to resolve `source` globs against file paths, replacing the SQLite exact-match queries.
  - [ ] **Diff-Based Injection:** Update `inject_context.py` to inject knowledge based on `git diff --name-only` so the Reviewer gets context for modified files.
  - [ ] **Schema & Path Linter:** Write a script (`lint_experience.py`) to run as a pre-commit hook. It must parse the JSONL file, validate each line against `experience_schema.json`, and ensure all `target` paths actually exist on disk (Fail-Open on missing).
- [ ] **Visualization:** Update `visualize_graph.py` to project state from the new `experience.jsonl` event log instead of the old JSON array.

---

## Later

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
1. **`docs/ARCHITECTURE.md` (Generative Blueprint):** 
   - The map. It tells the agent what to do *right* initially (e.g., Folder structures, naming conventions). Prevents the "Cold Start" problem.
2. **`docs/rules/*.md` (The Evolving Frontier / Case Law):** 
   - Atomic lessons extracted by the Reviewer. Passively injected via JSONL Event Log (`.coretext/coretext.jsonl`). Tells the Executor how to avoid previously encountered traps.
3. **Custom Linters (Restrictive Enforcement):** 
   - The electric fence. Invisible to the LLM's context window. Sits in the CI pipeline to physically block structural violations instantly (e.g., "Module A cannot import Module B"). Zero token cost.

### The D-SDD Rule Funnel
Your goal as the Human Orchestrator is to push knowledge down this funnel to minimize token cost and maximize determinism:
1. **Discovery:** Reviewer catches an error and writes `docs/rules/*.md`. (High Token Cost: Injected as a passive hint).
2. **Formalization:** Synthesize global lessons into `docs/ARCHITECTURE.md`. (Medium Token Cost: Read by Planner/Reviewer globally).
3. **Mechanization:** Convert the rule into a Custom Linter. (Zero Token Cost: Enforced by the compiler).
ompiler).
r).
ompiler).
