# Trore-v3-4 Case-Study Methodology

## Purpose

Trore-v3-4 is a paired demonstration case study for evaluating Coretext as a reusable-context collaboration method. It compares a flat, linear multi-session baseline arm against a Coretext-assisted hierarchical multi-session arm on the same bounded full-stack product goal.

The study does not claim statistical superiority, universal agent-quality improvement, or deterministic model behavior. It asks whether the Coretext-assisted arm leaves a more inspectable, steerable, reusable, and resumable project memory trail than a comparable native workflow that uses ordinary handoff summaries, conversation continuity, compaction, and repository search.

Trore-v3-4 is a derivative next-run packet. Do not overwrite `experiments/trore-v3/`; that directory is historical evidence from the prior run. If this protocol is revised again, copy it to a new `experiments/trore-v3-*` directory and keep the old packet immutable as evidence.

## Research Question

When both arms build the same realistic product from the same starting state and budget, does the Coretext-assisted arm make it easier for a human reviewer or fresh agent to answer:

- what was built;
- which constraints governed the work;
- why key decisions were made;
- which files and tests matter;
- what remains unfinished;
- which rules or invariants were promoted for future work;
- how to resume after context loss?

## Study Design

The experiment has six phases:

1. **Preparation phase:** create two fresh workspaces from the same seed state and freeze the prompts, runtime variables, and artifact collection rules.
2. **Coordinator phase:** launch one coordinator session per arm. The coordinator reads the product goal, plans the task partitioning (and scope structure for Coretext), and must not implement the application features directly in the initialization session.
3. **Execution phase:** launch the planned implementation tasks as separate execution sessions (capped at 5). The baseline coordinator partitions flat chronological handoffs; the Coretext coordinator maps tasks to scopes.
4. **Integration phase:** launch an integration session that verifies checkpoint claims, resolves conflicts, and records final runnable state.
5. **Audit phase:** run the same frozen reviewer audit against both final workspaces without changing code.
6. **Recovery phase:** run the frozen resume probe against each final workspace to measure context reconstruction and continuity.

This methodology defines the protocol for the next valid run. Older Trore-v3 outputs are evidence for prior protocol behavior, including the successful hierarchy run and the failed rule-promotion layer, but they are not to be edited or overwritten by this run.

## Arms

### Native Baseline Arm

The baseline arm receives the product goal and ordinary run instructions. The coordinator dynamically partitions the goal into at most 5 sequential/flat worker sessions. Each session writes a flat handoff summary under `handoff/`, and the next session may read only the product goal, final repository state, and prior flat handoffs.

The baseline may use the selected coding agent's native planning, repository search, tests, compaction, and native subagents inside a session if the runtime supports them. It must not use Coretext project notes, Coretext Skills, scoped session summaries, route ledgers, rule promotion, or dashboard inspection.

### Coretext-Assisted Arm

The Coretext arm receives the same product goal plus the Coretext operating contract and seeded project/scope notes. The coordinator dynamically defines the scope hierarchy under `knowledge/` and partitions the tasks into at most 5 execution sessions. For each partitioned scope, the agent dynamically decides the delegation depth (depth-0 execution directly, depth-1 delegation, or depth-2 worker delegation) based on task isolation and complexity.

Delegation depth is flexible in this experiment. The experiment tests whether a flexible, namespace-driven scope structure produces a more reusable and inspectable project memory than a flat chronological structure under the same budget.

## Frozen Runtime Variables

Freeze these variables before starting the first build run. If any variable cannot be enforced by the runtime, record the observed value and the reason.

