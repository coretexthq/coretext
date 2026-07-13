# Parent Agent Orchestration Workflow

Use this workflow to configure, spawn, and integrate nested subagents when you are the parent agent (Level $k$) managing a task scoped under a dotted namespace (e.g. `project.scope_1...scope_k`).

---

## 1. When to Delegate

Delegate only when the task benefits from isolation, specialization, or parallel execution. 
*   **Do not** spawn subagents merely to imitate a hierarchy.
*   **Do not** split a task into nested sub-scopes if it can be solved cleanly within the parent scope.
*   **Do not** create sub-scopes merely because a task touches multiple files, could be categorized more finely, or would look cleaner as a tree.

---

## 2. Platform Invocation & Setup

To define and invoke subagents on the active platform, refer to the platform-specific integration guides:

- **Google Antigravity Platform**: Read [references/antigravity.md](antigravity.md) to register subagents dynamically with workspace and skill inheritance.
- **OpenAI Codex Platform**: Read [references/codex.md](codex.md) to configure custom TOML definitions and enable depth scaling.

*Ensure that the child agent inherits/shares the parent workspace so that it automatically inherits all repository-local skills (like `coretext-agents` and `knowledge`).*
* **Session Identity Extraction**: Before spawning any child agents, the parent agent must inspect its own active session log filename to extract its descriptive session name (e.g., extracting `decouple-and-align` from `knowledge/ai/project.scope.decouple-and-align.md`).
* **Session Forwarding**: The parent must substitute `<parent-session-name>` in the Child Prompt Template with this extracted descriptive session name. It is prohibited from passing generic session names like `session-1`.

---

## 3. Parent Integration & Verification Loop

Once a child agent transitions to **Idle** and reports back, you must verify their changes:

1. **Verify, do not trust**: Read the child session log. Directly check the filesystem to verify that all claimed files, code modifications, and test scripts actually exist on disk and are correct.
2. **Execute tests**: Run the tests yourself inside the workspace directory (`Cwd`) to verify the child's validation claims. Reject the handoff if any tests fail, if code has design/security flaws, or if required test files are missing.
3. **Distill stable deltas**: Extract only the stable deltas (current state changes, confirmed constraints, changed strategy, rejected paths) and write them directly into the child's durable scope note (`knowledge/<child-namespace>.md`) or parent scope note.
4. **Link references**: Link the child's session log in the body of the child's durable scope note under a Level 1 heading (e.g., `# [[ai/project.scope.session]]`).
5. **Write parent session log**: If the integration work is a meaningful session, log it in the parent session file `knowledge/ai/<parent-namespace>.<session-name>.md`.
6. **Handoff Rejection & Recovery**: If a child's changes fail verification or tests:
   - Do not integrate the broken work.
   - Send a message back to the child agent (using `send_message` with its `conversationID`) detailing the failure logs or boundary violations.
   - If the subagent is stuck, cannot recover, or repeatedly fails, terminate its execution thread (using `manage_subagents` with action `kill` and `ConversationIds`) and either resolve the changes directly in your parent session or re-route the task.

---

## 4. Concurrent Execution & Workspace Sharing

When spawning multiple child agents in a shared repository directory (using `Workspace: "inherit"` or `"share"`), they share the same physical folder and file system.
- **Sequential Execution**: Run subagents sequentially if they run terminal commands that compile assets, install dependencies, or run tests to avoid database lock contention and build cache corruption.
- **Branching Workspaces**: If parallel execution is required, spawn the subagents in isolated workspaces (using `Workspace: "branch"`) to prevent write collisions. You can then review and integrate their individual changes systematically.

---

## 5. Teamwork Audit Checklist

Verify compliance before completing your integration task:

- [ ] **Role Mapping**: Do all spawned child roles match their target dotted namespace?
- [ ] **Session Name Inheritance**: Did child session logs inherit the active session name of the parent (e.g. `knowledge/ai/<child-namespace>.<parent-session-name>.md`)?
- [ ] **Sibling Scope Isolation**: Did child agents restrict their modifications to their own namespaces (no edits to sibling code or documentation)?
- [ ] **Write Boundaries**: Did child agents write only to session logs, leaving durable scope updates to you (the parent)?
- [ ] **Workspace Cleanliness**: Are there any untracked or transient markdown files remaining in the root folder or `.agents/`?
- [ ] **Verification**: Were changed code, docs, and notes checked with appropriate local tests or scripts?
