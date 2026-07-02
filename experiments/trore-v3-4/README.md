# Trore-v3-4 Evaluation Packet

Trore-v3-4 is the next-run case-study packet for Coretext. It packages the methodology, prompts, Coretext-arm environment overlay, and dashboard-backed audit forms needed to rerun the Trore case study with stronger rule-enforcement gates.

Do not overwrite `experiments/trore-v3/`. That directory is completed historical evidence, including the upgraded multi-session run that exposed the empty rule-ledger failure. Future reruns must use `experiments/trore-v3-4/` or another new `experiments/trore-v3-*` directory.

## Packet Map

- `case-study/`: paired baseline/Coretext case-study protocol and the seeded `knowledge/trore.md` project note template.
- `prompts/`: frozen product, baseline coordinator, Coretext coordinator, checkpoint templates, reviewer audit, and recovery probe prompts.
- `package/`: overlay for the Coretext-assisted arm after the Coretext engine is installed in a fresh target repository.
- `audit/`: frozen final-artifact questionnaire, evidence checklist, scoring rubric, and dashboard/session-history review procedure.

## Execution Boundary

This packet contains protocol material only. It intentionally excludes prior build workspaces, prior audit reports, `node_modules`, recovery outputs, and completed run artifacts.

The demonstration case study compares a native baseline arm against a Coretext-assisted arm on the same Trore product goal. Start with `case-study/methodology.md`.

## Changes From Trore-v3

- Rule promotion is no longer a vague optional outcome. Every Coretext parent integration must complete a rule-decision gate: promote, route, and lint each qualifying reusable constraint, or explicitly reject it with evidence.
- The Coretext arm must exercise at least one seeded product invariant as a promoted rule/route edge unless the run records a protocol deviation.
- Final Coretext reports must include real filesystem and command evidence for rule files, ledger line counts, graph lint output, and telemetry/dashboard availability.
- Claims about cost are bounded. Trore-v3-4 may report elapsed time, turns, tool calls, token counts, session counts, and parent-integration overhead, but it must not claim equal-cost superiority unless those quantities are controlled or normalized.

## Operator Flow

1. Read `prompts/00-product-goal.md` and `case-study/methodology.md`.
2. Prepare two fresh target repositories from the same starting state.
3. For the Coretext arm, install the Coretext engine first, then apply `package/setup.sh`.
4. Seed the Coretext arm with `case-study/seeded-coretext-project-note.md` as `knowledge/trore.md`.
5. Run the native baseline coordinator with `prompts/01-baseline-init.md`.
6. Run five native baseline checkpoints with `prompts/05-baseline-checkpoint-template.md`, producing `handoff/session-*.md`.
7. Run the Coretext project coordinator with `prompts/02-coretext-init.md`.
8. Run five Coretext depth-2 workers with `prompts/06-coretext-scope-worker-template.md`, then parent integrations with `prompts/07-coretext-parent-integration-template.md`.
9. Export session histories, collect repository artifacts, and inspect dashboard/session traces using `audit/`.
10. Run the frozen reviewer audit prompt from `prompts/03-reviewer-audit.md`.
11. Run the recovery/resume probe from `prompts/04-recovery-resume-probe.md`.
12. Report results with the claim boundary from `knowledge/coretext.evaluation.case-study.md`: reusable context, feasibility, and inspectability, not universal performance superiority.

## Package Notes

The Coretext-arm overlay package intentionally includes no `.agents/skills/` directory. It uses a root `AGENTS.md` operating contract, enabled Codex and Antigravity hook configs, empty knowledge/session directories, and empty Coretext data placeholders.

The overlay does not install Coretext as a git submodule and does not run the experiment.
