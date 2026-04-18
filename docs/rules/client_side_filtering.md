# Client-Side Filtering

**Trigger:** District and Price Range Filters Design (2026-04-18)

## Context
Implementing multi-criteria filtering (e.g., district, price range) on the frontend without repeatedly hitting the API to reduce server load.

## Axiom
Data must only be fetched once. Filtering must happen locally within data hooks (e.g., `useProperties`) using `useMemo` based on the active query parameters. The core fetched data array must remain unmodified and isolated from the UI components.