# Trore-v3-4 Evaluation Audit Packet

This directory freezes the audit protocol for the full Coretext evaluation before the experiment is run or final artifacts are inspected.

The audit evaluates the thesis claim that Coretext makes long-running agent-assisted work more inspectable, steerable, resumable, traceable, and reusable than relying only on native chat context, provider compaction, and ad hoc filesystem search. It is not a statistical benchmark and must not be reported as proof that Coretext universally improves coding-agent output quality.

## Frozen Artifacts

- [final_artifact_audit_questionnaire.md](final_artifact_audit_questionnaire.md): final questionnaire to complete after both arms finish.
- [evidence_collection_checklist.md](evidence_collection_checklist.md): required raw, normalized, note, graph, telemetry, dashboard, timing, and stale-context evidence.
- [scoring_rubric.md](scoring_rubric.md): scoring anchors for inspectability, steerability, resumability, traceability, and reuse.
- [dashboard_session_history_review.md](dashboard_session_history_review.md): evaluator procedure for exported histories and the local dashboard.

## Freeze Rules

1. Do not change the questionnaire, checklist, or rubric after inspecting either arm's final artifacts.
2. If an error is discovered after inspection starts, record the correction as an explicit dated amendment in the final audit report rather than rewriting these files.
3. Score the baseline and Coretext-assisted arms independently before comparing them.
4. Separate build quality from memory quality. Broken product behavior is a software result; missing evidence, unclear handoff, stale context, or untraceable decisions are Coretext-evaluation results.
5. Treat the dashboard as a derived inspection surface. File contents, Git state, route ledgers, session summaries, telemetry JSONL, and exported session histories remain the evidence artifacts.

## Expected Final Audit Outputs

The evaluator should produce, at minimum:

- completed questionnaire responses for each arm;
- a filled evidence checklist with paths to collected artifacts;
- rubric scores with short evidence citations;
- dashboard screenshots or screen recordings for the Coretext-assisted arm;
- a short comparison memo that states threats to validity and avoids unsupported causal claims.

This packet defines the audit design only. It does not execute the Trore-v3-4 experiment.
