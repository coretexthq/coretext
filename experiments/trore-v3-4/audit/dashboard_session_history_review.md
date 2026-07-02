# Dashboard And Session-History Review Procedure

Use this procedure after the experiment arms finish. It describes how the evaluator should combine exported session histories with the Coretext dashboard. It does not run the experiment.

## 1. Preserve Evidence Before Inspection

1. Snapshot each arm's final repository state.
2. Export each arm's raw provider session history or transcript.
3. Preserve any normalized history, telemetry JSONL, command logs, and verification outputs.
4. For the Coretext arm, copy or record:
   - `knowledge/*.md`;
   - `knowledge/ai/*.md`;
   - `.coretext-data/{workspace}_rules.jsonl`;
   - `.coretext-data/rules/*.md`;
   - configured telemetry/session JSONL files;
   - final Git diff or commit.
5. Do not edit notes, routes, telemetry, summaries, or final code during audit collection.

## 2. Build A Session Event Table

Create one table per arm with these columns:

| Column | Meaning |
| --- | --- |
| Sequence or timestamp | Raw order from history or telemetry. |
| Actor | User, agent, subagent, hook, evaluator, or runtime. |
| Tool or event | Shell, file read, patch, hook context, dashboard inspection, test command, or prompt. |
| Path or target | Repository path, note path, route target, command, or URL. |
| Action class | Read, write, execute, route activation, write gate, verification, steering, or summary. |
| Evidence artifact | Transcript location, telemetry JSONL line, session note section, dashboard screenshot, or log file. |
| Result | Success, failure, denied, retried, missing, stale, or unresolved. |

Use exported session history as the broad chronology. Use telemetry JSONL and dashboard highlights to verify path-level file activity for the Coretext arm.

## 3. Launch The Dashboard For Visual Audit

Follow `docs/dashboard_guide.md`:

```bash
npm run start
```

Run this from the repository root of the audited Coretext arm. Record the frontend URL and backend port from startup output. If the dashboard cannot start, record the error and continue with direct file evidence.

The dashboard is a derived view. Do not treat a visual node as authoritative unless it matches the underlying file, route ledger, or telemetry record.

## 4. Visual Walkthrough

Complete these passes in order.

### Pass A: Tree Orientation

1. Open tree view.
2. Expand the project root and evaluation/product scopes.
3. Confirm durable notes and session summaries appear under the expected dotted hierarchy.
4. Select the project note, relevant scope notes, and final session summaries in the reader.
5. Capture a screenshot showing the project-to-scope-to-session path.

Audit result: the evaluator should be able to state the current objective, constraints, open risks, and next action from the visible note path.

### Pass B: Session Highlights

1. Select one session at a time in chronological order.
2. Record read and write highlights for each session.
3. Compare highlighted nodes against the session event table.
4. Select important highlighted nodes and verify the reader content matches the filesystem.
5. Capture screenshots for the most important read/write paths.

Audit result: highlighted paths should explain what the agent inspected and changed, not merely show activity noise.

### Pass C: Route Graph And Rule Evidence

1. Switch to graph view.
2. Inspect route edges related to files changed during the run.
3. For each important edge, record source, target, type, hook, and description from the ledger.
4. Check whether the target exists and whether it is still relevant.
5. Compare route activations or write-gate events in history against the visible graph.
6. Capture a screenshot showing important route/rule relationships.

Audit result: the evaluator should be able to explain which context was supposed to activate, when it actually activated, and whether it helped or misled the work.

### Pass D: Search And Recovery

1. Use dashboard search to locate the product goal note, latest session summary, central changed files, and any promoted rule.
2. Record search terms and time to locate each artifact.
3. Simulate a context-loss recovery: hide the raw transcript, then use only durable notes, summaries, dashboard, and final files to identify the next safe action.
4. Record orientation time and missing information.

Audit result: the Coretext arm should have a short, explainable recovery path. If it does not, the failure should be visible as missing summaries, stale notes, route gaps, or dashboard/session mismatch.

## 5. Stale-Context Inspection

For both dashboard and exported history, flag:

- notes that refer to deleted or renamed files;
- session summaries that claim tests or files not present on disk;
- route targets that are missing, irrelevant, or overbroad;
- dashboard nodes with no corresponding source artifact;
- telemetry events that cannot be explained by history;
- final code that violates a delivered rule or stated constraint;
- repeated searches or reads of context already summarized.

Record whether each stale-context incident affected scoring.

## 6. Baseline Arm Handling

The native baseline may not have Coretext notes, routes, telemetry, or dashboard state. Do not penalize it for missing Coretext-specific mechanisms. Instead:

1. Use raw/exported history, Git diff, generated docs, tests, and final files as evidence.
2. Build the same session event table where possible.
3. Run the same orientation timing and stale-context checks.
4. Mark dashboard, route, and Coretext telemetry items as not applicable unless the baseline history was intentionally ingested into Coretext for comparison.

The comparison should ask whether Coretext's added evidence layers improved inspection and recovery enough to justify their maintenance cost in this case study. Do not convert that judgment into an equal-cost or cost-efficiency claim unless elapsed time, token use, tool calls, session count, and human approvals are controlled or normalized.

## 7. Screenshot And Recording Names

Use stable filenames in the final audit report, for example:

- `coretext-tree-overview.png`
- `coretext-session-highlights-<session-label>.png`
- `coretext-route-graph-rules.png`
- `coretext-reader-session-summary.png`
- `coretext-search-recovery.png`

Store screenshots beside the final audit report or in a clearly named evidence folder. The screenshot is supporting evidence; the underlying Markdown, JSONL, and history files remain authoritative.
