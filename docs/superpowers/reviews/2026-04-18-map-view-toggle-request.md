### What Was Implemented
Extracted API logic into a shared service (`src/services/api.js`), refactored the `useProperties` hook to use it, created a `ViewToggle` component for switching between "grid" and "map" views via the URL query state, and implemented a `MapView` placeholder component. These components were integrated into the main `App.jsx`, ensuring that filters applied to properties are respected in both views. Tests were created for all new components and services following Test-Driven Development (TDD) principles. I have verified that all 25 tests pass.

### Requirements/Plan
Ref: `docs/superpowers/plans/2026-04-18-map-view-toggle-plan.md`

### Git Range to Review
**Base:** f78dfab5d334197439511cd0e7a2d1e130b96795
**Head:** ce33173dbabf4c6fc99650df743f63695b8f3af6