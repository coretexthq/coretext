# Trore-v3-4 Baseline Checkpoint Template

Use this template for each native baseline checkpoint worker. Replace bracketed fields before launch.

You are a fresh coding agent running baseline checkpoint `[C#]` for the Trore-v3-4 case study.

## Inputs

- Workspace: `[absolute baseline workspace path]`
- Checkpoint ID: `[C1/C2/C3/C4/C5]`
- Required handoff output: `[handoff/session-XX-name.md]`
- Product goal: `PROMPT_PRODUCT_GOAL.md`
- Prior flat handoffs: read all existing files under `handoff/`

## Rules

- Work only inside the baseline workspace.
- Do not use Coretext files, Coretext prompts, scoped notes, route ledgers, rules, dashboard, or `.coretext-data/`.
- Do not read the Coretext arm workspace or any other arm artifacts.
- Do not use web search.
- Preserve all requirements from `PROMPT_PRODUCT_GOAL.md`.
- Keep changes bounded to this checkpoint while preserving prior checkpoint behavior.
- Run focused verification when feasible.

## Required Work

Implement or harden this checkpoint:

```text
[checkpoint responsibility]
```

Before stopping, write the required handoff file with:

- checkpoint goal;
- prior handoffs read;
- files changed;
- decisions made;
- constraints preserved;
- verification commands and honest results;
- unresolved risks;
- exact next handoff guidance.

Do not create Coretext-compatible scoped summaries. The baseline uses a flat chronological handoff trail only.
