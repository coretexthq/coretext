# Coretext Unified Agent Instruction (Child Contract)

This instruction is the portable operating contract for any Coretext agent working in a normal software development repository, at any depth: project, scope, sub-scope, or nested sub-scope. It packages the repository-level rules, knowledge-note workflow, hierarchy ownership model, and recursive subagent protocol into one file.

Use this file as the first instruction for any Coretext software development session or delegated Coretext work session. The agent does not need experiment-specific context to follow this protocol. Do not require the agent to read `AGENTS.md`, the `knowledge` skill, the `coretext` skill, or `docs/coretext_subagents.md` to understand the operating protocol; those files are provenance for this consolidated contract.

---

## 1. Authority and Boundaries

### Source of Truth

The authoritative state is:

1. durable notes in `knowledge/` outside `knowledge/ai/` (including project and scope notes)
2. `docs/` (technical specifications and system contracts)
3. repository code and Git state

Session notes under `knowledge/ai/` are evidence, not current policy. Do not change architecture, rules, or durable notes merely to justify a code change.

### Scope Discipline

Plan and execute only the immediate assigned step. Do not invent a broad roadmap. If the task requires future work, record it in the closest owning durable note's `# Backlog` or in the session summary handoff.

Use `./` for the repository root and `~/` for the global home root when writing paths in notes.

Never read, list, or reference files under `archive/`.

### Language and Link Rules

Use direct, searchable English. Avoid slang, unexplained jargon, and filler.

Use wikilinks only for existing notes. Wikilinks must be short basenames without folder paths and without `.md`; after substituting the real note basename, write `[[<namespace>]]`, not `[[knowledge/<namespace>.md]]`.

For session logs under `knowledge/ai/`, you may cite them under the `# Resource` section of parent notes or summaries using their path relative to the repository root as plain text (e.g. `knowledge/ai/project.scope.session.md`), or as standard markdown file links, rather than formatting them as wikilinks.

Use dots for hierarchy and hyphens inside multi-word filename segments:

- `knowledge/<project>.<scope-1>.md`
- `knowledge/<project>.<scope-1>.<scope-2>.md`
- `knowledge/ai/<project>.<scope-1>.<scope-2>.<session-name>.md`

---

## 2. Assigned Scope Model

Every Coretext agent has one assigned dotted namespace:

- project level: `<project>`
- one level below project: `<project>.<scope-1>`
- two levels below project: `<project>.<scope-1>.<scope-2>`
- any deeper level: `<project>.<scope-1>...<scope-n>`

Each segment after `<project>` is a flexible scope label. A scope is any durable ownership boundary in the project; its meaning comes from the existing note hierarchy and the work it owns, not from examples in this instruction. Infer what the scope means from the nearest durable notes, linked session evidence, current task, and user direction.

Scope depth is theoretically unbounded, but agents should prefer the shallowest namespace that can responsibly own the work. Create or delegate a deeper scope only when the parent scope would otherwise mix distinct objectives, constraints, backlog, verification, or reusable session evidence. Do not split merely because a task touches multiple files, could be categorized more finely, or would look cleaner as a tree.

The namespace maps to files:

- project note: `knowledge/<project>.md`
- durable scope note: `knowledge/<namespace>.md`
- session log: `knowledge/ai/<namespace>.<session-name>.md`
- parent chain: `knowledge/<project>.md` -> `knowledge/<project>.<scope-1>.md` -> `knowledge/<project>.<scope-1>.<scope-2>.md` -> `...` -> `knowledge/<namespace>.md`

If no namespace is provided, infer the most specific existing `knowledge/` note from the user request and touched files. Ask one short clarifying question only if multiple scopes are equally plausible and choosing one would risk writing to the wrong durable owner.

---

## 3. Mandatory Start: Analyze the Assigned Scope

Before proposing architecture, editing files, spawning subagents, or writing summaries, analyze the assigned scope.

1. Traverse the note hierarchy sequentially from the project MOC to the assigned scope:
   - derive `<project>` from the first segment of `<namespace>`;
   - read `knowledge/<project>.md`;
   - read each parent scope note in order, from `knowledge/<project>.<scope-1>.md` down to the assigned namespace;
   - read the assigned durable note if it exists;
   - inspect directly linked neighboring notes and prior session logs only when they are relevant to the immediate task.
2. Extract the working orientation into your own context:
   - Objective: what this task is trying to accomplish.
   - Constraints: rules, boundaries, or project claims that must not be violated.
   - Current strategy: the approach implied by parent and scope notes.
   - Rejected paths and evidence: prior failures, warnings, or reasons not to repeat an approach.
   - Immediate owner: the durable note that owns backlog and stable deltas for this task.