| Variable | Frozen value |
| --- | --- |
| Case-study ID | `trore-v3-4` |
| Freeze date | 2026-06-19 |
| Baseline runtime | selected coding-agent runtime, recorded before launch |
| Coretext runtime | selected Coretext-capable coding-agent runtime, recorded before launch |
| Baseline model | selected model exposed by the baseline runtime, recorded before launch |
| Coretext model | selected model exposed by the Coretext runtime, recorded before launch |
| Operating environment | macOS local workspace |
| Repository access | fresh workspace copy per arm |
| Sandbox | workspace-write filesystem access |
| Network | disabled by default; dependency-install escalation may be approved only if both arms receive the same approval rule |
| Browser | local browser inspection allowed only for locally served app pages |
| Web search | forbidden during build and audit |
| Human intervention | no steering after launch except identical approval decisions for blocked setup commands |
| Build budget | 6 hours wall-clock per arm |
| Coordinator budget | one coordinator session per arm |
| Execution session budget | maximum of five implementation/execution sessions per arm |
| Integration budget | one final integration session per arm |
| Coretext hierarchy budget | project coordinator plus up to 5 execution sessions (depth 0, 1, or 2), with dynamic delegation and parent-level integration sessions handled by the coordinator or parents |
| Coretext rule-decision budget | every parent integration must complete a rule-decision gate for candidate constraints |
| Minimum Coretext rule exercise | at least one promoted rule file and one route ledger edge for a seeded product invariant, unless a protocol deviation explains why this could not be exercised |
| Recovery-probe budget | 60 minutes wall-clock per arm |
| Reviewer-audit budget | 90 minutes wall-clock per arm |
| Token accounting | record runtime-reported token counts when available; otherwise record turns, tool calls, elapsed time, and transcript size |
| Cost claims | report raw and normalized cost metrics separately; do not claim equal-cost superiority unless session count, elapsed time, token budget, and human approvals are controlled or normalized |

## Starting State

Both arms must start from comparable clean workspaces created from the same seed commit or archive. The seed must contain no completed Trore implementation.

Baseline seed:

- empty or minimal application repository;
- neutral repository instructions only;
- product goal copied into the workspace as `PROMPT_PRODUCT_GOAL.md` and included in the run transcript;
- empty `handoff/` directory for flat chronological summaries;
- no Coretext `knowledge/`, `.coretext/`, `.coretext-data/`, Coretext Skills, or route/rule files.

Coretext seed:

- same application seed as baseline;
- same `PROMPT_PRODUCT_GOAL.md` file as baseline;
- Coretext installed or copied in the minimal form required by the study;
- seeded project and scope notes derived from `experiments/trore-v3-4/case-study/seeded-coretext-project-note.md` and the fixed scope list in this methodology;
- packaged Coretext operating contract available to the agent;
- route ledger initially empty unless the run explicitly tests pre-seeded route activation; Trore-v3-4's default seeded rule exercise is created during parent integration, not preloaded before implementation.

Both arms must start from a clean Git status. If dependency lockfiles or project scaffolding are pre-seeded, the same application scaffolding must be present in both arms.

## Allowed Tools

Both arms may use:

- file read and search tools such as `rg`, `ls`, `sed`, and direct file reads;
- shell commands for local setup, tests, builds, and local servers;
- file-edit tools;
- package-manager commands needed for the chosen local stack;
- Git commands for status, diff, and local commits if useful;
- local browser inspection for the app once a local server is running;
- runtime-native planning or subagent capabilities inside a fixed checkpoint when the model elects to use them.

Only the baseline arm may use:

- flat chronological handoff summaries under `handoff/`;
- a final flat integration report such as `handoff/final-state.md`.

Only the Coretext arm may use:

- Coretext project notes and session summaries;
- the root `AGENTS.md` Coretext operating contract;
- `.coretext-data/` route ledgers, rules, telemetry, and graph linting;
- Coretext dashboard inspection;
- note-aligned scoped delegation following `docs/coretext_agent_instruction.md`.

The Trore-v3-4 package intentionally includes no `.agents/skills/` directory. If the Coretext engine setup path copies provider Skills into the target repository, the experiment overlay must move them out of the active `.agents/skills/` path or the controller must record a deviation before launch.

## Forbidden Shortcuts

Both arms are forbidden from:

- reading the other arm's workspace, reports, transcript, notes, or generated artifacts;
- reading this methodology or the audit questionnaire after the build run starts;
- using web search or external generated implementations;
- copying from old Trore implementations or archive notes;
- weakening product requirements, renaming missing requirements as future work, or marking TODOs as done;
- faking command output, test logs, screenshots, or verification results;
- hardcoding UI-only data when a backend or persistent database is required;
- replacing the required app with a static mockup;
- implementing a fake API client that bypasses the required backend routes;
- using in-memory-only storage for data that the goal requires to be persistent;
- running the reviewer audit before declaring the build complete;
- modifying experiment prompts, seed manifests, or methodology artifacts from inside an arm workspace.

The baseline arm is additionally forbidden from:

