# Exporting Antigravity Transcripts

Follow these steps to locate and export the raw Antigravity conversation transcript:

## Source Location
Antigravity stores full conversation transcripts on the local file system:
`~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`

## Target Destination
Export directory: `./.coretext/sessions/antigravity/`
Filename format: `<conversation-id>.jsonl`

## Export Steps

1. Identify the current Antigravity conversation ID from request metadata (e.g. a UUID).
2. Create the destination directory:
   ```bash
   mkdir -p .coretext/sessions/antigravity
   ```
3. Copy the transcript file into the workspace archive:
   ```bash
   cp "~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl" \
      "./.coretext/sessions/antigravity/<conversation-id>.jsonl"
   ```
4. Verify the exported file:
   ```bash
   ls -la "./.coretext/sessions/antigravity/<conversation-id>.jsonl"
   ```

