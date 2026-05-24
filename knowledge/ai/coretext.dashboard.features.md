## Summary
Implemented a series of state and graph selection features in the Coretext Visualization Dashboard to expand its utility across different workspaces and execution histories:
1. **Session Selection:** Users can select and visualize specific sessions from the `.coretext/sessions/` directory. The backend `server/index.js` was updated to serve an `/api/sessions` endpoint and accept a `?sessions=` query parameter on `/api/highlights` to filter multiple sessions concurrently.
2. **Log Ingestion:** Added a UI button and an `/api/ingest` backend endpoint to convert legacy `.json` payload logs in `.coretext/logs/` into `.jsonl` session files, allowing archived sessions to be dynamically loaded onto the graph.
3. **Dynamic Graph Selection:** The dashboard no longer relies on a hardcoded `coretext.jsonl` graph structure. It scans `.coretext/` for available project graphs (e.g., `coretext--visualization.jsonl`) and populates a new dropdown selector in the UI. Python scripts (`coretext_engine.py`, `visualize_graph.py`) were also updated to resolve their primary graph based on the workspace name.

## Highlights
- A new UI was added directly into the Coretext Graph overlay, providing a list of all active or archived sessions, as well as a Graph Source dropdown.
- Users can now select multiple `.jsonl` session files simultaneously, and the graph highlights nodes referenced by all selected sessions.
- Default fallback ensures the latest session is highlighted if no selection is explicitly made, and the graph defaults to the current workspace's graph structure file.
- Cleaned up legacy markdown logs from the `.coretext/logs/` directory and stripped out obsolete debug file logging (`payload_debug.log`) from the `notify_action.py` hook payload handler.

## Problems & Solutions
- **Problem**: Selecting multiple sessions required updating both nodes and managing the state across fetches.
  - **Solution**: The `App.tsx` state was refactored to explicitly track `availableSessions` and `selectedSessions`, using `useEffect` dependency tracking to dynamically reconstruct the `/api/highlights?sessions=` url and retrieve combined node lists.
- **Problem**: Accidental JSX duplication caused Vite compilation errors during implementation (`error TS1128: Declaration or statement expected`).
  - **Solution**: Reverted and surgically replaced the trailing malformed JSX tag within `CoretextGraph.tsx` to cleanly wrap the `ReactFlow` UI components.
- **Problem**: Implementing dynamic graphs broke prop-type definitions resulting in TypeScript build failures (`Cannot find name 'availableGraphs'`).
  - **Solution**: Expanded the `CoretextGraphProps` interface to account for `availableGraphs`, `selectedGraph`, and `onSelectGraph` before piping state down from `App.tsx`.

## Related Notes
- [[coretext.dashboard.visualization|Coretext Visualization Dashboard]] - Base dashboard architecture.
- [[coretext.dashboard.visual_feedback|Visual Feedback Hook Implementation]] - Information on how session `jsonl` logs are generated.

## Updates
- **Packaging:** Moved the entire `coretext-graph-ui` application into the `.coretext/` directory (`.coretext/coretext-graph-ui/`). This ensures the visualization dashboard is naturally bundled alongside the engine state and can be cleanly packaged via the `sync_coretext.sh` script, making it portable across environments. Relevant path references in `AGENTS.md`, `README.md`, and skills have been updated.
