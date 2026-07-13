---
name: coretext
description: Use after writing a session summary to extract architectural lessons/rules that emerged during conversation that needed an internal change in direction and are not included in stable project scope notes.
---

# Coretext Rules & Knowledge Context

## Overview

After writing an AI session summary, your job is to review if any architectural lessons, traps, constraints, or rules emerged during the conversation that required an internal change in direction (which are not already captured in the stable project scope or sub-scope notes). 

You must look for these lessons to ensure relevant context is injected for future agents. You can extract these lessons into new rule files in `.coretext-data/rules/`, OR you can link directly to existing target files (e.g., `docs/ARCHITECTURE.md` or other files/folders). By mechanically linking them, the Coretext Kernel will inject them when future agents interact with the source code.

## Step 0: Validate & Clean Up Graph (Pre-work)

Before adding new rules or registering new edges, you must check the integrity of the existing Coretext graph ledger and clean up any non-existent edges (e.g. referencing deleted files) or identify standalone rules:

1. **Lint the graph:**
   Run the graph linter to identify schema issues, missing targets, or standalone rules (rules without graph edges):
   ```bash
   uv run .coretext/lint_graph.py
   ```
2. **Clean invalid edges:**
   If the linter reports errors (such as targets pointing to non-existent nodes), run the graph cleaner script to automatically prune them:
   ```bash
   uv run .coretext/clean_graph.py
   ```
3. **Be aware of standalone rules:**
   Review the linter's warnings about standalone rule files in `.coretext-data/rules/` that are not targeted by any edges. Consider whether you should add edges for these rules, or delete them if they are no longer relevant, before adding new rules.

## Step 1: Prepare the Target Context (If Applicable)

**If you are creating a new rule:**
Create a new file in `.coretext-data/rules/<topic>.md`.
ALWAYS populate it using the exact template located at `.agents/skills/coretext/rules_template.md`. You MUST include the YAML frontmatter specifying the path of the AI session note this rule was created from (e.g., `session: knowledge/ai/coretext.dashboard.features.md`). Use the `view_file` tool to read the template if you are unfamiliar with it.

**If you are linking to existing knowledge/code:**
Identify the relevant target file or folder (e.g., `docs/ARCHITECTURE.md` or a related module) that provides necessary context for modifying the source.

## Step 2: Link to the Coretext Graph

You MUST register this rule/link into `.coretext-data/{workspace}_rules.jsonl` using the provided script so the Coretext Kernel can inject it in the future.

```bash
uv run .coretext/add_rules.py --source "<source>" --target "<target>" --type <full|hint> --description "<intent>" --hook <read|write|both>
```

- `--source`: The path to the source file or glob pattern (e.g., `src/api/auth.py`, `src/**/*.tsx`).
- `--target`: The path to the target file/folder to link (e.g., `.coretext-data/rules/bcrypt_rounds.md`, `docs/ARCHITECTURE.md`, or any code file).
- `--type`: Must be `full` (mandatory full-text injection) or `hint` (inject title/path so the agent can read later).
- `--description`: The agent's detailed reasoning or intent for the link (e.g., 'use', 'Ensure state management follows architectural guidelines'). Used to provide context regarding why this link exists in the injection payload.
- `--hook`: Optional. Must be `read`, `write`, or `both` (default). Specifies whether the context is injected when reading, writing, or both.

*(If the script returns a schema validation error, read the error message, correct your parameters, and try again. You must do this for every source file that the context applies to.)*