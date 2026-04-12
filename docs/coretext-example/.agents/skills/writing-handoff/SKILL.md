---
name: writing-handoff
description: Use when finishing execution of tasks (TDD) to document your technical journey, decisions, and any blockers into a handoff file.
---

# Writing Coretext Handoff

## Overview

When you finish implementing a step (whether successful or blocked by an architectural paradox), you must document your journey for the Reviewer agent. The Reviewer relies on this handoff to understand *why* you made certain technical decisions. This context is what allows the Reviewer to extract meaningful architectural lessons to prevent future agents from making the same mistakes.

## The Handoff Document

Create a new handoff document in `docs/handoffs/YYYY-MM-DD-handoff-<feature>.md`.

ALWAYS use this exact template:

```markdown
# Execution & Audit Report

## 1. Executor Report
- **Tests Passed:** [Yes/No]
- **Modified:** [List of files modified]
- **Exceptions / Blockers:** [If you had to halt due to an architectural paradox, explain it here. Otherwise, write "None".]

## 2. Technical Journey & Decisions
- **Why I did what I did:** [Explain the struggles, alternative approaches considered, and why the final approach was chosen. Be specific about the code.]
```

## Instructions

1. Use the `write_file` tool to create the handoff file.
2. Fill out all the sections completely based on your execution process.
3. Once the file is written, your execution phase for this atomic step is complete.
