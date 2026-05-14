# React Flow Custom Nodes

**Trigger:** Creating custom nodes in React Flow

## Context
React Flow edges were not rendering between custom nodes.

## Axiom
Always add explicitly hidden `<Handle>` components (top, bottom, left, right) to the `CustomNode` so React Flow can attach edges.