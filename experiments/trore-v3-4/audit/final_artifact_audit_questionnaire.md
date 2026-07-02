# Frozen Final Artifact Audit Questionnaire

Status: frozen before experiment execution.

Use this questionnaire after both arms have completed and their artifacts have been snapshotted. Complete it once for the native baseline arm and once for the Coretext-assisted arm. Do not revise questions during scoring.

Answer format for each item:

- **Answer:** yes, partial, no, not applicable, or numeric value.
- **Evidence:** path, transcript location, dashboard screenshot, session note, telemetry file, command output, or reviewer note.
- **Comment:** one or two sentences explaining ambiguity, failure, or notable strength.

## A. Run Identity And Comparability

| ID | Question |
| --- | --- |
| A01 | What exact product goal prompt was given to the arm? |
| A02 | What model, runtime, date, starting repository state, and budget were used? |
| A03 | Was the arm run from a fresh comparable workspace? |
| A04 | Were allowed tools, network policy, package-install policy, and verification expectations the same across arms? |
| A05 | What final commit, diff, or filesystem snapshot represents the arm's output? |
| A06 | What raw session history or transcript export represents the complete interaction? |
| A07 | What commands, tests, builds, or smoke checks were actually run? |
| A08 | What final runnable entry point or local URL exists, if any? |
| A09 | What controller launch ledger maps coordinator, checkpoint, integration, audit, and recovery sessions to prompt files? |

## B. Final Product And Verification

| ID | Question |
| --- | --- |
| B01 | Can a reviewer run the final artifact from the recorded instructions without using chat memory? |
| B02 | Are the promised core workflows present in the repository? |
| B03 | Are out-of-scope items explicitly absent rather than half-implemented? |
| B04 | Are test results, build logs, or smoke-test notes present and tied to the final state? |
| B05 | Are failures or unfinished flows recorded plainly? |
| B06 | Can the evaluator identify which files are central to the final product within ten minutes? |

## C. Inspectability

| ID | Question |
| --- | --- |
| C01 | Can a human identify what was built from durable files without replaying the entire transcript? |
| C02 | Can a human identify what remains unfinished or risky? |
| C03 | Are major decisions summarized in stable notes or session summaries? |
| C04 | Are final artifacts linked to evidence rather than isolated claims? |
| C05 | Can the evaluator move from a high-level project/scope note to detailed session evidence? |
| C06 | Are changed files, generated files, and verification artifacts easy to locate? |
| C07 | Are stale, missing, or contradicted references visible during review? |
| C08 | For the Coretext arm, does the dashboard expose the same notes, routes, sessions, and highlights found on disk? |

## D. Steerability

| ID | Question |
| --- | --- |
| D01 | When requirements changed or ambiguity appeared, is the steering input visible in the history? |
| D02 | Is there evidence that the agent incorporated steering into later actions? |
| D03 | Can a reviewer identify where a correction should be applied: prompt, durable note, route edge, rule, test, or code? |
| D04 | Did the arm avoid silently changing scope to make the task easier? |
| D05 | Did the arm preserve rejected approaches or constraints that should guide future work? |
| D06 | For the Coretext arm, were durable-note updates limited to stable deltas rather than full transcripts? |
| D07 | For the Coretext arm, were promoted rules or route edges justified by reviewed evidence? |
| D08 | For the Coretext arm, did every parent integration include a Rule Decision Record accounting for promoted, rejected, and deferred candidates? |

## E. Resumability

| ID | Question |
| --- | --- |
| E01 | How long did it take a fresh evaluator to orient from the recorded artifacts? |
| E02 | How long did it take a fresh evaluator or agent to identify the next safe action? |
| E03 | Could a fresh agent resume without loading the full raw transcript? |
| E04 | Are session boundaries, summaries, and handoff states clear? |
| E05 | Does the evidence identify the current objective, constraints, strategy, and open risks? |
| E06 | If context was compacted or lost, is the recovery path visible? |
| E07 | For the Coretext arm, do session summaries and durable notes agree about current state? |
| E08 | Did each checkpoint provide enough handoff context for the next session without loading hidden chat history? |

## F. Traceability

