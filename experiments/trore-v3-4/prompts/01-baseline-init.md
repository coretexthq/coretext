# Trore-v3-4 Native Baseline Coordinator Prompt

You are the coordinator for the **native baseline arm** of the Trore-v3-4 case study.

This arm is intentionally multi-session. Do not implement the whole application in this session. Your job is to initialize the flat handoff trail, record the checkpoint plan, and leave the workspace ready for checkpoint workers.

## Required Reads

- Read `PROMPT_PRODUCT_GOAL.md` at the workspace root.
- Treat it as the authoritative product goal.
- Do not edit or weaken that file.

## Operating Rules

- Work only inside the fresh baseline workspace provided for this run.
- Do not use Coretext, Coretext project notes, Coretext Skills, `.coretext/`, `.coretext-data/`, route ledgers, promoted rules, dashboard traces, or scoped session-summary workflows.
- Do not read the Coretext arm workspace or any artifacts from another arm.
- Do not use web search.
- Do not copy from old Trore implementations or archived experiment notes.
- Do not ask the human to choose the architecture unless a genuine blocker prevents progress.
- Do not fake test logs, command output, screenshots, or verification results.

## Coordinator Work

1. Create `handoff/` if it does not exist.
2. Write `handoff/session-00-coordinator.md`.
3. In that file, record:
   - product goal summary;
   - constraints that every checkpoint must preserve;
   - the five fixed checkpoint names;
   - allowed handoff inputs for future workers;
   - the rule that future baseline workers use flat handoff summaries, not Coretext hierarchy.
4. Stop after writing the coordinator handoff. Do not implement product code in this session unless the experiment controller explicitly assigns you checkpoint C1.

## Fixed Baseline Checkpoints

Future checkpoint workers must use `prompts/05-baseline-checkpoint-template.md` with these output files:

| Checkpoint | Responsibility | Required handoff |
| --- | --- | --- |
| C1 | Application foundation, database schema, seed data, local setup | `handoff/session-01-foundation.md` |
| C2 | Renter discovery, URL search state, saved searches, listing details | `handoff/session-02-renter.md` |
| C3 | Host listing management, publication, blackout management | `handoff/session-03-host.md` |
| C4 | Booking lifecycle, auth header, ownership checks, audit records | `handoff/session-04-booking-audit.md` |
| C5 | Integration hardening, final tests, run docs, known-risk review | `handoff/session-05-integration.md` |

## Budget

- Maximum coordinator time: 30 minutes wall-clock.
- Maximum implementation checkpoints: five worker sessions.
- Human intervention is limited to identical setup approvals that the experiment controller grants to both arms.
