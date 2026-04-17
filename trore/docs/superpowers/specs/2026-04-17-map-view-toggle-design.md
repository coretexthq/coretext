# Map View Toggle Design

## Overview
This feature adds a toggle button to switch between the existing "Grid View" and a new "Map View" (currently a placeholder). It also involves extracting the API fetching logic from the `useProperties` hook into a dedicated shared service.

## Architecture

1. **API Service Extraction:**
   - The raw `fetch` call and authentication headers currently residing in `src/hooks/useProperties.js` will be extracted into a new shared service at `src/services/propertyService.js`.
   - The `useProperties` hook will be refactored to consume this new service, ensuring separation of concerns and reusability of the API logic.

2. **State Management (URL-Driven State):**
   - In adherence to the strict architecture guidelines, the selected view state (`grid` vs. `map`) will be managed via the URL query parameters using `?view=map` or `?view=grid`.
   - The default behavior when the `view` parameter is omitted will be the Grid View.

3. **View Toggle Component:**
   - A new stateless `ViewToggle` component will be introduced to render the toggle UI.
   - It will rely on `react-router-dom`'s `useSearchParams` to manage the URL `view` parameter.

4. **Map View Placeholder:**
   - A new stateless component `MapView` will be created at `src/components/MapView.jsx`.
   - For now, it will simply render a visually distinct placeholder (e.g., a styled `div`) indicating where the map will be embedded.
   - It will accept the `properties` array as a prop. To accurately reflect active filters (as requested), we will pass the `filteredProperties` to the Map View. (Note: Maps typically display all filtered results rather than only the current page of a paginated set, so we will pass the unpaginated `filteredProperties`).

5. **PropertiesPage Integration:**
   - The `PropertiesPage.jsx` component will be updated to read the `view` parameter.
   - It will conditionally render either the `PropertyGrid` (along with `Pagination`) or the new `MapView` based on the URL parameter, while maintaining the global filters via the `SearchBar`.

## Data Flow
- User clicks the view toggle -> `useSearchParams` updates the URL `view` query parameter.
- `PropertiesPage` re-renders based on the updated URL state.
- `PropertiesPage` conditionally renders either the `PropertyGrid` or the `MapView`, passing the relevant filtered properties down to the active view.

## Error Handling & Testing
- The API extraction should not break the existing error state handling inside `useProperties`.
- We will add tests for the new `ViewToggle` component to ensure it updates URL parameters correctly.
- We will add tests for `MapView` to verify it renders the placeholder and receives the properties correctly.
- We will ensure `PropertiesPage` correctly conditionally renders the views based on search parameters.
