# Exporting Antigravity Conversation Transcripts

This document explains how to locate and export the original JSON Lines (`.jsonl`) transcript of an Antigravity conversation to the workspace directory.

## Source Location

Antigravity stores full, chronological conversation transcripts on the local file system.

*   **App Data Directory:** `/Users/mac/.gemini/antigravity`
*   **Transcript Path:** `/Users/mac/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`

> [!NOTE]
> The `<conversation-id>` is a unique UUID assigned to each conversation. You can find this ID in the metadata provided with each request or by inspecting the directories inside `/Users/mac/.gemini/antigravity/brain/`.

## Target Location

Transcripts should be exported to the session directory within the `coretext` workspace, matching the conversation ID as the filename:

*   **Export Directory:** `/Users/mac/Git/coretext/.coretext/sessions/antigravity/`
*   **Filename Format:** `<conversation-id>.jsonl`

## Export Commands

### Copying and Renaming via Shell

To copy the transcript and rename it directly in a shell environment, execute:

```bash
# Define conversation ID
CONV_ID="c3ba7e98-c215-4501-bd65-905aab09a773"

# Create destination directory
mkdir -p /Users/mac/Git/coretext/.coretext/sessions/antigravity

# Copy and rename the transcript file
cp "/Users/mac/.gemini/antigravity/brain/${CONV_ID}/.system_generated/logs/transcript.jsonl" \
   "/Users/mac/Git/coretext/.coretext/sessions/antigravity/${CONV_ID}.jsonl"
```
