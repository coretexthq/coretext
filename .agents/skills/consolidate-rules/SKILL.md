---
name: consolidate-rules
description: Use ONLY after the code is fully reviewed and approved by the Code Reviewer to extract architectural lessons and mechanically link them to source code files.
---

# Consolidate Rules

## Overview

When reviewing a Git Diff and reading the Executor's review request in `docs/superpowers/reviews/`, your final job (only after the milestone/feature is completely approved) is to look for new architectural lessons, traps, or rules that future agents should know about. 

If you find a lesson, you extract it to `docs/rules/` and mechanically link it to the source code file using the Coretext Engine. This ensures that the next time an agent reads that source file, the Coretext Kernel will force-feed them your lesson.

## Step 1: Write the Rule File

Create a new file in `docs/rules/<topic>.md`.
ALWAYS use this exact template (located at `.agents/skills/consolidate-rules/rules_template.md`):

```markdown
# [Short Title]

**Trigger:** [The Spec/Goal that triggered this]

## Context
[What was attempted by the Executor, based on their review request]

## Axiom
[The hard architectural rule extracted, e.g., "Always use in-memory SQLite for tests." or "Never use useState for URL filters."]

## Linked Files
- [List the source files this rule applies to]
```

## Step 2: Link to the Coretext Graph

You MUST register this new rule file into `.coretext/coretext.jsonl` (or via the provided add-rules script) so the Coretext Kernel can inject it in the future.

If a CLI script is provided for linking (e.g., `python docs/coretext-example/add_rules.py`), use it:
```bash
python docs/coretext-example/add_rules.py --source <path/to/src_file> --target docs/rules/<topic>.md --type rule
```

- `--source`: The path to the source code file (e.g., `src/api/auth.py`).
- `--target`: The path to the rule file you just created (e.g., `docs/rules/bcrypt_rounds.md`).
- `--type`: Must be `rule`.

*(If the script returns a schema validation error, read the error message, correct your parameters, and try again. You must do this for every source file that the new rule applies to.)*

If you are instructed to edit `.coretext/coretext.jsonl` manually, append a JSON object linking the source path/pattern to the newly created rule file.