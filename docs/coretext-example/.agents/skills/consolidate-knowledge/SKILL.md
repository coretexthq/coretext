---
name: consolidate-knowledge
description: Use during code review (after spec-compliance-review and code-quality-review) to extract architectural lessons and mechanically link them to source code files.
---

# Consolidate Knowledge

## Overview

When reviewing a Git Diff and reading the Executor's `docs/handoffs/*` document, your most important job is to look for new architectural lessons, traps, or rules that future agents should know about. 

If you find a lesson, you extract it to `knowledge/` and mechanically link it to the source code file using the Coretext Experience Engine. This ensures that the next time an agent reads that source file, the Coretext Kernel will force-feed them your lesson.

## Step 1: Write the Knowledge File

Create a new file in `knowledge/<topic>.md`.
ALWAYS use this exact template:

```markdown
# [Short Title]

**Trigger:** [The Spec/Goal that triggered this]

## Context
[What was attempted by the Executor, based on their handoff report]

## Axiom
[The hard architectural rule extracted, e.g., "Always use in-memory SQLite for tests." or "Never use useState for URL filters."]

## Linked Files
- [List the source files this rule applies to]
```

## Step 2: Link to the Experience Graph

You MUST register this new knowledge file into `experience.json` so the Coretext Kernel can inject it in the future.

Run the Experience Engine API script from the terminal:
```bash
python docs/coretext-example/add_knowledge.py --source <path/to/src_file> --target knowledge/<topic>.md --type knowledge
```

- `--source`: The path to the source code file (e.g., `src/api/auth.py`).
- `--target`: The path to the knowledge file you just created (e.g., `knowledge/bcrypt_rounds.md`).
- `--type`: Must be `knowledge`.

If the script returns a schema validation error, read the error message, correct your parameters, and try again. 
You must do this for every source file that the new rule applies to.
