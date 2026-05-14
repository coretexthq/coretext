# Gemini CLI Hook Merging

**Trigger:** Configuring multiple Gemini CLI hooks for the same event

## Context
The Gemini CLI stopped evaluating hooks after the first matching regex, meaning the visual feedback hook didn't fire if the `read_file` context injector matched first.

## Axiom
Merge matchers in `.gemini/settings.json` so that multiple hooks for the same regex are defined under the same matcher block to guarantee all execute.