3. If the assigned durable note does not exist:
   - use the nearest existing parent note as the control surface;
   - create the new durable note only when the task explicitly requires a new scope or the parent backlog clearly delegates to it.
4. If the requested work conflicts with parent constraints:
   - state the conflict as a proposed constraint change;
   - do not implement it as a normal fix unless the user explicitly asked for architectural reconsideration.

This orientation step applies recursively at every depth. A child agent must still analyze its assigned scope and parent chain rather than relying on the parent agent's chat context.

When resuming or integrating delegated work, an agent must read the direct child session summaries it intends to integrate before changing durable scope notes. Do not update stable state from a child chat report alone.

---

## 4. Explore, Plan, and Work

Use progressive disclosure:

1. Search first with `rg` or `rg --files`.
2. Read only the files needed to understand the assigned scope and immediate task.
3. Prefer existing codebase patterns and project notes over new abstractions.
4. Keep edits scoped to the module, note, or document that owns the immediate task.
5. Verify with the available tests, linters, builds, scripts, or focused review. If verification cannot be run, explain why in the session summary and final handoff.

Do not create transient coordination files such as `progress.md`, `tasks.md`, `ORIGINAL_REQUEST.md`, or scratch plans in the repository root, `.agents/`, or other shared directories. Working evidence belongs in `knowledge/ai/` session logs.

---

## 5. Hierarchy and Recursive Subagent Protocol

The working hierarchy is:

```text
project durable note -> scope durable notes -> session evidence -> optional parent-created rules
```

The delegation tree must match the knowledge-note tree. A subagent exists only for a specific child namespace. A session is evidence attached to a namespace; it is not a substitute for the durable note at that namespace.

### When to Delegate

Delegate only when the task benefits from isolation, specialization, or parallel execution. Do not spawn subagents merely to imitate a hierarchy.

### Child Agent Naming

For a parent scope `project.scope_1...scope_k`, every child subagent must use:

- `Role`: `project.scope_1...scope_k.child-scope`
- durable target note: `knowledge/project.scope_1...scope_k.child-scope.md`
- session log prefix: `knowledge/ai/project.scope_1...scope_k.child-scope.<session-name>.md`

The `Role` must exactly match the dotted namespace. This is the identity of the agent.

The child's `<session-name>` MUST inherit the active descriptive `<parent-session-name>` passed by the parent agent. The child must never fallback to generic sequential names like `session-1` or select a random name.

### Write Boundaries

Separate worker execution from parent integration.

- A leaf or delegated worker may modify code, tests, documentation, and other task files required by the bounded task.
- A leaf or delegated worker writes its own append-only session log under `knowledge/ai/<worker-namespace>.<session-name>.md`.
- A leaf or delegated worker must not modify durable notes in `knowledge/`, parent notes, or sibling notes. It must also not modify code files or resources belonging to sibling namespaces (e.g. a `sub-scope-1` agent must not edit code belonging to `sub-scope-2`).
- Any task requiring modifications across multiple sibling scopes must be executed by the parent agent (e.g. the `project.scope-1` agent) or decomposed into isolated sub-tasks delegated to their respective child agents and integrated by the parent.
- The direct parent or integrating agent must read each direct child session summary that it integrates.
- The direct parent or integrating agent writes stable deltas to the durable note that owns those deltas:
  - update `knowledge/<child-namespace>.md` when the child session produced stable state for that child scope;
  - update `knowledge/<parent-namespace>.md` only for parent-level strategy, backlog, coordination, or summary state.
- If the parent integration is a meaningful work session, the parent writes its own session log under `knowledge/ai/<parent-namespace>.<session-name>.md`.
- In a single-agent session with no delegation, the same agent may perform both phases: first write the session evidence, then distill stable deltas into `knowledge/<namespace>.md`.

Do not skip levels. A project note lists direct scope children. A scope note lists direct sub-scope children. A sub-scope note lists its own direct child scopes or session evidence. Do not list grandchildren directly when an intermediate scope note exists.

### Workspace and Skill Access

Use a shared or inherited workspace when the runtime supports that choice, so the child can access repository-local notes and tools. If the runtime supports isolated worktrees, use them only when the parent can integrate the result and the task justifies the overhead.

### Child Prompt Template

When spawning a child agent, include the full text of this instruction or give the child direct access to this file, then provide this task frame:

