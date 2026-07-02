# Codex Subagent Orchestration

On the Codex platform, translate the conceptual namespace hierarchy into file-based configuration layers. To support nested architecture, subagents must inherit configuration and tool access from the parent agent.

## 1. Defining Custom Agents (Workspace & Skill Inheritance)
Create a TOML file under `.codex/agents/<name>.toml` (or `~/.codex/agents/` for global agents):
- **`name`**: Set to the dotted namespace (e.g., `project.scope-1.child-scope`).
- **`description`**: Guidance for when Codex should activate it.
- **`developer_instructions`**: The child prompt template and workflow rules.
- **Inheritance**: Optional fields like `skills.config` and MCP servers automatically inherit from the parent session if omitted. Make sure you do not override `skills.config` in a way that disables local skills, so the subagent can continue using the `coretext-agents` and `knowledge` skills.

## 2. Enabling Nesting Depth
By default, Codex caps subagent depth at `1` (`agents.max_depth = 1`), which prevents subagents from spawning further descendants.
- To enable nesting architecture, ensure that `agents.max_depth` is configured to `2` or higher in the parent or project configuration TOML.

## 3. Spawning & Communication
Direct Codex to spawn the defined custom agent by name. For massive parallel checks or batch runs, use the `spawn_agents_on_csv` tool. Subagent threads consolidate back to the parent session upon completion.
