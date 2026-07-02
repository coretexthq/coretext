# Trore-v3-4 Coretext Experiment Package

This directory is a reusable overlay for the Coretext-assisted arm of the Trore-v3-4 case study. It is not the Coretext engine installer and it does not run the experiment.

The upgraded Trore-v3-4 protocol is fixed multi-session work. The overlay provides the Coretext operating contract and hooks; the prompt pack provides the mandatory coordinator, scope-worker, and parent-integration roles.

## Contents

- `AGENTS.md`: the packaged Coretext operating contract for project, scope, session, and delegated work. It is derived from `docs/coretext_agent_instruction.md` with targeted Trore-v3-4 fixes for durable-note separator templates, wikilink hygiene, and mandatory experiment-mode delegation.
- `.codex/config.toml` and `.codex/hooks.json`: Codex hooks enabled for Coretext lineage, context, write-gating, and telemetry.
- `.agents/hooks.json`: Antigravity hooks enabled for Coretext lineage, write-gating, and telemetry.
- `knowledge/` and `knowledge/ai/`: empty seed directories for durable notes and session summaries.
- `.coretext-data/`: empty seed directories for route ledgers, rules, and telemetry.
- `setup.sh`: a safe overlay helper for a fresh target repository that already has the Coretext engine installed. It moves any pre-existing `.agents/skills/` directory to `.agents/skills.pre-trore-v3-4` so the experiment starts without active agent Skills.

No `.agents/skills/` directory is included in this experiment package, and the overlay disables any pre-existing active skill directory by moving it aside with a backup name.

## Overlay Workflow

1. Create or reset the fresh target repository for the Coretext arm.
2. Install the Coretext engine first using the existing Coretext setup path for the copied engine package. The target repository must contain `.coretext/` before this overlay is applied.
3. Apply this overlay:

```bash
bash /path/to/coretext/experiments/trore-v3-4/package/setup.sh /path/to/target-repo
```

The overlay helper installs the frozen root instruction file, enabled runtime hook configs, seed directories, and a `.coretext-data/<target-repo-name>_rules.jsonl` ledger placeholder.

## Runtime Notes

- Codex hooks are enabled in `.codex/config.toml`, but Codex may still require trusting project-local hooks through its normal hook review flow.
- Antigravity hook definitions are enabled in `.agents/hooks.json`, but Antigravity may still require the workspace to allow project-local hooks.
- The package intentionally starts with no project-specific route edges, no product-goal note, and no run transcript. Those belong to the experiment start procedure, not this reusable environment package.
- The Coretext arm must use the fixed scope tree defined by `case-study/methodology.md`: `trore.foundation` (flat), `trore.renter` (flat), `trore.operations` (parent) with children `trore.operations.host` and `trore.operations.booking`, and `trore.integration` (flat), with parent integration at the direct scope layer.

## What This Does Not Do

- It does not install Coretext through a git submodule.
- It does not copy an agent skill directory.
- It does not define the final Trore-v3-4 product prompt.
- It does not run the baseline or Coretext arm.
- It does not claim evaluation results.

## Quick Checks After Overlay

From the target repository root:

```bash
test -d .coretext
python3 -m json.tool .codex/hooks.json >/dev/null
python3 -m json.tool .agents/hooks.json >/dev/null
uv run .coretext/lint_graph.py
```

The linter should fail open or pass with an empty ledger before route edges are added.
