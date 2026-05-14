# Gemini CLI Hook Payload Structure

**Trigger:** Debugging hook failures in sandbox testing.

## Context
The context injection hooks failed to trigger or evaluate file paths properly because they were referencing deprecated or incorrect fields (`toolName`, `toolParameters`, `hookType`) when parsing `stdin`. Additionally, the file-modification block hook (`BeforeTool`) wasn't triggering for the `replace` tool because the `matcher` in `settings.json` was restricted only to `write_file`.

## Axiom
- Hooks interacting with the Gemini CLI MUST parse payload inputs using `tool_name`, `tool_input`, and `hook_event_name`. 
- Hook matchers designed to guard file modifications MUST include `write_file|replace` to catch all common file editing tools utilized by agents.

## Linked Files
- .coretext/inject_context.py
- .gemini/settings.json
