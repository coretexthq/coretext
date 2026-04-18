# Save Search Feature Design

**Date:** 2026-04-18
**Goal:** Implement a "Save Search" feature allowing users to save their current complex filter combinations to the backend via a POST request to `/api/saved-searches`.

## Context and Constraints

*   **URL-Driven State:** The application stores all active search queries, filters, and pagination strictly in the URL.
*   **API Mocking & Auth:** The project uses a mock backend via Vite development server middleware (`vite.config.js`). Any API request must include the `X-Trore-Auth: v1-alpha` header.
*   **Target Backend:** A POST request must be made to `/api/saved-searches` with a payload of the active filter state.

## Architecture & Components

1.  **Mock API Endpoint (`vite.config.js`)**
    *   We will extend the existing Vite dev server middleware to intercept `POST /api/saved-searches`.
    *   It will validate the `X-Trore-Auth: v1-alpha` header (returning 401 if invalid).
    *   It will parse the JSON request body containing the search parameters and respond with a `201 Created` or `200 OK` status.

2.  **`useSaveSearch` Hook (`src/hooks/useSaveSearch.js`)**
    *   A custom React hook that manages the API interaction.
    *   It will provide a `saveSearch(filters)` function alongside `loading`, `error`, and `success` states.
    *   It abstracts away the `fetch` logic and header configuration.

3.  **`SaveSearchButton` Component (`src/components/SaveSearchButton.jsx`)**
    *   A simple, focused UI component responsible for displaying the "Save Search" button.
    *   When clicked, it will read the current URL parameters (which represent the single source of truth for the active filters) using `window.location.search`.
    *   It will format these parameters into a JSON object and pass them to the `useSaveSearch` hook.
    *   It will display feedback to the user (e.g., changing text to "Saving..." or "Saved!").

4.  **App Integration (`src/App.jsx`)**
    *   The `SaveSearchButton` will be placed within the `.search-and-filters` container so it sits alongside the existing `SearchBar`, `Filters`, and `AdvancedSearch` components.

## Data Flow

1. User modifies filters, updating the URL query parameters (handled by existing components).
2. User clicks "Save Search".
3. `SaveSearchButton` extracts the current `window.location.search`.
4. The search parameters are transformed into an object (e.g., `{ q: 'studio', district: 'D1' }`).
5. `useSaveSearch` sends a POST request with the payload to `/api/saved-searches`.
6. UI updates briefly to indicate successful save.

## Testing Strategy

*   **Hook Tests:** Verify `useSaveSearch` makes the correct fetch call with appropriate headers and payload, handling both success and error responses.
*   **Component Tests:** Render `SaveSearchButton`, mock the `useSaveSearch` hook (or fetch API), click the button, and verify the correct parameters from the mocked `window.location.search` are passed.
*   **Vite Config Mock:** Add the new middleware route to the existing test environment logic or visually verify during manual QA.