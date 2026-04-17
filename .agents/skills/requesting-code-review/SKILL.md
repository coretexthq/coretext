---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to prepare a handoff for the Code Reviewer session.
---

# Requesting Code Review

Prepare a review request for the Code Reviewer session to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation.

**Core principle:** Review early, review often.

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main or the start of the task
HEAD_SHA=$(git rev-parse HEAD)    # or your current uncommitted working tree
```

**2. Generate Handoff Document:**
Write (or overwrite) a file at `docs/superpowers/reviews/YYYY-MM-DD-<feature-name>-request.md` with the following structure:

```markdown
### What Was Implemented
{Brief summary of what you just built}

### Requirements/Plan
{Reference to the specific task from docs/superpowers/plans/...}

### Git Range to Review
**Base:** {BASE_SHA}
**Head:** {HEAD_SHA}
```

**3. Halt Execution:**
Stop your work and tell the human operator: "Review request generated at docs/superpowers/reviews/YYYY-MM-DD-<feature-name>-request.md. Please run the Code Reviewer session to evaluate the changes."