- creating Coretext-compatible project notes, scoped session summaries, route ledgers, rule files, or dashboard traces as a substitute for the native run report;
- using Coretext instructions, Skills, package files, or generated graph artifacts.

The Coretext arm is additionally forbidden from:

- exceeding the budgeted limit of 5 execution sessions;
- implementing build features directly inside the main Coordinator initialization or finalization sessions (all features must be partitioned into separate budgeted execution sessions);
- letting child agents update durable parent notes directly;
- trusting child summaries without verifying referenced files and tests;
- promoting one-off observations into rules without review;
- silently ignoring a worker-recommended rule candidate; every candidate must be promoted, rejected, or deferred with a reason in the parent integration summary;
- claiming graph lint, route-ledger, telemetry, or dashboard success without command output or filesystem evidence;
- using graph or rule promotion to hide incomplete product work.

## Coretext Rule-Enforcement Gate

Trore-v3 showed that agents may identify reusable constraints without promoting them into durable notes or registering route edges. Trore-v3-4 therefore treats rule handling as a protocol gate, promoting rules/constraints directly into durable scope notes.

Each Coretext parent integration must produce a **Rule Decision Record** in its parent session summary with one row per candidate:

| Candidate | Evidence | Decision | Artifact | Reason |
| --- | --- | --- | --- | --- |
| Short invariant name | child session, product goal, file, or test evidence | promoted, rejected, or deferred | target scope note and ledger edge, or `none` | concise reason |

Required decisions:

- **Promote** when the candidate is reusable, future-facing, significant, reviewed by the parent, and expressible as a hard constraint.
- **Reject** when the candidate is one-off, already captured clearly in durable notes/tests/docs, too broad, or not enforceable as a hard constraint.
- **Defer** only when a concrete blocker prevents promotion during the session; the blocker and owner must be named.

The Coretext final integration must fail protocol compliance if any worker or parent recommended a candidate but no Rule Decision Record accounts for it.

### Seeded Rule Exercise

To ensure the rule layer is actually exercised, the Coretext arm must promote and route at least one product invariant unless the controller intentionally runs an empty-ledger ablation. The default seeded invariant is:

- **Invariant:** all protected backend API routes must enforce `X-Trore-Auth: v3-4-case-study`, and frontend API calls must use a shared client or equivalent central mechanism for the header.
- **Expected target:** promoted directly within the durable scope note `knowledge/trore.booking.validation.md`.
- **Expected source pattern:** backend API route file(s), such as `server.js` or `src/**/*api*`
- **Expected hook:** `both`

The parent integration that owns the relevant implementation must append the constraint to the target scope note, register at least one ledger edge with `uv run .coretext/add_rules.py`, and run `uv run .coretext/lint_graph.py`. The final report must include the exact command output or explain the protocol deviation.

Additional rule candidates, such as host ownership checks or booking overlap validation, should still pass through the same decision gate. They are not mandatory unless the parent integration marks them as promoted.

## Product Goal

The frozen product goal is stored in `experiments/trore-v3-4/prompts/00-product-goal.md`.

The goal is derived from the old Trore rental-property milestone prompt, but it is converted from a five-step continuous-evolution sequence into one bounded full-stack build. It is intentionally more complex than the CoTask Enterprise self-decomposition probe because it requires a responsive UI, backend API, persistent data, renter workflows, host workflows, booking logic, saved searches, shared API constraints, and verification artifacts.

## Dynamic Task Partitioning and Scoping

Rather than executing a rigid schedule of five oracle-defined checkpoints, the Coordinator dynamically partitions the full Product Goal into a budget of at most 5 execution sessions. Both arms are required to build the same set of product features (foundation, renter discovery, host management, booking lifecycle, and integration hardening), but the partitioning and sequence are determined by the respective Coordinators.

- **Baseline Arm:** The Coordinator partitions the goal into flat chronological tasks. Each worker session writes its handoff summary under `handoff/session-01.md` through `handoff/session-05.md`.
- **Coretext Arm:** The Coordinator maps tasks to namespaced scopes under `knowledge/` (e.g., `trore.foundation`, `trore.renter`, etc.). The Coordinator decides whether to run a partition at depth 0 (execute directly in a session, writing a session note and distilling rules/durable notes at completion) or delegate it to a child scope (depth 1 or 2).

