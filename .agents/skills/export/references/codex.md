# Exporting Codex Transcripts

Follow these steps to locate and export the raw Codex conversation transcript:

## Source Location
Codex stores session transcripts locally under a dated rollout file structure:
`~/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<conversation-id>.jsonl`

## Target Destination
Export directory: `./.coretext/sessions/codex/`
Filename format: `<conversation-id>.jsonl`

## Export Steps

1. Get the current Codex thread ID / conversation ID (e.g. a UUID).
2. Create the destination directory:
   ```bash
   mkdir -p .coretext/sessions/codex
   ```
3. Locate and copy the rollout transcript:
   ```bash
   cp "~/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<conversation-id>.jsonl" \
      "./.coretext/sessions/codex/<conversation-id>.jsonl"
   ```
4. Verify the copied file size and format:
   ```bash
   ls -la "./.coretext/sessions/codex/<conversation-id>.jsonl"
   ```

