# Map View Toggle & API Service Extraction Design

**Trigger:** Map View Toggle Requirement (2026-04-18)

## Context
The application currently displays properties in a grid view. We need to introduce a new "Map View" (currently a placeholder) and a toggle to switch between the two. The map view must reflect the current active filters. Additionally, the inline API fetching logic in `useProperties` needs to be extracted into a dedicated shared service.

## Architecture

1.  **API Service Extraction**
    The direct `fetch` call inside `src/hooks/useProperties.js` will be moved to a new file `src/services/api.js`. This new service will be responsible for making the HTTP request to `/api/properties` and including the mandatory `X-Trore-Auth: v1-alpha` header. This centralizes data fetching and prepares the app for future API needs.

2.  **State Management (URL-Driven State)**
    In accordance with the project's URL-driven state axiom, the current view mode (Grid or Map) will NOT use React `useState`. Instead, it will be stored in the URL query string as `?view=map` or `?view=grid`. It will default to `grid` if the parameter is absent. This will be managed using the existing `useUrlQuery` hook.

3.  **Components & Data Flow**
    *   **`ViewToggle` Component:** A new UI component that reads the `view` URL parameter and provides buttons to update it.
    *   **`MapView` Component:** A placeholder component that receives the `properties` array (the paginated/filtered data) and renders a visual placeholder, proving it reflects the active filters by displaying the count of properties.
    *   **App Integration:** `App.jsx` will be updated to read the `view` parameter via `useUrlQuery('view')` and conditionally render either `PropertyGrid` or `MapView` based on the value. Both components will receive the `properties` returned by `useProperties`, ensuring filters apply automatically to both views.

## File Changes
*   **Create:** `src/services/api.js`
*   **Create:** `src/components/ViewToggle.jsx`
*   **Create:** `src/components/MapView.jsx`
*   **Modify:** `src/hooks/useProperties.js` (Import and use the new API service)
*   **Modify:** `src/App.jsx` (Add `ViewToggle` and conditionally render `MapView`/`PropertyGrid`)

## Error Handling & Testing
*   The `api.js` service will throw an error if the response is not OK, which will continue to be caught and surfaced by `useProperties`.
*   All new modules will have accompanying Jest/React Testing Library test files (`api.test.js`, `ViewToggle.test.jsx`, `MapView.test.jsx`).
