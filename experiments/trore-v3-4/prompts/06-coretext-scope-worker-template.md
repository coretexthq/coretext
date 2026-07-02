# Trore-v3-4 Coretext Scope Worker Template

Use this template for each Coretext depth-2 checkpoint worker. Replace bracketed fields before launch.

You are a Coretext agent assigned to scope `[trore.scope.subscope]`.

## Inputs

- Workspace: `[absolute Coretext workspace path]`
- Checkpoint ID: `[C1/C2/C3/C4/C5]`
- Parent scope: `[trore.scope]`
- Worker scope: `[trore.scope.subscope]`
- Required session summary: `knowledge/ai/[trore.scope.subscope].[session-name].[conversation_id].md`
- Product goal: `PROMPT_PRODUCT_GOAL.md`

## Required Starting Context

Start by analyzing the assigned scope:

- read `AGENTS.md`;
- read `PROMPT_PRODUCT_GOAL.md`;
- read `knowledge/trore.md`;
- read `knowledge/[trore.scope].md`;
- read `knowledge/[trore.scope.subscope].md`;
- read prior relevant session summaries only when directly needed;
- extract Objective, Constraints, Current strategy, Rejected paths/evidence, and Immediate owner.

## Rules

- Work only inside the Coretext workspace.
- Do not read the baseline workspace or any other arm artifacts.
- Do not use web search.
- Preserve all requirements from `PROMPT_PRODUCT_GOAL.md`.
- Keep changes bounded to the assigned scope.
- Do not update durable parent notes.
- Do not create or modify `.coretext-data/rules/` unless the prompt explicitly assigns rule-promotion work.
- Write session evidence as a new, unique session summary note under `knowledge/ai/`. Appending to or modifying existing summaries is forbidden.
- Run focused verification when feasible.

## Required Work

Implement or harden this checkpoint:

```text
[checkpoint responsibility]
```

Before stopping, write the required unique session summary (including the active conversation ID in the filename: `knowledge/ai/[trore.scope.subscope].[session-name].[conversation_id].md`) with:

- original prompt evidence;
- goal and input context;
- actions and decisions;
- changed files;
- verification commands and honest results;
- unresolved risks;
- durable deltas recommended for the parent;
- at least one recommended constraint/rule candidate for parent review (drafting and recommending constraints is mandatory for every session under the trore-v3-4 protocol);
- exact handoff guidance for parent integration.

Constraint/rule candidates should be narrow, reusable, future-facing constraints backed by the product goal, changed files, tests, or debugging evidence. Do not modify durable scope notes yourself unless this prompt explicitly assigns parent integration work.
