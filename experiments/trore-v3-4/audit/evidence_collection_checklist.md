# Dashboard And Session-History Evidence Collection Checklist

Collect this evidence after each arm completes and before scoring. Record absolute or repository-relative paths in the final audit report.

Do not inspect `knowledge/archive/`.

## 1. Run Snapshot

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| R01 | Original product goal prompt | Both arms | Store the exact prompt text and any later steering prompts. |
| R02 | Runtime and model metadata | Both arms | Record runtime name, model, date, platform, sandbox/network policy, and budget. |
| R03 | Starting repository snapshot | Both arms | Record commit hash or filesystem copy before the run. |
| R04 | Final repository snapshot | Both arms | Record commit hash, diff, or filesystem copy after the run. |
| R05 | Final runnable instructions | Both arms | Include exact command and local URL when applicable. |
| R06 | Verification outputs | Both arms | Capture test/build/smoke command outputs and whether they were run by the agent or evaluator. |
| R07 | Controller launch ledger | Both arms | Map coordinator, checkpoint, worker, parent-integration, audit, and recovery sessions to prompt files and elapsed time. |

## 2. Exported Session History

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| H01 | Raw provider transcript or exported session history | Both arms | Preserve the full provider-native record. |
| H02 | Normalized history or activity table | Both arms | Include timestamp or sequence, tool, action, path, and result when available. |
| H03 | Compaction or resume markers | Both arms | Note when the runtime compacted, resumed, forked, or lost context. |
| H04 | Human steering events | Both arms | Extract user corrections, approvals, rejections, and scope changes. |
| H05 | Agent verification claims | Both arms | Pair every claim with filesystem evidence or command output. |
| H06 | Checkpoint boundary evidence | Both arms | Verify that each required checkpoint ran as a distinct session or explicitly recorded deviation. |

## 2A. Baseline Flat Handoffs

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| B-H01 | `handoff/session-00-coordinator.md` | Baseline arm | Coordinator plan and fixed checkpoint map. |
| B-H02 | `handoff/session-01-foundation.md` through `handoff/session-05-integration.md` | Baseline arm | Flat chronological checkpoint summaries. |
| B-H03 | Prior-handoff reads | Baseline arm | Evidence that later workers read prior flat summaries rather than hidden original chat context. |
| B-H04 | Final flat state report | Baseline arm | Final baseline integration summary or `RUN_REPORT.md` tied to handoff evidence. |

## 3. Note Reads And Writes

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| N01 | Durable note reads | Coretext arm; baseline if it reads notes | Record `knowledge/*.md` reads by path and sequence. |
| N02 | Session note reads | Coretext arm; baseline if it reads summaries | Record `knowledge/ai/*.md` reads by path and sequence. |
| N03 | Required orientation path | Coretext arm | Verify project note, parent scopes, assigned scope, and relevant prior sessions were read before durable changes. |
| N04 | Durable note writes | Coretext arm | Record which `knowledge/*.md` files changed and whether each change is a stable delta. |
| N05 | Session note writes | Coretext arm | Verify append-only summaries with frontmatter, `# Resource`, original prompt evidence, and final summary. |
| N06 | Rule file writes | Coretext arm | Record `.coretext-data/rules/*.md` additions or updates and their source session evidence. |
| N07 | Note contradiction checks | Coretext arm | Compare current durable notes against session summaries and final code. |
| N08 | Fixed scope tree | Coretext arm | Verify `trore.foundation`, `trore.renter`, `trore.host`, `trore.booking`, and `trore.integration` parent notes plus depth-2 worker notes exist or deviations are recorded. |
| N09 | Parent verification evidence | Coretext arm | Verify parent scope summaries read and checked direct child summaries before durable distillation. |
| N10 | Rule Decision Records | Coretext arm | Verify every parent integration summary contains a Rule Decision Record and accounts for every worker or parent rule candidate. |
| N11 | Seeded rule exercise | Coretext arm | Verify `.coretext-data/rules/api-auth-header.md`, at least one route ledger edge, `wc -l` output, and graph-lint output exist unless a protocol deviation is recorded. |

## 4. Graph Route Activations

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| G01 | Route ledger snapshot before the run | Coretext arm | Capture `.coretext-data/{workspace}_rules.jsonl`. |
| G02 | Route ledger snapshot after the run | Coretext arm | Identify added, removed, stale, duplicate, or modified edges. |
| G03 | Activated route records | Coretext arm | For each routed context event, record source path, action, matched edge, target, type, hook, and delivery result. |
| G04 | Read context deliveries | Coretext arm | Record lineage or graph context shown after supported reads. |
| G05 | Write-gate denials and retries | Coretext arm | Record first denial, acknowledged paths, retry success, and whether the agent changed behavior after context. |
| G06 | Route misses | Coretext arm | Record expected but absent route activations and explain whether the cause was missing edge, unsupported runtime event, or path mismatch. |
| G07 | Route over-activation | Coretext arm | Record irrelevant context delivered to the agent and whether it affected work. |
| G08 | Graph lint result | Coretext arm | Run only as part of audit collection, not experiment execution. Record errors and warnings separately. |
| G09 | Ledger line count | Coretext arm | Record `wc -l .coretext-data/*_rules.jsonl` and compare it against final report claims. |
| G10 | Rule-target existence | Coretext arm | Verify every route target exists and points to a text rule file, not a missing or stale artifact. |

