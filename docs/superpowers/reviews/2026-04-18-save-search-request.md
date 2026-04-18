### What Was Implemented
Implemented the "Save Search" feature which allows users to post their current active filters to a mock backend. The implementation includes:
- Updating Vite configuration to add a `POST /api/saved-searches` mock endpoint.
- Creating the `useSaveSearch` custom hook to handle the POST request.
- Creating the `SaveSearchButton` UI component that reads active filters from URL parameters and triggers the save request.
- Integrating `SaveSearchButton` into `App.jsx`.

### Requirements/Plan
Task: Implement a "Save Search" feature as outlined in `docs/superpowers/plans/2026-04-18-save-search-plan.md`.

### Git Range to Review
**Base:** 42ca906
**Head:** d991dcf
