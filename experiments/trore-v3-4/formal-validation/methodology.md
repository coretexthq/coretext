# Formal Validation Methodology

## Purpose

Formal validation checks whether the implemented Coretext mechanisms satisfy the formal contracts stated in Chapter 3 and reflected in Chapter 4. It validates the deterministic shell around the agent:

- normalized runtime requests;
- ordered route selection;
- context rendering;
- one-time write acknowledgement;
- hierarchy and delegation protocol;
- session evidence and promotion governance;
- telemetry, dashboard, and inspection views.

It does not validate model reasoning quality, task success, or autonomous software engineering capability. If Coretext delivers correct context and an agent ignores it, the failure is not a route-selection failure.

## Validation Questions

| ID | Question | Contract surface |
| --- | --- | --- |
| FVQ-01 | For a fixed normalized path, action, and ordered ledger, does Coretext return the expected ordered matching edges? | Route selection |
| FVQ-02 | Does rendering preserve route selection while separating compact hints from hydrated full content? | Context rendering |
| FVQ-03 | Do supported Codex and Antigravity payloads normalize into the common request shape before routing? | Runtime normalization |
| FVQ-04 | Does the first-write gate follow the documented session/path finite-state machine? | Write-gate FSM |
| FVQ-05 | Does the dotted note hierarchy align with project, scope, session, and delegation ownership? | Hierarchy and delegation |
| FVQ-06 | Do session summaries and promotion decisions preserve the required evidence before durable state changes? | Session reuse and promotion |
| FVQ-07 | Can a reviewer trace telemetry, session labels, highlights, and dashboard views back to authoritative files? | Observability and dashboard |

## Contract Sources

The validation protocol is anchored to:

- `knowledge/coretext.thesis.md`;
- `graduation-thesis/coretext-md/Chapter/3_Methodology.md`;
- `graduation-thesis/coretext-md/Chapter/4_Experiment_evaluation.md`;
- `knowledge/coretext.evaluation.formal-validation.md`;
- `knowledge/coretext.evaluation.test.md`;
- `knowledge/coretext.workflow.deterministic-layer.md`;
- `docs/coretext_hooks.md`;
- `docs/dashboard_guide.md`;
- `docs/ARCHITECTURE.md`;
- `docs/coretext_agent_instruction.md` for the packaged hierarchy and delegation protocol.

Do not use `knowledge/archive/` as input evidence.

## Procedure

### Phase 1: Freeze Inputs

Create fixture copies under `experiments/trore-v3/formal-validation/fixtures/` before executing any checks.

Each fixture group must include:

- source file path or payload origin;
- copied fixture path;
- SHA-256 hash;
- fixture purpose;
- contracts covered;
- reviewer who accepted the freeze;
- freeze timestamp;
- source Git commit.

No fixture may be edited after hashing. If a fixture is wrong, create a replacement with a new fixture ID and record the old one as rejected.

### Phase 2: Define Expected Outputs

For each fixture, write expected outputs under `experiments/trore-v3/formal-validation/expected/`.

Expected outputs must be declarative. They must not be generated from the implementation under test after the fact.

Required expected data:

- expected ordered route-edge IDs or complete edge records;
- expected hint payload fragments and full-content target inventory;
- expected normalized runtime request fields;
- expected write-gate transition sequence;
- expected hierarchy node placement and lineage projection;
- expected session-summary evidence fields;
- expected dashboard session labels and read/write highlight maps.

### Phase 3: Execute Checks in Isolation

Run checks only after fixtures and expected outputs are frozen. Use isolated temporary workspaces, not the live project state.

Permitted execution surfaces during the future experiment:

- route engine calls over copied ledgers and copied target files;
- runtime adapter calls over saved JSON payloads;
- write-gate calls over copied acknowledgement stores;
- hierarchy kernel calls over copied `knowledge/` fixture trees;
- dashboard API or kernel calls over copied session logs and copied note summaries;
- static audits of session summaries, durable notes, and packaged agent instructions.

Not permitted:

- enabling project-local hooks in the working repository;
- executing hooks against live task files;
- using live `.coretext-data/sessions/` as the primary evidence source;
- correcting fixtures after seeing actual results without recording a rejected fixture.

### Phase 4: Compare and Classify

For each contract row, compare actual artifacts against expected artifacts and assign exactly one status:

- `PASS`: all required observations match expected outputs.
- `PASS_WITH_LIMITATION`: the contract holds inside a documented implementation boundary, but an exclusion matters for Chapter 4.
- `FAIL_CORETEXT_MECHANISM`: valid fixture input exposes incorrect Coretext mechanism behavior.
- `FAIL_AGENT_BEHAVIOR`: Coretext provided correct context or evidence, but the agent ignored, misused, or violated it.
- `FAIL_KNOWLEDGE_MAINTENANCE`: the configured knowledge state was missing, stale, malformed, unreviewed, or not promoted.
- `BLOCKED_INVALID_FIXTURE`: the fixture or expected output was invalid, ambiguous, or not frozen correctly.
- `NOT_RUN`: methodology exists but no execution evidence has been collected.

A row may include secondary contributing causes, but the report must name one primary classification.

### Phase 5: Report

Use [report-template.md](report-template.md). Chapter 4 should present formal validation beside normal software tests, not as a substitute for them.

Report every contract with:

- contract ID;
- fixture IDs;
- expected result;
- actual evidence artifact paths;
- status;
- failure classification if not pass;
- boundary or limitation.

## Contract-Specific Methods

