# Coretext

Coretext is a lightweight, event-sourced, and file-native context-routing and lifecycle review engine for AI coding agents. 

Rather than relying on prompt-heavy frameworks or external databases that introduce deployment complexity and synchronization latency, Coretext runs locally inside your repository. It intercepts tool call events from AI agent runtimes (such as Codex and Antigravity) to passively inject relevant context, enforce safety constraints, and track execution telemetry.

---

## Philosophy & Core Principles

1. **File-Native Authority:** All configurations, rules, and event logs are stored as plaintext Markdown and JSON Lines (JSONL) files in the repository. Standard Git operations serve as the transport, versioning, and merging layers.
2. **Deterministic Control Shell:** A strict software boundary written in pure Python manages glob matching, write gating, and lineage injection, preventing probabilistic LLM planning from bypassing global architectural guidelines.
3. **Index-Light Retrieval:** Employs fast linear matching over append-only ledgers, preserving normal repository search and LSP tools without database setup or synchronization latency.
4. **Platform Portability:** Decouples project-specific rules from runtime-specific environments by normalizing hook payloads across different agent platforms.

---

## Key Capabilities & Features

### 1. Deterministic Context Routing
Coretext maps file paths to relevant documentation, guidelines, or constraints using pure Python `fnmatch` glob pattern matching. When an agent accesses a file, the routing engine:
- Reads active matching rules from the append-only event log (`.coretext-data/{workspace_name}_rules.jsonl`).
- Matches the accessed path against the `source` glob patterns in the ledger.
- Injects context in one of two modes defined by the matching edge:
  - `full`: Hydrates the complete text of target rules directly into the agent's context window.
  - `hint`: Delivers a compact description or outline to guide the agent without consuming token space.

### 2. Write-Gate Finite State Machine (FSM)
To prevent agents from making code edits that violate architectural boundaries, Coretext implements a write-gate:
- When an agent attempts to write or edit a file governed by a strict ledger rule, the runtime hook adapter intercepts the command and returns a `deny` response.
- The response returns the matched architectural constraints directly to the agent's reasoning loop.
- The agent must acknowledge the rule; a subsequent write attempt in the same session is allowed to proceed.

### 3. Note Lineage Injector
When an agent reads a hierarchical documentation note (using dot-separated names), the lineage builder injects ancestor and sibling notes. This ensures that the agent is aware of adjacent scopes and boundaries without loading the entire content of every note.

### 4. Git Subtree & Remote Memory Transport
Coretext manages repository-local rule packages and documentation folders via `git subtree`:
- **Subtree Synchronization:** `sync-subtree.sh` coordinates squashed, bidirectional synchronization between the local codebase and a target repository. Squashing keeps codebase commits clean.
- **Personal Private Fork Dual-Remote Mapping:** Developers can map codebase updates to a public repository while keeping proprietary agent logs, sessions, and custom rules synced to a private fork.
- **Local Git Hooks:** Installs pre-configured git hooks (like `pre-push` privacy guards or `pre-commit` validation) to prevent leaking private traces.

### 5. Transcript Processing & Telemetry
To audit agent behavior, Coretext processes conversation logs:
- `ingest_transcript.py` converts raw Codex or Antigravity transcripts into a standardized shape mapping conversation UUIDs to touched file paths.
- Action logs are stored in `.coretext-data/sessions/{session_id}.jsonl`.
- These normalized action histories are mapped back to human-authored session summaries via frontmatter UUIDs, feeding the visualization dashboard.

---

## Repository Structure

```
coretext/
├── .agents/                 # Antigravity hook templates and skill metadata
├── .codex/                  # Codex hook templates and configurations
├── .coretext/               # Python engine core and CLI utilities
│   ├── coretext_engine.py   # Matcher, schema validator, and rule adder
│   ├── runtime_hook_adapter.py # Cross-platform lifecycle hook normalizer
│   ├── note_hierarchy.py    # Namespace parser and lineage builder
│   ├── ingest_transcript.py # Conversation log normalization utility
│   ├── lint_graph.py        # Graph schema and target file auditor
│   ├── clean_graph.py       # Orphaned and dead-rule cleanup tool
│   ├── coretext-graph-ui/   # React/Vite dashboard & Express backend
│   └── visualize_graph.py   # Mermaid diagram exporter
├── docs/                    # Technical specification documents
├── tests/                   # Pytest test suite for all engine modules
├── package.sh               # Compiles and flattens a clean distribution
├── setup.sh                 # Environment initialization script
├── sync-subtree.sh          # Git subtree synchronization pipeline script
└── pyproject.toml           # Python packaging configuration
```

---

## Installation & Setup

### Prerequisites
- Node.js (for running the dashboard UI)
- Python >= 3.8

