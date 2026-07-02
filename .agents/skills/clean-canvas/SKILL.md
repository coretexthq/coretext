---
name: clean-canvas
description: Gradually ingests floating text boxes in a JSON Canvas file (`.canvas`) into the correct durable notes in the vault. It prioritizes integrating the content into notes already present on the canvas, reports its plan for human approval, and then automatically cleans the canvas using a self-contained script.
---

### Prerequisites
When using this skill, you MUST also activate the `json-canvas` and `knowledge` skills to properly parse canvas files and follow the correct knowledge architectural rules.

### Workflow

1. **Analyze Canvas Context:**
   - Read the target `.canvas` file.
   - Identify all floating `text` nodes.
   - Identify all `file` nodes (durable notes) already placed on the canvas. These represent the immediate context.

2. **Map to Destinations:**
   Determine the best target destination for each `text` node using the following hierarchy:
   - **Primary Target:** Map to the `# Backlog` section of a relevant stable note (project/scope/sub-scope) that is *already present* in the canvas. Use spatial proximity and explicit text mentions to determine relevance.
   - **Secondary Target:** If no note in the canvas is relevant, map to the `# Backlog` of a relevant stable project/scope note elsewhere in the vault.
   - **Fallback Target:** If the text node is a standalone thought not tied to a specific project, create an independent note within `resource/`. **DO NOT** save these to `ai/`, as these are raw human notes, not AI session logs.

3. **MANDATORY - Report and Wait:**
   **BEFORE** making any file edits to the vault or the canvas, you MUST present a structured summary of your proposed changes to the user.
   Your report must include for each node:
   - Node ID and a brief snippet of its content.
   - Proposed destination file path.
   - Rationale for the mapping (e.g., "Placed near coretext.md", "Mentions an architectural rule").
   
   After presenting the plan, **stop and ask the user:** "Does this mapping look correct? Shall I proceed with the ingestion?"

4. **Execute Ingestion:**
   Once the user approves the mapping, proceed to safely append or create the notes as planned.

5. **Clean the Canvas:**
   Remove the successfully ingested text nodes from the `.canvas` file using the provided self-contained Python script.

### Usage Example

```bash
# Preview changes before applying them
uv run scripts/remove_nodes.py path/to/target.canvas <node_id_1> <node_id_2> --dry-run --verbose

# Apply changes and output structured JSON
uv run scripts/remove_nodes.py path/to/target.canvas <node_id_1> <node_id_2>
```

**Note:** Script paths in execution blocks are relative to the skill directory root (`.agents/skills/clean-canvas/`).
