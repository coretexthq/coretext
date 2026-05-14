# Dashboard Session State Management

**Trigger:** Fetching highlights for multiple selected sessions

## Context
Selecting multiple sessions required updating both nodes and managing the state across fetches.

## Axiom
Explicitly track `availableSessions` and `selectedSessions` in state, and use `useEffect` dependency tracking to dynamically reconstruct the `/api/highlights?sessions=` url and retrieve combined node lists.