```text
You are a Coretext agent assigned to scope `<child-namespace>`.

Start by analyzing the assigned scope:
- derive `<project>` from `<child-namespace>` and read `knowledge/<project>.md`;
- read each parent note from root to `<child-namespace>`;
- read `knowledge/<child-namespace>.md` if it exists;
- extract Objective, Constraints, Current strategy, Rejected paths/evidence, and Immediate owner.

Execute this bounded task:
<task details>

Write your session log to `knowledge/ai/<child-namespace>.<parent-session-name>.md` (where `<parent-session-name>` is the name of the parent's active session, e.g. `session-1` or `evaluation-run-4`) using the Coretext session-note structure. Do not modify durable knowledge notes, parent notes, sibling notes, or rule files unless this prompt explicitly assigns you an integration role. Report back with changed files, verification, session note path, durable deltas recommended for the parent, and open risks.
```

### Mid-Session Communication

If you encounter a blocker, ambiguous requirement, or conflicting constraint mid-session:
- Do not make arbitrary assumptions or halt execution silently.
- Use the `send_message` tool to describe the blocker or conflict directly to your parent agent's conversation ID.
- Wait for a response or clarification before proceeding with the task.

### Parent Integration

After a child finishes:

1. **Verify, do not trust:** Read the child session note. Directly check the filesystem to verify that all claimed files, code modifications, and test scripts actually exist on disk and are correct.
2. **Execute tests:** Run the tests yourself inside the workspace Cwd to verify the child's verification claims. Reject the handoff if any tests fail, if code has security or design flaws, or if required test files are missing.
3. **Verify or review the child output** at the necessary level of code design and RBAC security gates.
4. **Distill only stable deltas** into the owning durable note.
5. **Decide whether the issue** is ordinary project knowledge or a rare rule escalation.
6. **Write the parent's own session log** when the integration work is meaningful.
7. **Report the integration result upward.**

This protocol scales to any nesting depth. Each level repeats the same orientation, execution, session evidence, parent review, and durable distillation loop.

---

## 6. Session Summary Requirements

Every meaningful Coretext work session must end with a session note under `knowledge/ai/`. Session notes are append-only evidence logs.

### Session Note File

Use:

```text
knowledge/ai/<namespace>.<session-name>.md
```

Template forms:

- `knowledge/ai/<project>.<scope-1>.<session-name>.md`
- `knowledge/ai/<project>.<scope-1>...<scope-n>.<session-name>.md`

Never invent a new scope in the filename. Derive the namespace from the durable note that owns the work.

### Session Note Structure

New session notes must use this exact structure:

```markdown
---
conversations: "<conversation_id>"
platform: "<agent_platform>"
description: "<Post-session 1-sentence quick status/overview of the session outcome.>"
---

# Resource
- [[context-note]]: why it mattered
> verbatim original user prompt

---

# Summary
Detailed results, decisions, handoff, changed files, verification, and unresolved risks.
```

If appending to an existing session note:

1. Convert `conversations` to a YAML list if needed.
2. Append the current conversation ID.
3. Refresh `description`.
4. Append the new body content at the bottom.
5. Do not rewrite, reorder, or delete existing body content.

Session notes may use multiple Level 1 body sections instead of one `# Summary` when the work naturally splits into reusable episodes. Do not insert `---` inside the body after the Resource-to-body separator.

### Original Prompt Preservation

Include all original user prompts available in the active context as blockquotes in `# Resource` or at the top of the relevant body section. Do not paraphrase the prompts when recording them as evidence.

---

## 7. Durable Note Requirements

Durable notes outside `knowledge/ai/` hold current state, strategy, and stable deltas. They are not transcripts.

Use this structure for new or substantially rewritten durable notes:

```markdown
Current state, overview, or condensed answer. Do not repeat the filename as a redundant title.

---

# Backlog
Open work owned by this exact scope. Omit this section when empty.

---

# Resource
- [[cross-section-note]]: why it matters

---

# Topic Title
Main durable body content, direct child scope links, decisions, constraints, or implementation notes.
```

Durable notes may contain at most two non-frontmatter `---` separators (or at most three if the optional `# Backlog` section is present). Do not use horizontal rules inside the body.

Use `# Resource` only for cross-section or additional evidence. Do not use it as a parent-child hierarchy index.

List direct child notes under Level 1 headings containing wikilinks:

```markdown
# [[<project>.<scope-1>]]
Short durable summary of the child scope.
```

Do not list grandchild notes when an intermediate child note exists.

Apply the smallest stable delta. Do not normalize or rewrite an entire durable note unless the task explicitly asks for normalization.

---

## 8. Rule Escalation & Context Routing

Rules are rare escalation artifacts, not the normal output of every session. The normal path is: write session evidence, then have the parent or integrating agent distill stable state into the owning durable scope note.

Under the direct-scope routing paradigm, confirmed architectural constraints are distilled directly into durable scope notes under `knowledge/` (e.g., `knowledge/trore.booking.validation.md`) rather than creating isolated rule files. The Coretext Kernel maps ledger trigger paths directly to these notes, which are routed to the agent dynamically during relevant operations.

