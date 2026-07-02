# Trore-v3-4 Recovery and Resume Probe Prompt

You are a fresh coding agent asked to resume one frozen Trore-v3-4 arm workspace after context loss.

This is a recovery probe, not a full rebuild. Measure how quickly and accurately you can reconstruct the project state, then make one small bounded change if the workspace is runnable enough.

## Inputs

The experiment controller will provide:

- arm label: `baseline` or `coretext`;
- absolute path to the frozen arm workspace;
- the original product goal prompt;
- the arm's final run report;
- raw transcript or exported conversation log when available;
- for the Coretext arm, available durable notes, session summaries, rules, route ledgers, telemetry, and dashboard artifacts.

## Rules

- Work only inside the provided workspace copy.
- Do not read the other arm's workspace.
- Do not use web search.
- Do not spend more than 60 minutes wall-clock.
- Record elapsed time, tool calls, major files read, and commands run.
- If you edit code, keep the change small and directly tied to the probe.
- Do not rewrite history, prompts, methodology, or audit reports.
- Do not write a recovery session summary into the build arm's active `knowledge/ai/` tree unless the experiment controller explicitly asks for a post-run Coretext continuation. The default recovery output is `RECOVERY_ORIENTATION.md` and `RECOVERY_REPORT.md`.

## Orientation Task

Before changing code, write `RECOVERY_ORIENTATION.md` with answers to:

- What is the app supposed to do?
- How do I run it locally?
- What are the key frontend, backend, database, and test files?
- What cross-cutting constraints must not be violated?
- What is known unfinished or risky?
- Which prior decisions or summaries should guide a follow-up change?
- What evidence supports these answers?

Record how long orientation took and which artifacts were most useful.

## Bounded Follow-Up Change

If the project can be installed and run or tested locally, implement this small change:

Add a cancellation path for pending booking requests:

- renters can cancel their own pending booking request;
- hosts can no longer approve a cancelled request;
- cancellation creates an audit record;
- existing booking validation, Trore auth header behavior, host ownership checks, and URL-driven search behavior must remain intact;
- add or update tests or smoke-check documentation for the cancellation path.

If the project is too broken to implement this within the budget, stop after the orientation task and explain the blocker.

## Final Recovery Report

Write or append `RECOVERY_REPORT.md` with:

- orientation time;
- setup/build/test results;
- files read during orientation;
- artifacts that were useful or misleading;
- change implemented or blocker encountered;
- verification commands and honest results;
- remaining risks;
- whether the available artifacts made resumption easy, moderate, or difficult.

For the Coretext arm, explicitly note whether durable notes, session summaries, route/rule files, telemetry, or dashboard artifacts helped you resume.

For the Coretext arm, also inspect the rule layer directly:

- Did `.coretext-data/rules/api-auth-header.md` exist?
- Did the route ledger contain at least one edge to that rule?
- Did any rule, route edge, telemetry event, or dashboard view reduce orientation effort or prevent a wrong edit?
- If the rule layer was empty or misleading, record that separately from the usefulness of durable notes and session summaries.

If you write any additional recovery notes, store them in the recovery evidence output location or clearly mark them as post-run evidence excluded from build-arm session counts.
