# Gemini CLI Hooks

In Gemini CLI, hooks are scripts or programs executed at specific points in the agentic loop, allowing for interception and customization of behavior (such as adding context, validating actions, or enforcing policies).

## How Hooks Work
- **Execution:** Hooks run **synchronously** within the agent loop. The CLI waits for all matching hooks to complete before proceeding.
- **Communication:** Hooks communicate via standard streams:
  - **Input (`stdin`):** Receives a JSON object containing session context and event-specific data.
  - **Output (`stdout`):** Must return a single JSON object. **Crucially, no other text (e.g., from `echo` or `print`) can be sent to `stdout`.**
  - **Logging (`stderr`):** Used for all debugging and logs; the CLI captures but does not parse this.
- **Exit Codes:**
  - `0`: Success; the `stdout` is parsed as JSON.
  - `2`: **System Block**; the action is aborted, and `stderr` is shown as the reason.
  - `Other`: Warning; the CLI continues with a warning.

## Configuration in `settings.json`
Hooks are configured under the `"hooks"` key in `settings.json`. They are grouped by event name and use **matchers** (regex for tools, exact strings for lifecycle events) to determine when they fire.

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|run_shell_command",
        "sequential": true,
        "hooks": [
          {
            "name": "security-scanner",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.hooks/scanner.sh",
            "timeout": 10000
          }
        ]
      }
    ]
  },
  "hooksConfig": {
    "enabled": true,
    "notifications": true
  }
}
```

## Payload Formats
All hooks receive a base payload including `session_id`, `transcript_path`, `cwd`, `hook_event_name`, and `timestamp`.

### BeforeTool Hook
Executed before a tool is invoked. Used for argument validation or parameter rewriting.
- **Input (`stdin`):**
  ```json
  {
    "tool_name": "string",
    "tool_input": "object",
    "mcp_context": "object?",
    "original_request_name": "string?"
  }
  ```
- **Output (`stdout`):**
  - `decision`: Set to `"deny"` to block execution.
  - `reason`: Required if denied; sent to the agent as a tool error.
  - `hookSpecificOutput.tool_input`: An object that **overrides** the model's original arguments.

### AfterTool Hook
Executed after a tool completes. Used for auditing results or injecting follow-up actions.
- **Input (`stdin`):**
  ```json
  {
    "tool_name": "string",
    "tool_input": "object",
    "tool_response": { "llmContent": "any", "returnDisplay": "string", "error": "any?" },
    "mcp_context": "object?",
    "original_request_name": "string?"
  }
  ```
- **Output (`stdout`):**
  - `decision`: Set to `"deny"` to hide/replace the tool result from the agent.
  - `reason`: Required if denied; replaces the tool result sent to the model.
  - `hookSpecificOutput.additionalContext`: Text appended to the tool result for the agent.
  - `hookSpecificOutput.tailToolCallRequest`: `{ "name": "string", "args": "object" }` to trigger an immediate follow-up tool call.