In the Coretext arm, whichever agent performs the integration (the parent/coordinator after a child finishes, or the agent itself at the end of a depth-0 session) must read the session evidence, update the durable notes, and record the **Rule Decision Record** in its session log.

Coretext depth-2 workers write scoped session summaries and may edit code. Their direct scope parent verifies the child session, updates the scope durable note, and reports upward. The project coordinator updates `knowledge/trore.md` only after reading the direct child scope evidence.

## Prompt Pack

Use the prompt files exactly as frozen:

- `experiments/trore-v3-4/prompts/00-product-goal.md`
- `experiments/trore-v3-4/prompts/01-baseline-init.md`
- `experiments/trore-v3-4/prompts/02-coretext-init.md`
- `experiments/trore-v3-4/prompts/03-reviewer-audit.md`
- `experiments/trore-v3-4/prompts/04-recovery-resume-probe.md`
- `experiments/trore-v3-4/prompts/05-baseline-checkpoint-template.md`
- `experiments/trore-v3-4/prompts/06-coretext-scope-worker-template.md`
- `experiments/trore-v3-4/prompts/07-coretext-parent-integration-template.md`

The init prompts assume the controller has copied `00-product-goal.md` into the arm workspace as `PROMPT_PRODUCT_GOAL.md`. They include the checkpoint structure because this version evaluates fixed multi-session reuse rather than free-form decomposition.

## Artifact Collection

Collect the following artifacts for each arm:

- exact prompt files used for the run;
- controller launch log mapping checkpoint IDs to sessions, workers, prompts, and elapsed time;
- seed commit hash or archive checksum;
- raw runtime transcript or exported conversation log;
- normalized tool/file history when available;
- final Git status and full diff from seed;
- final source tree manifest excluding dependency directories;
- dependency manifests and lockfiles;
- local setup, build, test, and smoke-test logs;
- final `README.md` or equivalent local run instructions;
- final run report written by the arm;
- screenshots or browser notes for main user flows when available;
- reviewer audit report;
- recovery probe report if the recovery phase is executed.

Collect these additional artifacts for the baseline arm:

- every `handoff/session-*.md` file;
- `handoff/final-state.md` or equivalent final flat integration summary;
- evidence showing each checkpoint session read prior handoffs rather than the full original transcript when resuming.

Collect these additional artifacts for the Coretext arm:

- seeded `knowledge/trore.md` project note;
- all durable scope notes created or updated by the run;
- all `knowledge/ai/*.md` session summaries;
- `.coretext-data/*_rules.jsonl` route ledgers;
- parent Rule Decision Records for every candidate constraint;
- exact `wc -l .coretext-data/*_rules.jsonl` and graph-lint outputs;
- graph lint and cleanup logs;
- session telemetry files;
- dashboard screenshots or exported graph/tree views when available;
- evidence that post-run audit/recovery summaries were stored outside the build-arm `knowledge/ai/` tree, or explicitly marked as post-run and excluded from build scoring.

## Measurements

Primary measurements evaluate inspectability and reuse:

| Measure | Operational definition |
| --- | --- |
| Orientation time | time for reviewer or recovery agent to identify current state, key files, constraints, tests, and unresolved work |
| Traceability accuracy | percentage of sampled report/session claims that can be verified in files, tests, commits, telemetry, or logs |
| Steering latency | time/tool calls needed to locate the right place for a small follow-up change |
| Review burden | number of files, logs, and transcript segments the reviewer must inspect before reaching confidence |
| Recovery time | time for a fresh agent to answer orientation questions and complete the recovery probe |
| Summary completeness | whether session evidence records goal, inputs, actions, decisions, changed artifacts, verification, unresolved risks, durable deltas, and handoff state |
| Handoff isolation | whether each checkpoint can continue from the allowed artifacts without using hidden original chat context |
| Integration accuracy | percentage of child or prior-session claims verified before being accepted into final state |
| Rule provenance coverage | percentage of durable/promoted constraints that link back to session evidence or product requirements |
| Rule decision coverage | percentage of recommended rule candidates that were promoted, rejected, or deferred with evidence |
| Rule exercise success | whether the seeded API-auth invariant produced a rule file, ledger edge, lint result, and recovery-use evidence |
| Stale-context count | stale, contradicted, or obsolete claims discovered during audit |
| Activation precision | proportion of injected or loaded Coretext context judged relevant to the touched files or task |
| Activation recall | proportion of known applicable Coretext constraints that were surfaced or used when relevant |
| Protocol compliance | compliance with arm-specific rules, session ownership, append-only evidence, and parent verification |
| Hierarchy benefit | whether Coretext's project/scope/sub-scope structure reduces ambiguity compared with baseline's flat chronological handoffs |
| Dashboard traversability | whether dashboard or graph artifacts allow a reviewer to move from activity to notes, rules, files, and evidence |