| ID | Question |
| --- | --- |
| F01 | Can each major final feature be traced to one or more implementation files? |
| F02 | Can each major decision be traced to a prompt, session summary, durable note, or code review artifact? |
| F03 | Can each claimed verification result be traced to a command, log, or explicit reviewer action? |
| F04 | Are file reads and writes reconstructable from exported session history or telemetry? |
| F05 | Are note reads and note writes reconstructable? |
| F06 | For the Coretext arm, can route activations be tied to source paths and target context? |
| F07 | For the Coretext arm, can dashboard highlights be tied back to telemetry JSONL records? |
| F08 | Are there claims in summaries or notes that cannot be verified from repository state or history? |
| F09 | Can each checkpoint session be traced to a prompt, session ID, output summary, changed files, and verification evidence? |

## G. Reuse

| ID | Question |
| --- | --- |
| G01 | What reusable knowledge was produced beyond the final code? |
| G02 | Can future agents identify relevant constraints without rereading the full transcript? |
| G03 | Are reusable lessons stored at the correct durability level: session, durable note, route edge, rule, test, hook, or linter? |
| G04 | Is there evidence of reduced repeated exploration of already summarized areas? |
| G05 | Are route edges or rules narrow enough to be reusable without over-injecting context? |
| G06 | Are obsolete or one-off findings prevented from becoming current policy? |
| G07 | Can the final evidence help create a follow-up task prompt without inventing missing context? |
| G08 | Does the Coretext hierarchy add useful structure beyond the flat baseline handoff summaries? |
| G09 | For the Coretext arm, did the seeded API-auth invariant produce a rule file, route ledger edge, lint output, and evidence of future usefulness? |

## G2. Multi-Session And Hierarchy Compliance

| ID | Question |
| --- | --- |
| M01 | Did the baseline create `handoff/session-00` through `handoff/session-05` or record explicit deviations? |
| M02 | Did the baseline avoid Coretext-compatible scoped notes, route ledgers, rules, and dashboard evidence? |
| M03 | Did the Coretext arm create or use the fixed parent scopes `trore.foundation`, `trore.renter`, `trore.host`, `trore.booking`, and `trore.integration`? |
| M04 | Did the Coretext arm create depth-2 worker summaries for `trore.foundation.persistence`, `trore.renter.search`, `trore.host.management`, `trore.booking.validation`, and `trore.integration.hardening`? |
| M05 | Did parent scopes verify direct child summaries before durable distillation? |
| M06 | Did the project coordinator avoid implementing the whole app as one project-level session? |
| M07 | Were audit and recovery outputs excluded from build-arm session counts or clearly marked as post-run evidence? |

## H. Dashboard And Visual Evidence

Complete this section for the Coretext-assisted arm. Mark baseline items as not applicable unless its history was ingested into the same visual system for comparison.

| ID | Question |
| --- | --- |
| H01 | Does the dashboard load the graph or tree without hidden source-of-truth edits? |
| H02 | Are session labels human-readable and mapped to session summaries where available? |
| H03 | Do read highlights match note/file reads in session history? |
| H04 | Do write highlights match file modifications or created notes? |
| H05 | Can a reviewer select a highlighted node and read its Markdown or source content in the reader? |
| H06 | Can the reviewer visually follow the path from project note to scope note to session evidence? |
| H07 | Are route graph edges, rule targets, or stale targets inspectable? |
| H08 | Did the evaluator capture screenshots or recordings for the key review states? |
| H09 | If dashboard/telemetry is missing or empty, is that recorded as a protocol gap rather than treated as success? |

## I. Stale Context And Contradictions

| ID | Question |
| --- | --- |
| I01 | Which summaries, durable notes, route edges, or dashboard nodes refer to missing files? |
| I02 | Which notes claim completed work that is not present in code or tests? |
| I03 | Which route edges point to stale or irrelevant context? |
| I04 | Which session summaries omit material failures or verification gaps? |
| I05 | Which final decisions contradict the original product goal or stated constraints? |
| I06 | How many stale-context incidents affected evaluator orientation or scoring? |

## J. Final Judgment

| ID | Question |
| --- | --- |
| J01 | What is the strongest evidence that this arm is inspectable? |
| J02 | What is the strongest evidence that this arm is difficult to inspect? |
| J03 | What exact artifact would a future agent start from? |
| J04 | What exact artifact would a human reviewer inspect first? |
| J05 | What claim can be made from this arm without overgeneralizing? |
| J06 | What threat to validity most affects this arm's score? |
| J07 | What raw cost metrics exist: elapsed time, turns, tool calls, token counts, session counts, and human approvals? |
| J08 | Is any cost-normalized claim justified, or should the result be limited to raw inspectability/recovery benefit? |
