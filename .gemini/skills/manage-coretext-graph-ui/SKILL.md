---
name: manage-coretext-graph-ui
description: Maintain, debug, and extend the Coretext Visualization Dashboard. Use this skill whenever you need to modify the React-based graph UI, fix layout overlaps, restore missing edges, or update the backend data parser for the knowledge graph.
---

# Manage Coretext Graph UI

This skill covers the maintenance and extension of the `coretext-graph-ui` project, which provides an interactive force-directed visualization of the Coretext system state.

## Triggers
- "Update the visualization dashboard"
- "Fix overlapping nodes or edges in the graph"
- "Edges are not showing up in the graph UI"
- "Add a new node category or color to the visualization"
- "Reset button is not working in the dashboard"

## Directory Structure
- `coretext-graph-ui/`: Root of the visualization project.
- `coretext-graph-ui/server/index.js`: Express backend that parses `.coretext/coretext.jsonl`.
- `coretext-graph-ui/src/core/CoretextGraph.tsx`: Main React Flow component with `d3-force` logic.
- `coretext-graph-ui/src/App.tsx`: Frontend entry point and data polling logic.

## Procedures

### 1. Extending the Backend Parser
The backend converts JSONL entries into Graph nodes and edges.
- **Location**: `coretext-graph-ui/server/index.js`
- **Logic**: It assigns a `category` (trigger, skill, context) based on the file path or relationship.
- **Action**: When adding new data types, update the category detection logic to ensure proper coloring and layout positioning.

### 2. Tuning the Force-Directed Layout
The graph uses `d3-force` for organic, hierarchical positioning.
- **Node Spacing**: To prevent overlaps, use `forceCollide().radius(150)` (or higher) to create a protective bubble around rectangular nodes.
- **Hierarchical Pull**: Use `forceY` with specific targets to separate roles:
  - **Triggers**: Target Y `-300`
  - **Context**: Target Y `0`
  - **Skills**: Target Y `+300`
- **Cooldown**: Run the simulation for at least `500` ticks (`simulation.tick()`) before rendering to allow the layout to settle.

### 3. Implementing Smart Edge Routing
Dense graphs suffer from overlapping straight edges.
- **Bezier Curves**: ALWAYS use `getBezierPath` from `@xyflow/react` instead of `SmoothStep` to allow edges to fan out.
- **Smart Components**: Use the `SmartEdge` custom component logic to calculate the shortest path between node boundaries (`top`, `bottom`, `left`, `right`) based on current coordinates.

### 4. Custom Node Requirements
- **Handles**: Custom React Flow nodes MUST include `<Handle>` components (even if hidden via CSS) for edges to successfully connect and render. If edges are missing, check for missing handles.

## Failure Shields (Common Pitfalls)

| Pitfall | Solution |
| :--- | :--- |
| **Vite Transform Error** | Use `import type { Node, Edge } from '@xyflow/react'` for TypeScript types. |
| **Blank Screen** | Check for syntax errors in `CoretextGraph.tsx`. Accidentally duplicated JSX tags or stray characters (like `>`) at the end of the file will crash the Vite builder. |
| **Overlapping Edges** | Avoid `SmoothStep` paths. Bezier curves organically avoid perfect overlap because their control points depend on unique node pairs. |
| **Overlapping Nodes** | Points-only simulations ignore node dimensions. Always add a `forceCollide` with a radius matching the diagonal half-width of the node. |
| **Missing Labels** | Use `EdgeLabelRenderer` and the label coordinates returned by `getBezierPath` to center labels on curved edges. |

## Verification Checklist
- [ ] Run `npm run build` in `coretext-graph-ui/` to verify TypeScript and Vite transform integrity.
- [ ] Verify that all custom nodes have `<Handle>` elements.
- [ ] Ensure all types are imported using `import type`.
- [ ] Check that `d3-force` simulation has enough ticks to settle.
