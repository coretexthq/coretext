# React Flow Expensive Layouts

**Trigger:** Implementing physics or expensive force-layouts (e.g. d3-force) inside React Flow

## Context
The React application displayed a blank screen and froze the browser due to an infinite rendering loop. The highlighted node list was generating a brand new array reference every 2 seconds, which triggered the expensive `d3-force` physics layout simulation on every single render loop.

## Axiom
Decouple physics layout execution from minor state updates (like highlighting). Use a `structuralKey` (derived from a sorted list of node and edge IDs) to ensure the layout only runs when the graph structure changes, and use a separate, lightweight `useEffect` to synchronize node data.