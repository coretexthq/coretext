# Coretext Rule-Promotion Workflow

Use this workflow to extract, distill, and register architectural constraints, traps, or rules that emerge during a working session.

## Overview

After writing a session summary under `knowledge/ai/`, review whether any lessons or architectural constraints emerged that required an internal change in direction. To ensure these constraints are injected into future sessions when relevant codebase paths are touched, you must distill them directly into durable scope notes under `knowledge/` and register routing edges using the Coretext engine.

---

## 1. Audit & Clean Ledger (Pre-work)
Before registering new edges, check the integrity of the graph ledger:
1. **Lint the graph**: Check for schema issues or missing targets.
   ```bash
   uv run .coretext/lint_graph.py
   ```
2. **Prune invalid edges**: If the linter reports errors (such as targets pointing to non-existent nodes), run the graph cleaner script to automatically prune them:
   ```bash
   uv run .coretext/clean_graph.py
   ```

---

## 2. Durable Distillation
Instead of creating isolated, standalone rule files under `.coretext-data/rules/`, distill confirmed constraints directly into the relevant durable scope notes (or project MOC note if no specific scope note exists) in the `knowledge/` directory:
1. **Locate Target Note**: Find the relevant durable note under `knowledge/` (e.g. `knowledge/coretext.workflow.md`).
2. **Add/Update Rule Section**: Add the rule under a clearly designated section (e.g. `## Constraints` or under the topic's section) using the following format:
   - **Trigger**: The specific goal, pattern, or codebase area when the rule applies.
   - **Context**: The background, what was attempted, and the lesson learned.
   - **Axiom**: The hard architectural constraint/instruction to follow.

---

## 3. Register Routing (Add Edges)
Link the affected codebase source paths to the durable scope note containing the rules. This ensures the Coretext Kernel injects the context during future tasks.

Run the ledger script:
```bash
uv run .coretext/add_rules.py --source "<source>" --target "<target>" --type <full|hint> --description "<intent>" --hook <read|write|both>
```

Parameters:
- `--source`: Path to the source file or glob pattern (e.g. `src/api/auth.py`, `src/**/*.tsx`).
- `--target`: The relative path to the durable note under `knowledge/` containing the distilled rules (e.g., `knowledge/coretext.workflow.md`).
- `--type`: Must be `full` (inject full file text) or `hint` (inject title/path). `hint` is preferred for large durable notes to prevent context bloating, unless full-text injection is specifically needed.
- `--description`: Detailed intent or reason for the link (e.g. 'Use when modifying core workflows to align with D-SDD').
- `--hook`: `read`, `write`, or `both` (default). Specifies whether context is injected when reading, writing, or both.

---

## 4. Rule Deprecation & Ledger Schema

### Ledger Location
The event ledger is stored as a JSON Lines (JSONL) file under the workspace data directory:
`.coretext-data/{workspace_name}_rules.jsonl`

### Schema Transparency
Each entry in the `.jsonl` file must match the following JSON schema:
```json
{
  "source": "string (glob pattern or filepath to match, e.g. 'src/api/auth.py')",
  "target": "string (relative path to target note, e.g. 'knowledge/auth.workflow.md')",
  "type": "string ('hint' or 'full')",
  "description": "string (detailed intent of the link)",
  "hook": "string ('read', 'write', or 'both')"
}
```

### Manual Edge Deprecation / Deletion
Because the CLI helper `add_rules.py` only supports adding rules, removing or deprecating an edge must be done manually:
1. Open the `.coretext-data/{workspace_name}_rules.jsonl` file.
2. Find the JSON line matching the obsolete `source` and `target` edge you wish to remove.
3. Delete that line from the file.
4. Save the file.

---

## 5. Final Verification
Re-run `uv run .coretext/lint_graph.py` to ensure the newly added or updated ledger edges are valid and compile correctly.
