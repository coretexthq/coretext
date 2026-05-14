# React Flow Overlapping Edges

**Trigger:** Implementing edges between nodes in React Flow

## Context
Edges were crossing through nodes and overlapping perfectly on straight lines, making them illegible.

## Axiom
Implement a `SmartEdge` component using calculated shortest-path connections and `getBezierPath` to allow edges to fan out organically without perfect overlap.