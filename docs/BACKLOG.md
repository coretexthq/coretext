# Backlog

## Now

- [ ] **Architecture:** Write a new `ARCHITECTURE.md`.
- [ ] **Testing:** Define project-specific physics in `docs/testing.md`.
- [ ] **Engine (Coretext v2 JSONL Pivot):** 
  - [ ] **Migrate to JSONL Event Sourcing:** Strip out SQLite dependencies. Rewrite `experience_engine.py` to use a pure Python append-only event log (`experience.jsonl`).
  - [ ] **Glob-Matching Routing:** Implement `fnmatch` logic in Python to resolve `source` globs against file paths, replacing the SQLite exact-match queries.
  - [ ] **Diff-Based Injection:** Update `inject_context.py` to inject knowledge based on `git diff --name-only` so the Reviewer gets context for modified files.
  - [ ] **Schema & Path Linter:** Write a script (`lint_experience.py`) to run as a pre-commit hook. It must parse the JSONL file, validate each line against `experience_schema.json`, and ensure all `target` paths actually exist on disk (Fail-Open on missing).
- [ ] **Visualization:** Update `visualize_graph.py` to project state from the new `experience.jsonl` event log instead of the old JSON array.
- [ ] **Rename:** rename files to standard files, update relevant files accordingly:   
    1. BACKLOG.md (The Queue): The raw human intent. Unprocessed issues waiting to be picked up by the Planner. 
    2. ARCHITECTURE.md (The Kernel): The global, immutable laws of the project. Force-fed into every agent session.
    3. rules/*.md (The Page Table): Atomic, highly specific constraints (e.g., rules/react_state.md). They only exist to be injected when a relevant file is touched.
    4. coretext.jsonl (The MMU / Event Log): The mechanical routing ledger that binds the source code to the rules/.
    5. docs/ (The Standard Library): Static, objective truth. Swagger API definitions, database schemas, third-party interface contracts. 

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
1. **`ARCHITECTURE.md` (Generative Blueprint):** 
   - The map. It tells the agent what to do *right* initially (e.g., Folder structures, naming conventions). Prevents the "Cold Start" problem.
2. **`knowledge/*.md` (The Evolving Frontier / Case Law):** 
   - Atomic lessons extracted by the Reviewer. Passively injected via JSONL Event Log (`experience.jsonl`). Tells the Executor how to avoid previously encountered traps.
3. **Custom Linters (Restrictive Enforcement):** 
   - The electric fence. Invisible to the LLM's context window. Sits in the CI pipeline to physically block structural violations instantly (e.g., "Module A cannot import Module B"). Zero token cost.

### The D-SDD Rule Funnel
Your goal as the Human Orchestrator is to push knowledge down this funnel to minimize token cost and maximize determinism:
1. **Discovery:** Reviewer catches an error and writes `knowledge/*.md`. (High Token Cost: Injected as a passive hint).
2. **Formalization:** Synthesize global lessons into `ARCHITECTURE.md`. (Medium Token Cost: Read by Planner/Reviewer globally).
3. **Mechanization:** Convert the rule into a Custom Linter. (Zero Token Cost: Enforced by the compiler).
