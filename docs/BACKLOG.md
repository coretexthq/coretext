# Backlog

## Now

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