### Route Selection

Use a fixed JSONL route ledger and fixed normalized path/action pairs. Validate that `R_E(p, a)` returns the exact ordered edge list expected from `fnmatch`, literal equality, directory-prefix matching, and hook filtering.

Collect:

- frozen ledger fixture;
- normalized input path and action;
- expected matching edge list;
- actual matching edge list;
- ledger order evidence.

Pass if the ordered list is exact. Extra, omitted, unordered, stale, or hook-inactive edges fail the route-selection contract.

### Context Rendering

Use route-selection fixtures with target files and directories. Validate that `G(R_E(p, a))` separates `hint` output from `full_files` output without changing the selected edge sequence.

Collect:

- target fixture hashes;
- expected hint lines;
- expected full-file inventory;
- actual rendered context;
- missing or binary target observations.

Pass if compact hints contain descriptions and target paths, full routes hydrate readable target content, and missing or binary targets affect only rendering diagnostics rather than route selection.

### Runtime Normalization

Use saved Codex, Antigravity, and unsupported payload fixtures. Validate that provider-specific payloads become a common request shape containing runtime, event, tool, input, sanitized session ID, normalized project-relative paths, and inferred action.

Collect:

- payload fixture hashes;
- expected normalized request JSON;
- actual normalized request JSON;
- no-op or allow response for unsupported payloads.

Pass if supported payloads normalize correctly and unsupported or malformed payloads fail open inside the documented boundary.

### Write-Gate FSM

Use copied write payloads, copied ledgers, and isolated acknowledgement stores. Validate:

- no matching context allows immediately;
- first matching write denies and records the requested normalized path list;
- retry in the same session allows;
- another session remains isolated;
- hook errors fail open without corrupting the ledger.

Collect:

- input payloads;
- acknowledgement store before and after each transition;
- runtime-specific allow or deny response;
- rendered context returned on denial.

Pass if observed transitions match `AllowNoContext`, `DenyAndRecord`, `AllowRetry`, and documented fail-open behavior.

### Hierarchy And Delegation

Use copied `knowledge/` fixture trees and packaged agent instruction snapshots. Validate:

- project, scope, virtual scope, and session nodes map from dotted names;
- sessions attach to the longest existing durable prefix;
- archive and nested inactive knowledge paths are excluded;
- delegated child roles match direct child namespaces;
- workers preserve append-only session evidence;
- parents read direct child evidence before durable distillation;
- durable notes do not skip hierarchy levels in child links.

Collect:

- fixture note tree;
- expected hierarchy JSON;
- actual hierarchy JSON;
- lineage projection output;
- delegation audit sheet.

Pass if the derived hierarchy and delegation audit match the packaged protocol. Agent violations with correct protocol delivery classify as agent behavior. Missing or stale notes classify as knowledge maintenance.

### Session Reuse And Promotion

Use frozen session summaries, durable notes, and optional rule/ledger examples. Validate that reusable summaries include goal, input context, actions, decisions, changed artifacts, verification, unresolved risks, durable deltas, and handoff state before any durable promotion claim.

Validate the promotion predicate:

```text
promote(x) = reusable(x) and scoped(x) and future_facing(x) and reviewed(x) and verifiable(x)
```

Collect:

- session-summary audit rows;
- durable-note delta audit rows;
- rule or edge promotion evidence if any;
- graph-lint evidence if any rule/edge promotion is claimed.

Pass if promoted claims have prior evidence and review. A good session that is not promoted is still valid. A missing required field is a session-reuse failure and usually classifies as agent behavior unless the durable knowledge structure caused the omission.

### Observability And Dashboard

Use copied telemetry logs, copied session summaries, copied ledgers, and copied dashboard/kernel outputs. Validate that dashboard-visible labels and highlights are derived from authoritative evidence:

- `.coretext-data/sessions/session_<id>.jsonl` provides file activity;
- `knowledge/ai/*.md` frontmatter maps conversation IDs to summary names;
- `node_id` maps to graph or hierarchy nodes;
- read-like tool names produce read highlights;
- write-like tool names produce write highlights;
- API or kernel output remains derived state and does not mutate authoritative files.

Collect:

- raw session JSONL fixture;
- session-summary frontmatter fixture;
- mapped session JSON;
- highlight JSON;
- architecture or graph JSON;
- optional screenshot for human inspection.

Pass if a reviewer can trace every displayed label and highlight to a fixture file and no dashboard-only state is needed to explain the evidence.

## Data Collection Fields

Every contract observation must record:

| Field | Meaning |
| --- | --- |
| `contract_id` | Matrix row, such as `FV-01.1` |
| `fixture_ids` | Frozen fixtures used |
| `input_summary` | Normalized path/action, payload, note path, or session ID |
| `expected_artifact` | Expected-output file path |
| `actual_artifact` | Actual-output file path |
| `status` | One of the defined statuses |
| `primary_failure_class` | Empty for pass, otherwise one primary class |
| `secondary_cause` | Optional contributing cause |
| `boundary_note` | Limitation or exclusion needed for Chapter 4 |
| `reviewer` | Person or agent that performed comparison |
| `review_timestamp` | ISO timestamp |

## Claim Boundaries

Formal validation may claim mechanism correctness only inside frozen, tested boundaries.

It must not claim:

- deterministic model interpretation;
- guaranteed agent compliance;
- guaranteed task correctness;
- filesystem security or access control;
- dashboard state as an authoritative source;
- general scale support beyond measured fixture size.