### 1. Development Mode (Local Repository)
Run the setup script at the root of the project to initialize virtual environments, configure dependencies, and install the local git hooks:
```bash
./setup.sh
```
If you use `uv` (recommended), this runs `uv sync`. Otherwise, it creates a standard Python virtual environment, activates it, and installs the package in editable mode:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 2. Submodule Integration (Host Project)
To add Coretext to another codebase as a submodule:
1. Add the submodule under `.coretext/`:
   ```bash
   git submodule add <repository-url> .coretext
   ```
2. Run the submodule installer:
   ```bash
   bash .coretext/setup.sh
   ```
This automatically detects submodule mode and:
- Copies configuration templates to `.agents/` and `.codex/`.
- Initializes the `.coretext-data/` workspace directory.
- Installs the python package in editable mode (`uv pip install -e .coretext` or `pip install -e .coretext`) to keep the host root clean.

### 3. Packaging for Distribution
To compile a clean, telemetry-free distribution mirror of the Coretext engine, run:
```bash
./package.sh
```
This output is written to the `./package/` directory (ignored by Git).

---

## Usage

### Running CLI / Engine Scripts
Coretext provides several utilities for interacting with the engine. It is recommended to run these using `uv run`:

- **Audit & Lint the Route Ledger:**
  ```bash
  uv run .coretext/lint_graph.py
  ```
- **Clean Orphaned Ledger Edges:**
  ```bash
  uv run .coretext/clean_graph.py
  ```
- **Append a New Rule Edge:**
  ```bash
  uv run .coretext/add_rules.py --source <source-glob> --target <target-file> --type <hint|full> --hook <read|write|both> --description "Description"
  ```
- **Simulate Context Injection for a Path:**
  ```bash
  uv run .coretext/inject_context.py <filepath> <read|write|both>
  ```
- **Process Conversational Logs:**
  ```bash
  uv run .coretext/ingest_transcript.py <transcript-file>
  ```

### Interactive State Dashboard
To launch the React flow dashboard and visualizer:
```bash
cd .coretext/coretext-graph-ui
npm run start
```
This runs the local API server and serves the dashboard, allowing you to visually inspect route matching, note lineages, and active session telemetries.

### Runtime Hook Integrations
Coretext hooks run passively behind the scenes. They intercept agent tools and normalize context:

- **Antigravity Hook Configuration:** Configured under `.agents/hooks.json`. Enables lineage-injections, write-guards, and telemetry hooks on the platform.
- **Codex Hook Configuration:** Configured under `.codex/hooks.json` and enabled via `.codex/config.toml` (`[features].hooks = true`).

> [!WARNING]
> **Sandbox Execution Warning:** When agents run inside a secure sandbox (such as Antigravity's default environment), calling `uv run` in your hook configuration may crash silently because `uv` attempts to access its global cache (`~/.cache/uv`), which is blocked by the sandbox.
> 
> To ensure your hooks run reliably inside sandboxed environments without triggering security blocks, invoke the virtual environment's Python binary directly using relative paths from the hook's execution directory. For example, in `.agents/hooks.json`, use:
> `"command": "../.venv/bin/python ../.coretext/inject_context.py"`

*Note: Execution requires that you trust the project-local hook configurations within your respective agent runtime environment.*

### Validating Hook Injections (The Echo Test)
Because `PreInvocation` context injections are dynamically inserted into the agent's live memory, they are not saved in persistent conversation logs. You can validate that the hooks are enabled and successfully injecting context using the "Echo Test".

1. **Check the local state files:** Whenever an agent reads a mapped note (e.g., `knowledge/coretext.scope.md`), the `PreToolUse` hook queues it, and the `PreInvocation` hook delivers it. If successful, you will see the path appended to the `.coretext-data/.lineage_seen_{session_id}` file.
2. **Prompt the agent to echo:** You can verify the agent received the context by explicitly prompting it in a new conversation: 
   *"Please use `view_file` to read `knowledge/coretext.scope.md`. Immediately after you read it, check your internal system context. You should receive a hidden ephemeral message starting with 'Note lineage:'. Please print the exact contents of that message back to me."*

### Git Subtree Sync
To run the bidirectional subtree sync pipeline:
```bash
bash sync-subtree.sh <codebase-dir> <vault-dir> sync [project-name]
```

---

## Testing

The codebase includes an extensive validation test suite under `tests/`. Run all test contracts using `pytest`:
```bash
uv run pytest
```
The test suite covers:
- **`test_engine.py`:** Evaluates glob pattern matching, schema validation, and route resolution.
- **`test_runtime_hooks.py`:** Validates cross-platform payload normalization, `RuntimeHookRequest` structures, and the Write-Gate FSM transitions.
- **`test_note_hierarchy.py`:** Checks hierarchy builder accuracy and lineage output generation.
- **`test_linter.py`:** Audits graph linter and cleaner utilities against mock databases and orphaned assets.
- **`test_dashboard.py`:** Verifies backend API routing and derived visual highlights.
