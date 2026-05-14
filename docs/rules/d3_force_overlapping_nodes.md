# D3 Force Overlapping Nodes

**Trigger:** Implementing a force-directed graph with d3-force

## Context
Force-directed nodes were overlapping and heavily clustered.

## Axiom
Integrate `forceCollide` with a physical node radius, expand the `forceLink` distance, and apply category-based `forceY` gravity to cleanly separate layers and prevent collision.