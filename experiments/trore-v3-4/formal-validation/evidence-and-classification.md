# Evidence And Classification Plan

## Evidence Directory Layout

Create these directories only when the experiment is executed:

```text
experiments/trore-v3/formal-validation/
  fixtures/
  expected/
  actual/
  reviews/
  reports/
```

`fixtures/` holds immutable frozen inputs. `expected/` holds predeclared expected outputs. `actual/` holds outputs generated during execution. `reviews/` holds comparison and classification ledgers. `reports/` holds Chapter 4-ready summaries.

## Required Evidence Artifacts

| Artifact | Purpose | Produced Before Execution |
| --- | --- | --- |
| `fixtures/manifest.md` | Fixture source, hash, contract coverage, and acceptance status. | Yes |
| `expected/route-selection.json` | Expected ordered route edges for each path/action. | Yes |
| `expected/context-rendering.json` | Expected hint and full render outputs. | Yes |
| `expected/runtime-normalization/*.json` | Expected normalized request per payload. | Yes |
| `expected/write-gate-transitions.json` | Expected FSM transition sequence. | Yes |
| `expected/hierarchy-tree.json` | Expected project/scope/session tree. | Yes |
| `expected/session-summary-audit.csv` | Expected required-field audit criteria. | Yes |
| `expected/dashboard-sessions.json` | Expected session label mapping. | Yes |
| `expected/dashboard-highlights.json` | Expected read/write highlights. | Yes |
| `actual/*.json`, `actual/*.csv`, `actual/*.txt` | Captured experiment outputs. | No |
| `reviews/classification-ledger.csv` | Status and primary failure class per contract row. | No |
| `reports/formal-validation-results.md` | Final report summary. | No |

## Observation Record Schema

Each row in `reviews/classification-ledger.csv` should include:

```csv
contract_id,fixture_ids,input_summary,expected_artifact,actual_artifact,status,primary_failure_class,secondary_cause,boundary_note,reviewer,review_timestamp
```

Use empty `primary_failure_class` for pass rows.

## Dashboard And Session-History Evidence Mapping

Dashboard claims must trace back to authoritative files.

| Dashboard or history view | Authoritative source | Derived function or endpoint | Evidence to collect |
| --- | --- | --- | --- |
| Session list filename | `.coretext-data/sessions/session_<id>.jsonl` | `note_hierarchy.py sessions`; `/api/sessions` | Raw session JSONL; mapped sessions JSON |
| Human-readable session label | `knowledge/ai/*.md` frontmatter `conversations` | `build_sessions_index`; `/api/sessions` | Summary frontmatter; mapped sessions JSON |
| Read highlight | Telemetry record with read-like `tool_name` or action | `get_highlights`; `/api/highlights` | Raw telemetry; highlights JSON |
| Write highlight | Telemetry record with write-like `tool_name` or action | `get_highlights`; `/api/highlights` | Raw telemetry; highlights JSON |
| Write precedence over read | Multiple telemetry events for same `node_id` | `get_highlights`; dashboard CSS/rendering | Highlights JSON; optional screenshot |
| Hierarchy tree node | `knowledge/*.md` and `knowledge/ai/*.md` copied fixtures | `NoteHierarchy.build_tree`; `/api/architecture` | Fixture tree; hierarchy JSON |
| Route graph edge | Frozen JSONL route ledger | Dashboard graph loader | Frozen ledger; graph JSON |
| Markdown reader content | Source Markdown or target file fixture | `/api/file-content` | Fixture hash; API output |

The dashboard is evidence only as a derived view. If the dashboard disagrees with kernel output, classify the issue as a Coretext mechanism failure in the dashboard/derived-view surface, not as a change in authoritative state.

## Failure Classification

### Coretext Mechanism Failure

Use when valid frozen inputs expose incorrect behavior in implemented Coretext software.

Examples:

- route selection omits an active matching edge;
- route selection returns an inactive hook edge;
- rendering hydrates a `hint` target as full content;
- adapter normalizes a supported Codex or Antigravity payload incorrectly;
- write gate allows an unacknowledged matching write;
- write gate denies a no-context write;
- hierarchy attaches a session to the wrong durable prefix;
- dashboard session labels or highlights contradict authoritative telemetry and summaries;
- linter fails to detect malformed graph state that it is specified to detect.

### Agent Behavior Failure

Use when Coretext provided the correct context, protocol, or evidence path, but the agent did not follow it.

Examples:

- agent ignores correctly delivered route context;
- delegated worker writes durable parent notes despite protocol instructions;
- parent updates durable state without reading direct child session evidence;
- session summary omits required evidence even though the required structure was available;
- agent claims verification or promotion without supporting evidence;
- agent overstates deterministic model behavior in the report.

### Knowledge-Maintenance Failure

Use when the maintained project state is absent, stale, malformed, or not promoted correctly.

Examples:

- route ledger lacks a needed edge;
- route target path is missing or stale;
- durable note contains obsolete strategy;
- session summary exists but is not linked or discoverable where needed;
- expected rule was never created after a reviewed repeated failure;
- fixture or expected-output file was not frozen before execution;
- wikilinks skip hierarchy levels or point to nonexistent active notes.

### Mixed Cases

Record one primary class and optional secondary cause.

Guidelines:

- If valid knowledge state is processed incorrectly, primary class is Coretext mechanism.
- If invalid knowledge state causes wrong behavior and lint should have caught it but did not, primary class is Coretext mechanism with knowledge maintenance as secondary.
- If invalid knowledge state causes wrong behavior and the linter is not specified to catch it, primary class is knowledge maintenance.
- If the agent was given correct context and still made the wrong decision, primary class is agent behavior.
- If the fixture was not frozen or expected output was ambiguous, use `BLOCKED_INVALID_FIXTURE` rather than assigning a failure class.

## Pass/Fail Status Rules

`PASS` requires all required evidence artifacts for the contract row.

`PASS_WITH_LIMITATION` is appropriate when a contract passes only inside a documented implementation boundary, such as Antigravity graph read context being skipped because the stable post-read path is unavailable.

`FAIL_*` statuses require:

- expected output;
- actual output;
- comparison notes;
- one primary failure class;
- a recommendation for the owning surface: implementation fix, agent-protocol correction, or knowledge-maintenance update.

`NOT_RUN` is the only valid status for methodology-only rows.
