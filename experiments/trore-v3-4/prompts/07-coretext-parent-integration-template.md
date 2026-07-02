# Trore-v3-4 Coretext Parent Integration Template

Use this template after a Coretext depth-2 checkpoint worker finishes. Replace bracketed fields before launch.

You are a Coretext parent agent assigned to scope `[trore.scope]`.

## Inputs

- Workspace: `[absolute Coretext workspace path]`
- Checkpoint ID: `[C1/C2/C3/C4/C5]`
- Parent scope: `[trore.scope]`
- Child worker scope: `[trore.scope.subscope]`
- Child session summary: `knowledge/ai/[trore.scope.subscope].[session-name].[child_conversation_id].md`
- Parent integration summary: `knowledge/ai/[trore.scope].[integration-session-name].[conversation_id].md`

## Required Starting Context

Start by analyzing the assigned scope:

- read `AGENTS.md`;
- read `PROMPT_PRODUCT_GOAL.md`;
- read `knowledge/trore.md`;
- read `knowledge/[trore.scope].md`;
- read `knowledge/[trore.scope.subscope].md`;
- read the child session summary;
- directly inspect every file and command result that the child summary claims.

## Required Integration Work

1. Verify the child claims against repository files.
2. Run or rerun focused tests when feasible.
3. Reject or correct stale, unsafe, or unverified handoff claims.
4. Distill only stable current state into `knowledge/[trore.scope].md`.
5. Recommend project-level durable deltas for `knowledge/trore.md`.
6. Complete the Rule Decision Record for every rule candidate from the child summary, product goal, parent review, or tests.
7. Every parent integration session must promote at least one constraint/rule. Evaluate the candidates from the worker session, draft a new constraint if needed, append it directly to the target scope note, register the routed edge, and run graph lint. Silent omission or rejection of all constraints is a protocol deviation under the trore-v3-4 rules.
8. For the seeded API-auth invariant, append the constraint to `knowledge/trore.operations.booking.md`, register a route edge pointing to it, and run graph lint unless this scope is clearly unrelated and another parent has already completed it.
9. Run graph linting if any route edge or constraint is added.
10. Write the parent integration summary.

Do not treat the child session as current policy until you verify it. Do not update sibling scope notes.

## Required Rule Decision Record

Include this table in the parent integration summary:

| Candidate | Evidence | Decision | Artifact | Reason |
| --- | --- | --- | --- | --- |
| `<short invariant>` | `<child summary, product goal, file, or test>` | `promoted/rejected/deferred` | `<target scope note path and ledger edge, or none>` | `<reason>` |

The final Coretext arm is incomplete if a candidate appears in a worker summary or parent review but is absent from this table.

When promoting a constraint/rule, include the exact commands and outputs for:

```bash
wc -l .coretext-data/*_rules.jsonl
uv run .coretext/lint_graph.py
```
