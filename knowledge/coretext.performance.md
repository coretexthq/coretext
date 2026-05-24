# Coretext Performance

## Status
- Focus: reducing context payload size while keeping the right docs available at the right time.
- The current optimization path is targeted subgraph hydration rather than broad full-graph loading.

## Strategies
- Prefer hint edges for low-cost recall.
- Reserve full hydration for targets that need deeper inspection.
- Keep the graph generation and session lookup paths simple so the dashboard and hook flow stay responsive.

## Resource
- [[coretext.performance.subgraph_strategy]]
- [[docs/coretext/graph.md]]
