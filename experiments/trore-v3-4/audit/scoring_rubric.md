# Scoring Rubric

Score each arm independently on a 0-4 scale for each dimension. Use half-points only when the evidence clearly falls between two anchors. Cite evidence for every score.

Do not let a polished final product hide weak evidence. The rubric scores the memory and audit trail, not only software quality.

## Global Scale

| Score | Anchor |
| ---: | --- |
| 0 | Missing or unusable. The evaluator cannot answer the dimension's core questions from artifacts. |
| 1 | Fragmentary. Some evidence exists, but the evaluator must rely heavily on raw transcript replay or inference. |
| 2 | Usable with gaps. The evaluator can answer core questions, but key links, timings, or contradictions require manual reconstruction. |
| 3 | Strong. The evaluator can inspect, verify, and resume with limited transcript replay and clear evidence links. |
| 4 | Excellent. The evidence trail is complete, concise, internally consistent, and directly supports reuse by a human or fresh agent. |

## Dimension 1: Inspectability

Core question: Can a human understand the final state, major decisions, risks, and changed artifacts without replaying the entire conversation?

| Score | Anchor |
| ---: | --- |
| 0 | No coherent final state or artifact map exists. |
| 1 | Final state can be inferred only by reading large raw histories or manually diffing many files. |
| 2 | Some summaries or docs exist, but missing risks, changed files, or decision explanations slow review. |
| 3 | Current state, risks, changed files, and verification status are clearly documented and mostly linked to evidence. |
| 4 | A reviewer can move from overview to evidence to source files quickly, with dashboard or file views matching repository state. |

Evidence to consider: final snapshot, session summaries, durable notes, dashboard tree/reader, changed-file list, verification logs, stale-context report.

## Dimension 2: Steerability

Core question: Can a human see how corrections, constraints, and scope decisions entered the work and where future steering should be applied?

| Score | Anchor |
| ---: | --- |
| 0 | Steering prompts or corrections are missing, ignored, or indistinguishable from agent assumptions. |
| 1 | Steering is visible only in raw chat, with no durable reflection or later effect. |
| 2 | Some steering was applied, but the correct future control surface is unclear. |
| 3 | Steering events, resulting actions, rejected paths, and future control surfaces are mostly traceable. |
| 4 | Steering is explicitly routed to the right layer: prompt, durable note, route edge, rule, test, hook, or code, with evidence of effect. |

Evidence to consider: prompt history, durable note deltas, session handoffs, route/rule promotions, rejected approaches, post-steering file changes.

## Dimension 3: Resumability

Core question: Can a fresh human or agent resume the work after context loss with bounded orientation effort?

| Score | Anchor |
| ---: | --- |
| 0 | Resume requires the original agent conversation and unresolved inference. |
| 1 | Resume is possible only after long transcript replay and manual reconstruction. |
| 2 | Summaries or notes provide partial handoff, but gaps remain in current objective, constraints, risks, or next action. |
| 3 | A fresh reviewer can orient and identify the next safe action from summaries, notes, and final files. |
| 4 | The handoff path is short, ordered, and tested by timing: overview, scope, evidence, changed files, risks, and next action are all explicit. |

Evidence to consider: orientation timing, fresh-agent prompt, session summaries, durable current state, dashboard search/tree path, recovery test.

## Dimension 4: Traceability

Core question: Can claims, decisions, routes, file changes, and verification results be traced to concrete artifacts?

| Score | Anchor |
| ---: | --- |
| 0 | Claims cannot be tied to files, commands, prompts, or histories. |
| 1 | Traceability exists only through raw chat replay and manual guesswork. |
| 2 | Major code changes are traceable, but decisions, note changes, route activations, or verification claims are incomplete. |
| 3 | Most major claims trace to prompts, notes, histories, telemetry, routes, source files, or logs. |
| 4 | The evaluator can reconstruct the full evidence chain from prompt to session event to note/route/dashboard view to final file or test. |

Evidence to consider: normalized history, telemetry JSONL, route ledger, dashboard highlights, session summaries, Git diff, command logs.

## Dimension 5: Reuse

Core question: Did the arm produce reusable project memory rather than only a one-off final transcript?

