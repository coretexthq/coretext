# Status
- Coretext is currently a file-centric, deterministic context-routing repo built around `.coretext/`, `docs/`, and `docs/rules/`.
- The live runtime lives in `.coretext/coretext_engine.py`, `inject_context.py`, `add_rules.py`, `notify_action.py`, and `visualize_graph.py`.
- The active ledger is the append-only `.coretext/{workspace}.jsonl` graph, validated by `.coretext/coretext_schema.json`.
- The hidden Vite dashboard in `.coretext/coretext-graph-ui/` visualizes graphs, selected sessions, and highlighted nodes.
- `setup_coretext.sh` installs the hidden dashboard and Python package, while `sync_coretext.sh` mirrors the engine, README, Gemini settings, and core skill into `coretext_package/`.

# Backlog
- better integration with git/github via skills (github/awesome-copilot)
	- maybe for now issue = commit (code is cheap), actual commit is within the conversation
- Implement hook mechanism for [[Antigravity]] and [[Codex]]
- a linter to check the validity of the graph
- [[coretext.architecture|Sandboxing Coretext]]
- Implement static context enforcement:
	- **PreTool stateless regex:** Fast routing table for injecting hot/cold memory tiers.
	- **PostTool mechanization:** Hook-based runtime enforcement.
	- Source: https://github.com/andrewpat24/blog/blob/main/src/data/blog/agent-convention-enforcement.md
- Rule Lifecycle (Human Reference)
	- `docs/ARCHITECTURE.md` (Generative Blueprint) -> `docs/rules/*.md` (The Evolving Frontier / Case Law) -> Custom Linters (Restrictive Enforcement)
	- **Discovery:** Reviewer catches an error and writes `docs/rules/*.md` (Low Token) -> **Formalization:** Synthesize global lessons into `docs/ARCHITECTURE.md`(Medium Token) -> **Mechanization:** Convert the rule into a Custom Linter (Zero Token)
- **Testing:** Define project-specific physics in `docs/testing.md`
- **Diff-Based Injection:** Update `inject_context.py` to inject knowledge based on `git diff --name-only` so the Reviewer gets context for modified files.
- **Schema & Path Linter:** Write a script (`lint_experience.py`) to run as a pre-commit hook. It must parse the JSONL file, validate each line against `experience_schema.json`, and ensure all `target` paths actually exist on disk (Fail-Open on missing).
- **AST Enforcement:** Research/implement AST patch mechanisms instead of raw text output.
- **Sandboxing:** Implement isolated, ephemeral Nix/Docker environments for Executor.
- **Property-Based Testing:** Refactor the Planner's testing axioms to generate property-based tests (Hypothesis/fast-check).
- **Cryptographic Intent Hashing:** Hash target states/atomic steps to commit metadata for traceability.

# Log
- [[coretext.dev|Development Strategy]]: Git Submodule Triangle Architecture and company/dev environment bootstrapping.
- [[coretext.architecture|Architecture]]: Deterministic routing, fnmatch matching, and the virtual MMU model.
- [[coretext.dsdd|D-SDD]]: Planner, executor, reviewer, and the current artifact flow.
- [[coretext.memory|Memory]]: Session traces, backend-agnostic sync, and durable rule extraction.
- [[coretext.dashboard|Dashboard]]: Graph selection, session highlights, and visual feedback.
- [[coretext.evoclaw|EvoClaw]]: Auth recovery and trial setup.
- [[coretext.benchmarking|Benchmarking]]: Validation tracks and experiment notes.
- [[coretext.performance|Performance]]: Targeted subgraph hydration and JIT context injection.
- [[coretext.context|Context]]: Agent-context routing and path normalization.

## Resource
[[coretext.resource]]
[[coretext.canvas]]
**Gemini CLI**
```bash
cd ~/Git/coretext && gemini -m gemini-3.1-pro-preview --include-directories ~/Git/knowledge/project/coretext
```
**Antigravity CLI**
```bash
cd ~/Git/coretext && agy --add-dir ~/Git/knowledge/project/coretext
```
**Codex CLI**
```bash
cd ~/Git/coretext && codex --add-dir ~/Git/knowledge/project/coretext
```