## 5. Telemetry And Session JSONL

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| T01 | Live telemetry JSONL files | Coretext arm | Collect from the configured session store, commonly `.coretext/sessions/session_*.jsonl` or `.coretext-data/sessions/*.jsonl`. |
| T02 | Telemetry schema fields | Coretext arm | Verify `node_id`, `timestamp`, `tool_name`, `runtime`, and action when present. |
| T03 | Read/write classification | Coretext arm | Compare telemetry action or tool names against actual file modifications. |
| T04 | Session-to-summary label mapping | Coretext arm | Verify telemetry/session IDs map to `knowledge/ai/*.md` frontmatter where possible. |
| T05 | Missing telemetry events | Coretext arm | Record file operations visible in history but absent from telemetry. |
| T06 | Extra telemetry events | Coretext arm | Record telemetry nodes not explained by history or repository state. |

## 6. Dashboard Traces

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| D01 | Dashboard launch log | Coretext arm | Record command, ports, and any backend/frontend errors. |
| D02 | Tree view overview screenshot | Coretext arm | Capture project-to-scope-to-session hierarchy with relevant branches visible. |
| D03 | Route graph screenshot | Coretext arm | Capture route edges, rule targets, and any stale or zero-match indicators. |
| D04 | Session highlight screenshot | Coretext arm | Capture read and write highlights for each important session or combined session set. |
| D05 | Markdown reader screenshot | Coretext arm | Capture a selected durable note and selected session summary in the reader. |
| D06 | Search/autocomplete trace | Coretext arm | Record whether the evaluator can locate core notes, rules, and changed files by search. |
| D07 | Dashboard/file parity check | Coretext arm | For selected nodes, confirm displayed content matches the filesystem artifact. |

## 7. Recovery And Orientation Timing

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| O01 | Human orientation start and end time | Both arms | Start from no chat context except the frozen artifacts. |
| O02 | First correct high-level summary time | Both arms | Time until evaluator can state what was built and what remains. |
| O03 | First safe next-action time | Both arms | Time until evaluator can identify a concrete next step and required files. |
| O04 | Fresh-agent resume prompt | Both arms | Draft the minimal prompt and context bundle a new agent would need. |
| O05 | Recovery after missing transcript | Both arms | Simulate raw transcript unavailable; record whether summaries and files are enough. |
| O06 | Recovery after stale note found | Coretext arm | Record time to identify stale source and correct current state from evidence. |

## 8. Stale-Context Checks

| ID | Evidence | Required For | Collection Notes |
| --- | --- | --- | --- |
| S01 | Missing file references | Both arms | Check notes, summaries, transcripts, route edges, and dashboard nodes. |
| S02 | Summary-code contradictions | Both arms | Compare claimed files/features/tests against final repository state. |
| S03 | Durable-note/session contradictions | Coretext arm | Verify durable current state does not preserve obsolete session claims. |
| S04 | Stale route targets | Coretext arm | Identify routes pointing to deleted, moved, binary, or irrelevant targets. |
| S05 | Zero-match source patterns | Coretext arm | Decide whether each is intentional future-facing state or stale configuration. |
| S06 | Ignored injected constraints | Coretext arm | Record cases where context was delivered but final behavior violated it. |
| S07 | Repeated exploration | Both arms | Count repeated reads/searches of areas already summarized or previously inspected. |

## 9. Minimum Completeness Gate

Do not assign final rubric scores until these exist:

- raw or exported session history for each arm;
- controller launch ledger for both arms;
- final repository snapshot for each arm;
- verification outputs or an explicit statement that verification was not run;
- baseline flat handoff files for every required checkpoint;
- completed note/read/write evidence for the Coretext arm;
- Coretext fixed scope tree, depth-2 worker summaries, and parent verification evidence;
- parent Rule Decision Records for the Coretext arm;
- seeded API-auth rule file and route edge, or explicit recorded protocol deviation;
- route ledger and telemetry/session JSONL evidence for the Coretext arm;
- dashboard visual trace evidence for the Coretext arm, or a recorded dashboard failure and file-based fallback;
- recovery/orientation timing notes for both arms;
- stale-context audit notes for both arms.
