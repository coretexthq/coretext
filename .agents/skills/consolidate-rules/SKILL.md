---
name: consolidate-rules
description: Use ONLY after the code is fully reviewed and approved by the Code Reviewer to extract architectural lessons and mechanically link source code to relevant targets (rules, skills, architecture docs, or other files).
---

# Consolidate Rules & Knowledge Context

## Overview

When reviewing a Git Diff and reading the Executor's review request in `docs/superpowers/reviews/`, your final job (only after the milestone/feature is completely approved) is to ensure relevant context is injected in the future. You must look for new architectural lessons, traps, rules, or existing constraints that future agents should know about when editing the code.

You can extract lessons into new rule files in `docs/rules/`, OR you can link directly to existing target files (e.g., `.agents/skills/*`, `docs/ARCHITECTURE.md`, or related code files/folders). By mechanically linking them, the Coretext Kernel will force-feed them to the next agent interacting with your source code.

## Step 1: Prepare the Target Context (If Applicable)

**If you are creating a new rule:**
Create a new file in `docs/rules/<topic>.md`.
ALWAYS populate it using the exact template located at `.agents/skills/consolidate-rules/rules_template.md`. Use the `view_file` tool to read the template if you are unfamiliar with it.

**If you are linking to existing knowledge/code:**
Identify the relevant target file or folder (e.g., `docs/ARCHITECTURE.md`, `.agents/skills/test-driven-development/SKILL.md`, or a related module) that provides necessary context for modifying the source.

## Step 2: Link to the Coretext Graph

You MUST register this rule/link into `.coretext/coretext.jsonl` using the provided script so the Coretext Kernel can inject it in the future.

```bash
python .coretext/add_rules.py --source "<source>" --target "<target>" --type <full|hint> --description "<intent>" --hook <read|write|both>
```

- `--source`: The path to the source file or glob pattern (e.g., `src/api/auth.py`, `src/**/*.tsx`).
- `--target`: The path to the target file/folder to link (e.g., `docs/rules/bcrypt_rounds.md`, `docs/ARCHITECTURE.md`, `.agents/skills/*`, or any code file).
- `--type`: Must be `full` (mandatory full-text injection) or `hint` (inject title/path so the agent can read later).
- `--description`: The agent's detailed reasoning or intent for the link (e.g., 'use', 'Ensure state management follows architectural guidelines'). Used to provide context regarding why this link exists in the injection payload.
- `--hook`: Optional. Must be `read`, `write`, or `both` (default). Specifies whether the context is injected when reading, writing, or both.

*(If the script returns a schema validation error, read the error message, correct your parameters, and try again. You must do this for every source file that the context applies to.)*