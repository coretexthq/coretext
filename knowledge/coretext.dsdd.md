# Coretext D-SDD (Deterministic State-Driven Development)

## Status
- Coretext now centers on a Planner -> Executor -> Reviewer loop anchored by `docs/BACKLOG.md`, `docs/superpowers/specs/*`, `docs/superpowers/plans/*`, `docs/superpowers/reviews/*`, and `docs/rules/*`.
- The system still treats failing tests as the gate, but the current repo emphasizes deterministic routing and explicit review artifacts over broad prompt scaffolding.

## The Triad of Execution
1. Semantic goal in `docs/superpowers/specs/*`.
2. Technical gate in failing tests or focused verification.
3. Ephemeral scope in `docs/superpowers/plans/*`.

## Execution Loop
- Planner turns backlog intent into a goal, scope, and testable task.
- Executor writes the smallest change needed to satisfy the gate.
- Reviewer audits the diff against architecture, writes durable rules, and updates the graph when needed.
- Human verification closes the loop for merge decisions.

## Resource
- [[coretext.dsdd.adversarial_execution]]
- [[coretext.dsdd.v2_architecture]]
- [[coretext.dsdd.evolution]]
- [[coretext.dsdd.minimalist_pivot]]
- [[coretext.dsdd.jsonl_standardization]]
- [[coretext.dsdd.telemetry]]
- [[coretext.dsdd.proactive_insight]]