| Score | Anchor |
| ---: | --- |
| 0 | No reusable memory exists beyond the raw interaction. |
| 1 | Some notes or comments exist, but they are incomplete, stale, or not discoverable. |
| 2 | Reusable summaries exist, but durable state, scope ownership, or promotion levels are inconsistent. |
| 3 | Useful knowledge is stored at appropriate levels and can guide a related future task. |
| 4 | The artifact trail separates evidence from current policy, promotes only stable constraints, and demonstrably reduces repeated reconstruction. |

Evidence to consider: session summaries, durable note deltas, rule/route provenance, repeated exploration count, fresh-agent context bundle, stale-context audit.

## Dimension 6: Multi-Session Discipline

Core question: Did the arm actually exercise the required multi-session protocol rather than collapsing into one broad implementation session?

| Score | Anchor |
| ---: | --- |
| 0 | Required checkpoint sessions are missing or indistinguishable from one monolithic run. |
| 1 | Multiple summaries exist, but they do not map to required checkpoints or were written after the fact. |
| 2 | Checkpoints are visible, but handoffs, scope ownership, or parent verification are incomplete. |
| 3 | Required checkpoint sessions exist and mostly preserve the arm's handoff protocol. |
| 4 | Coordinator, checkpoint, integration, and post-run audit/recovery boundaries are complete, traceable, and uncontaminated. |

Evidence to consider: controller launch ledger, baseline `handoff/session-*.md`, Coretext `knowledge/ai/*.md`, parent integration summaries, session IDs, and audit/recovery exclusion.

## Dimension 7: Rule-Layer Enforcement

Core question: Did the Coretext arm actually exercise deterministic rule promotion and routing rather than only writing human-readable notes?

Score the baseline as `not applicable`.

| Score | Anchor |
| ---: | --- |
| 0 | No rule files, route edges, or rule-decision records exist, and no protocol deviation is recorded. |
| 1 | Some candidates are mentioned, but most are not promoted/rejected/deferred with evidence. |
| 2 | Rule decisions exist, but the seeded rule exercise, ledger, lint, or provenance evidence is incomplete. |
| 3 | Seeded rule exercise succeeds and most candidates are accounted for with verified files, ledger edges, and lint output. |
| 4 | Rule decisions, rule files, route edges, lint output, telemetry/dashboard evidence, and recovery-use evidence form a complete chain from session evidence to future activation. |

Evidence to consider: Rule Decision Records, `.coretext-data/rules/*.md`, `.coretext-data/*_rules.jsonl`, add-rules commands, graph lint output, telemetry route activation, dashboard route graph, and recovery-agent use.

## Caps And Penalties

- If raw or exported session history is missing for an arm, no dimension for that arm may score above 2.
- If the required multi-session checkpoint evidence is missing, multi-session discipline is 0 and reuse may not score above 2.
- If the final repository snapshot is missing, inspectability, resumability, and traceability may not score above 1.
- If verification claims are contradicted by filesystem state, traceability may not score above 2 and inspectability may not score above 3.
- If Coretext dashboard evidence is unavailable because the dashboard fails, do not automatically fail the Coretext arm. Apply the file-based fallback, but inspectability and traceability require a documented failure and enough file evidence to compensate.
- If durable notes are rewritten as transcripts or session notes are used as current policy without distillation, reuse may not score above 2.
- If route edges or rules are added without session evidence or lint review, steerability and reuse may not score above 3.
- If the Coretext arm lacks Rule Decision Records, rule-layer enforcement is 0 and steerability/reuse may not score above 2.
- If the seeded API-auth rule exercise is missing without a recorded protocol deviation, rule-layer enforcement may not score above 1 and traceability may not score above 2.
- If the final report claims non-empty lint or ledger evidence contradicted by filesystem state, traceability may not score above 2 and inspectability may not score above 3.
- Do not turn better Coretext raw outcomes into equal-cost claims unless elapsed time, token use, tool calls, session count, and human approvals are controlled or normalized.

## Reporting

Report a compact table:

| Arm | Inspectability | Steerability | Resumability | Traceability | Reuse | Multi-session discipline | Rule-layer enforcement | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Native baseline |  |  |  |  |  |  | N/A |  |
| Coretext-assisted |  |  |  |  |  |  |  |  |

Then add a short paragraph explaining what the scores support and what they do not support. The comparison may support a feasibility and inspectability claim for this case study only. Report raw cost and normalized-cost interpretation separately.
