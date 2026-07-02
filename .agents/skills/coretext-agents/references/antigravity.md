# Antigravity Subagent Orchestration

On the Antigravity platform, translate the conceptual namespace hierarchy into the built-in inter-agent communication tools. To support nested architecture, subagents must inherit configuration and tool access from the parent agent.

## 1. Defining Subagents (Nesting Support)
Use the `define_subagent` tool to register a child agent dynamically:
- **`name`**: Set to the child's dotted namespace (e.g. `project.scope-1.child-scope`).
- **`system_prompt`**: Include the child prompt template and workflow rules.
- **`enable_subagent_tools`**: Must be set to `true` to allow the child to spawn its own subagents recursively (nesting architecture).
- **`enable_write_tools`**: Set to `true` if the child needs to execute terminal commands or write files.

## 2. Invoking Subagents (Workspace & Skill Inheritance)
Call the `invoke_subagent` tool to spawn the child:
- **`Role`**: Set to the exact dotted namespace of the child scope.
- **`Workspace`**: Set to `"inherit"` or `"share"`. This is critical: it shares the parent's underlying repository directory so that the subagent automatically discovers and loads the repository-local skills (like `coretext-agents` and `knowledge`).
- **`Prompt`**: Pass the initial task prompt.

## 3. Communication & Handoff
Use the `send_message` tool to pass follow-up instructions or query the status of a subagent using its unique `conversationID`. Avoid polling; the platform notifies you automatically when messages arrive.
