# Coretext Dashboard

## Status
- Current state: a hidden Vite/React dashboard in `.coretext/coretext-graph-ui/` that visualizes the graph, sessions, and highlights.
- The UI now tracks `availableSessions`, `selectedSessions`, `availableGraphs`, and `selectedGraph`, then rebuilds highlight fetches from those selections.
- The dashboard is driven by `/api/graph`, `/api/graphs`, `/api/sessions`, and `/api/highlights` responses from the local server.

## Key Components
- Graph visualization for the current edge set.
- Multi-session highlight selection and combined node lists.
- Graph selection so the view can switch away from the default `coretext` graph.
- Session-backed visual feedback from `.coretext/sessions/*.jsonl`.

## Resource
- [[coretext.dashboard.visualization]]
- [[coretext.dashboard.features]]
- [[coretext.dashboard.fixes]]
- [[coretext.dashboard.packaging]]
- [[coretext.dashboard.visual_feedback]]
- `docs/rules/dashboard_session_state.md`