Secondary measurements keep the software build honest:

| Measure | Operational definition |
| --- | --- |
| Product completion | checklist coverage for required renter, host, backend, persistence, and verification workflows |
| Local run success | whether setup and run commands work from a clean checkout |
| Build/test success | pass/fail plus failing test names and logs |
| Regression count | broken flows or constraint violations found during audit |
| Constraint violations | violations of URL-driven search state, API auth header use, persistent data, seed-data isolation, and forbidden shortcuts |
| Repeated exploration | repeated reads/searches of already summarized areas after the information should have been available |
| Human intervention count | number and type of human approvals or corrections |
| Overhead | elapsed time, tool calls, token usage when available, and Coretext distillation or promotion cost |
| Cost-normalized interpretation | whether observed Coretext benefit remains meaningful after reporting extra parent sessions, rule-promotion work, and review overhead |

## Reviewer Audit Procedure

The reviewer audit is defined in `experiments/trore-v3-4/prompts/03-reviewer-audit.md`. Run it after both build arms are frozen. The reviewer must not fix code. It should cite concrete files, logs, commands, and transcript evidence for every finding.

Use the same questionnaire for both arms. Coretext-only criteria are scored as "not applicable" for the baseline rather than as baseline failures.

Reviewer output belongs in the experiment audit output directory, not in the build arm's active `knowledge/ai/` tree. If an audit agent writes a session summary, mark it as audit evidence and exclude it from build-arm session counts.

## Recovery Probe Procedure

The recovery probe is defined in `experiments/trore-v3-4/prompts/04-recovery-resume-probe.md`. Run it with a fresh agent after the audit or on a separate copy of each final workspace. The probe measures whether the arm's artifacts help a fresh worker reconstruct context and make a small constrained change.

The recovery probe is a continuity measurement, not a second full product build.

Recovery output belongs in `RECOVERY_ORIENTATION.md`, `RECOVERY_REPORT.md`, or an external audit/recovery evidence folder. Do not count recovery summaries as build-arm implementation sessions.

## Analysis and Reporting

Report results as a paired qualitative and descriptive comparison:

- product completion and verification table;
- constraint compliance table;
- inspectability and recovery metrics table;
- multi-session handoff and integration table;
- brief narrative of where each arm succeeded or failed;
- evidence examples with file paths and transcript references;
- threats to validity;
- separate raw outcome claims from cost-normalized claims.

Do not use inferential statistics unless the study is replicated across multiple products, models, and runs. Do not claim that Coretext improves all coding-agent work. The maximum supported claim is that, in this Trore-v3-4 case study under the frozen conditions, Coretext did or did not improve inspectability, continuity, traceability, and recovery compared with the native baseline.

Do not claim equal-cost superiority from this design alone. The Coretext arm intentionally uses more coordination structure than the baseline. Report whether the extra structure appears worthwhile, but keep that separate from a controlled cost-efficiency claim unless an explicit matched-budget or normalized-budget variant is run.

## Threats to Validity

- Single-product task selection may favor or punish one workflow.
- Researcher-authored Coretext notes can privilege the Coretext arm.
- Model and runtime versions may drift after the freeze date.
- Token accounting may be incomplete or unavailable.
- Human approval decisions for dependency setup may introduce asymmetry.
- The baseline may still produce useful reports through native behavior.
- The Coretext arm may spend overhead on summaries or promotion that does not improve the final app.
- A single run cannot distinguish workflow effects from model stochasticity.
- A fixed checkpoint tree may over-regularize the Coretext arm and may not represent normal organic agent behavior.
- Baseline flat handoffs give the native arm more reusable context than a normal single-chat baseline; this is intentional because the upgraded comparison isolates structure quality rather than the mere existence of summaries.