### When a Rule/Constraint Is Appropriate

A constraint may be established only when all of these are true:

1. A session summary already exists and names the evidence.
2. The direct parent or integrating agent has read the session summary and reviewed the result.
3. The lesson is reusable, future-facing, and not already captured clearly in durable notes or docs.
4. The problem is significant enough to need deterministic reuse, such as:
   - an agent repeatedly misunderstood the same project boundary;
   - multiple fixes were needed because a hidden invariant was missed;
   - the issue caused long debugging or repeated rework;
   - the issue is critical for safety, data integrity, security, privacy, or repository governance.
5. The rule can be expressed as a hard constraint future agents should follow.

Leaf or delegated workers do not create constraints. They may recommend a possible constraint in their session summary. The parent or integrating agent decides after review.

### Pre-Work Graph Check

Before registering a new edge in the ledger, check the integrity of the graph ledger:

```bash
uv run .coretext/lint_graph.py
```

If the linter reports invalid or missing graph targets, run:

```bash
uv run .coretext/clean_graph.py
```

### Distilling a Constraint

If the parent or integrating agent confirms that a new constraint is needed, distill it directly into the relevant durable note under `knowledge/` (or the project MOC note) under a clearly designated constraints section using this format:

- **Trigger:** Goal, pattern, or codebase area when the rule applies.
- **Context:** Background, what was attempted, and the lesson learned.
- **Axiom:** The hard architectural constraint/instruction to follow.

### Register Routing (Add Edges)

Link the affected codebase source paths to the durable scope note containing the constraints using the ledger script:

```bash
uv run .coretext/add_rules.py --source "<source>" --target "<target>" --type <full|hint> --description "<intent>" --hook <read|write|both>
```

Parameters:
- `--source`: Path to the source file or glob pattern (e.g., `src/api/auth.py`, `src/**/*.tsx`).
- `--target`: The relative path to the durable note under `knowledge/` containing the rules/constraints (e.g., `knowledge/coretext.workflow.md`).
- `--type`: `hint` is preferred for large durable notes to prevent context bloating, unless `full` (inject full text) is explicitly required.
- `--description`: Detailed intent or reason for the link.
- `--hook`: `read`, `write`, or `both` (default). Specifies whether context is injected when reading, writing, or both.

### Rule Deprecation & Ledger Schema

#### Ledger Location
The event ledger is stored as a JSON Lines (JSONL) file under the workspace data directory:
`.coretext-data/{workspace_name}_rules.jsonl`

#### Schema Transparency
Each entry in the `.jsonl` file must match the following JSON schema:
```json
{
  "source": "string (glob pattern or filepath to match, e.g. 'src/api/auth.py')",
  "target": "string (relative path to target note, e.g. 'knowledge/auth.workflow.md')",
  "type": "string ('hint' or 'full')",
  "description": "string (detailed intent of the link)",
  "hook": "string ('read', 'write', or 'both')"
}
```

#### Manual Edge Deprecation / Deletion
Because the CLI helper `add_rules.py` only supports adding rules, removing or deprecating an edge must be done manually:
1. Open the `.coretext-data/{workspace_name}_rules.jsonl` file.
2. Find the JSON line matching the obsolete `source` and `target` edge you wish to remove.
3. Delete that line from the file.
4. Save the file.

---

## 9. Completion Handoff

When finishing a task or reporting back to a parent, include:

- assigned namespace;
- session note path;
- direct child session summaries read, if any;
- durable notes updated;
- rules or graph edges added by a parent or integrating agent;
- code/docs changed;
- verification performed and result;
- open risks or exact next action, if any.

If no durable note update or rule escalation was appropriate, say so explicitly.

---

## 10. Teamwork Audit Checklist

Use this checklist when reviewing Coretext multi-agent work:

- Role mapping: every subagent role exactly matches its dotted scope namespace.
- Scope orientation: every agent started by reading the project note, parent notes, and assigned scope note.
- Write boundaries: delegated workers wrote code/task files and their own `knowledge/ai/` session logs, not durable notes or rules.
- Parent integration: parent agents read direct child session summaries before durable-note updates.
- Session structure: session notes include YAML front matter, `# Resource`, original prompts, and body summary sections.
- Durable structure: durable notes use the shared structure, direct child wikilinks, and no hierarchy skipping.
- Root cleanliness: no transient coordination files were created in the repository root or `.agents/`.
- Rule lifecycle: any rule was created only by a parent or integrating agent after reviewing session evidence, and routed only when deterministic reuse was justified.
- Verification: changed code, docs, or notes were checked with the appropriate tests, linters, scripts, or focused review.
