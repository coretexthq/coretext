---
name: coretext-agents
description: Orchestrate multi-agent teamwork and recursive subagent delegation. Connects the conceptual task/note hierarchy with platform-native subagent APIs (Antigravity's define_subagent/invoke_subagent/send_message and Codex's TOML configurations).
---

# Multi-Agent Teamwork and Subagent Delegation Guide (Knowledge Skill Extension)

This skill is a modular extension of the foundational `knowledge` skill. While the `knowledge` skill manages independent vault structure, note workflows, and project backlogs, this `coretext-agents` skill builds teamwork orchestration, namespaced subagent delegation, write boundaries, and sibling isolation protocols directly on top of it.

---

## 1. Core Vision: Dotted Namespace Hierarchy

The agent delegation tree should be isomorphic to the project note/namespace structure. Every subagent spawned within a teamwork session must represent a specific, namespaced scope in the repository (e.g. `project.scope-1` or `project.scope-1.sub-scope`).

---

## 2. Naming & Write Boundaries

1. **Dotted Namespace Identity**: A subagent's role or configuration name must match the dot-separated path of its corresponding scope (e.g. `project.evaluation.test.dashboard`).
2. **Writing Restrictions**:
   - **Stable Scope Notes**: Only the agent assigned to a specific scope level $k$ is permitted to modify the stable/durable documentation at that level.
   - **Session Logs**: Lower-level worker agents (Level $k+1$, $k+2$, etc.) must *only* write to their corresponding session logs under the AI session directory (e.g. `knowledge/ai/project.evaluation.test.dashboard.session-1.md`).
   - **Sibling Scope Isolation**: A subagent must never modify codebase files, documentation, or assets belonging to sibling namespaces (e.g. a `sub-scope-1` agent must not edit code belonging to `sub-scope-2`). If a task requires editing files across multiple sibling scopes, it must be executed directly by the parent scope agent or decomposed into separate child agent tasks.
3. **Zero Root Pollution**: Under no circumstances should subagents write transient coordination files (e.g., `progress.md`, `tasks.md`) in the repository root or `.agents/` folder. All progress logs must reside in namespaced session notes.

---

## 3. Direct Routing

Choose the workflow that matches your current role:

- **Parent Agent (Orchestration & Verification)**: If you need to spawn, configure, manage, or verify child agents, read [references/parent.md](references/parent.md).
- **Child Agent (Execution & Handoff)**: If you have been spawned as a subagent and need to analyze your scope and execute your task, read [references/child.md](references/child.md).
- **Coretext Graph & Rule Promotion**: If you need to audit, clean, deprecate, or register routing edges using the Coretext engine, read [references/coretext.md](references/coretext.md).
- **Backlog Lineage & Project Audit**: If you need to inspect or audit active backlog items using the command-line backlog tool, read [references/backlog.md](references/backlog.md).

