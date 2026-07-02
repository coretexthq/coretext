---
name: coretext-agents
description: Orchestrate multi-agent teamwork and recursive subagent delegation. Connects the conceptual task/note hierarchy with platform-native subagent APIs (Antigravity's define_subagent/invoke_subagent/send_message and Codex's TOML configurations).
---

# Multi-Agent Teamwork and Subagent Delegation Guide

This document defines the guidelines and protocols for orchestrating multi-agent teamwork sessions. It ensures that all spawned subagents adhere to structured note-taking and namespace guidelines, maintain repository cleanliness, and integrate seamlessly with platform-native APIs for communication and execution.

---

## 1. Core Vision: Dotted Namespace Hierarchy

The agent delegation tree should be isomorphic to the project note/namespace structure. Every subagent spawned within a teamwork session must represent a specific, namespaced scope in the repository (e.g. `project.scope-1` or `project.scope-1.sub-scope`).

---

## 2. Naming & Write Boundaries

1. **Dotted Namespace Identity**: A subagent's role or configuration name must match the dot-separated path of its corresponding scope (e.g. `project.evaluation.test.dashboard`).
2. **Writing Restrictions**:
   - **Stable Scope Notes**: Only the agent assigned to a specific scope level $k$ is permitted to modify the stable/durable documentation at that level.
   - **Session Logs**: Lower-level worker agents (Level $k+1$, $k+2$, etc.) must *only* write to their corresponding session logs under the AI session directory (e.g. `knowledge/ai/project.evaluation.test.dashboard.session-1.md`).
3. **Zero Root Pollution**: Under no circumstances should subagents write transient coordination files (e.g., `progress.md`, `tasks.md`) in the repository root or `.agents/` folder. All progress logs must reside in namespaced session notes.

---

## 3. Platform Integration & Invocation

To translate the conceptual namespace hierarchy into the actual platform-specific tools, read the relevant reference guide:

- **Google Antigravity Platform**: Read [references/antigravity.md](references/antigravity.md) if operating on the Antigravity platform.
- **OpenAI Codex Platform**: Read [references/codex.md](references/codex.md) if operating on the Codex platform.

---

## 4. Recursive $N$-Level Delegation Protocol

The delegation protocol scales recursively to $N$ levels of nesting:

1. **Intake and Orientation**:
   - The agent at Level $k$ receives a task scoped under the dotted namespace `project.scope_1...scope_k`.
   - The agent reads the corresponding scope notes and parent scope notes to extract the goal, constraints, and strategy.
2. **Sub-Task Delegation**:
   - If the task requires specialized or concurrent execution, the Level $k$ agent breaks the task down into sub-scopes (`project.scope_1...scope_k.sub-scope`).
   - It defines and spawns a Level $k+1$ subagent using the platform-native mechanism (refer to [references/antigravity.md](references/antigravity.md) or [references/codex.md](references/codex.md)).
   - Provide the child agent with this prompt template:
     ```text
     You are an agent assigned to scope `<child-namespace>`.
     
     Start by analyzing the assigned scope using the `knowledge` skill:
     - read the project note and all parent notes down to `<child-namespace>`;
     - extract Objective, Constraints, Current strategy, and Immediate owner.
     
     If this task requires specialized or parallel execution, you are authorized to delegate sub-tasks recursively. Use the `coretext-agents` skill to configure, spawn, and integrate nested subagents.
     
     Execute this bounded task:
     <task details>
     
     Write your session log using the `knowledge` skill to `knowledge/ai/<child-namespace>.<session-name>.md`. Do not modify durable notes, parent notes, or rule files. Report back with changed files, verification, session note path, and recommended deltas.
     ```
3. **Execution and Compilation**:
   - The Level $k+1$ agent executes the task and writes a structured session log note under `knowledge/ai/project.scope_1...scope_k.sub-scope.[session-name].md`.
   - It notifies the parent agent and transitions to **Idle**.
4. **Ascending Distillation**:
   - The parent (Level $k$) agent reads the session log, verifies the changes, runs tests locally, distills stable deltas into the durable scope note, and reports status back to its parent (Level $k-1$).

---

## 5. Verification Checklist for Teamwork Audits

Ensure compliance at every level:
- [ ] **Role Mapping**: Do spawned subagent roles/names match their target scope namespaces?
- [ ] **Write Boundaries**: Did subagents write only to session logs, leaving durable scope notes to be updated by their parent?
- [ ] **Workspace Cleanliness**: Are there any untracked or transient markdown files remaining in the root folder or `.agents/`?
- [ ] **Workspace Configuration**: Did subagents inherit or share the workspace so they can access repository-local files and tools?
- [ ] **Communication Protocol**: Were platform-native subagent and message APIs used correctly for orchestration (refer to [references/antigravity.md](references/antigravity.md) or [references/codex.md](references/codex.md))?
