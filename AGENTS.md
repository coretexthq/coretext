# Agent Rules: Deterministic State-Driven Development (D-SDD)

## Core Directives
1. **State as Truth:** `ARCHITECTURE.md`, `docs/`, and `.agents/skills/` are the permanent, deterministic source of truth.
2. **Intent Before Execution:** Never retroactively update the architecture to justify code changes. If a task violates constraints, halt and escalate.
3. **No Slop:** No long roadmaps or bloated checklists. Plan only the immediate atomic step.

## Artifact Lifecycle
1. `_coretext/target_state.md`: Active goal. Archived upon completion.
2. `_coretext/atomic_step.md`: Immediate task. Deleted after execution.
3. `_coretext/handoff.md`: Ephemeral PR summary / error log. Deleted after Planner reads it.
4. `_coretext/experience.json`: Telemetry log tracking which files required which docs/skills.

## Roles
Role-specific instructions are defined in `.gemini/agents/` (planner, executor, reviewer).