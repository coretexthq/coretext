# Codex Transcript Export

This document explains how to export the original transcript of a Codex conversation into the workspace session archive.

## Destination

Store the exported transcript here:

`/Users/mac/Git/coretext/.coretext/sessions/codex/<conversation-id>.jsonl`

Use the Codex conversation id as the filename, without changing it.

## Source

Codex keeps the original transcript in the user session store under a dated rollout file. The exact path varies by day, but it is usually located under:

`/Users/mac/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<conversation-id>.jsonl`

If you do not know the exact file, search the Codex session store for the conversation id.

## Conversation Id

For the current Codex thread, use the thread/session id from the Codex metadata as the conversation id.

Example:

`019e90f8-b28d-7832-adeb-d12031b97802`

## Export Steps

1. Read the conversation id from the Codex thread metadata.
2. Locate the matching transcript file in `~/.codex/sessions`.
3. Create the destination directory if it does not already exist:

```bash
mkdir -p /Users/mac/Git/coretext/.coretext/sessions/codex
```

4. Copy the original transcript into the workspace archive using the conversation id as the filename:

```bash
cp "/Users/mac/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<conversation-id>.jsonl" \
   "/Users/mac/Git/coretext/.coretext/sessions/codex/<conversation-id>.jsonl"
```

5. Verify the export:

```bash
ls -l "/Users/mac/Git/coretext/.coretext/sessions/codex/<conversation-id>.jsonl"
```

## Notes

- Copy the transcript as-is. Do not edit the JSONL contents.
- Keep the filename identical to the conversation id so the archive stays easy to index.
- If multiple Codex transcripts exist for the same day, use the one whose filename ends with the target conversation id.
