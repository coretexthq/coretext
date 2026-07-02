---
name: export
description: Instructions on how to locate and export conversation transcripts for Codex and Antigravity, and reformat them into unified tool call histories.
---

# Export Router

Use progressive disclosure. Identify the active agent, then read only the single matching workflow reference note:

## Direct Routing
Choose the reference note matching the active agent:
- **Codex**: Read [references/codex.md](references/codex.md).
- **Antigravity**: Read [references/antigravity.md](references/antigravity.md).

## Reformatting Telemetry
Once the raw transcript is exported to either `.coretext/sessions/codex/<conversation-id>.jsonl` or `.coretext/sessions/antigravity/<conversation-id>.jsonl`, run the ingestion script to reformat it into a unified tool call history file in `.coretext/sessions/<conversation-id>.jsonl`:

```bash
python3 .coretext/ingest_transcript.py
```
Or for a specific file:
```bash
python3 .coretext/ingest_transcript.py .coretext/sessions/<agent-dir>/<conversation-id>.jsonl
```

## Mapping and Querying Telemetry Sessions
To resolve session conversation IDs (UUIDs) to their human-readable, friendly labels (derived from the frontmatter of `knowledge/ai/*.md` summary notes), or to inspect session telemetry highlights, run:

### List Mapped Sessions
```bash
python3 .coretext/note_hierarchy.py sessions
```
This prints a JSON structure containing mapped session filenames and their friendly summary-derived labels.

### Fetch Highlights for Sessions
```bash
python3 .coretext/note_hierarchy.py highlights --sessions <session_filename_1>,<session_filename_2>
```
For example:
```bash
python3 .coretext/note_hierarchy.py highlights --sessions session_abc.jsonl
```
This prints a JSON structure with the list of touched files and their associated tool action categories (`read`/`write`).
