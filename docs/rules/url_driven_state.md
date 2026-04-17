# URL-Driven State

**Trigger:** Rental Properties Feature Design (2026-04-17)

## Context
Implementing search and filter UI components without using local React state (`useState`), to maintain a single source of truth in the URL and enable shareable links.

## Axiom
All search queries, active filters, and pagination states MUST be managed exclusively via URL query parameters. UI components are strictly prohibited from using local component state (e.g., React `useState`) to store or manage filter selections. Use `useSyncExternalStore` or similar hooks to sync the URL state with React.