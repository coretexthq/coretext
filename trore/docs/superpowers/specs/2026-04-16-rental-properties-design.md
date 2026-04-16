# Rental Properties Grid and Search Design

## Overview
A responsive React application displaying a grid of rental properties. It includes a text search bar to filter properties by title. The application strictly adheres to URL-driven state for filtering and integrates with a mock API that enforces a custom authentication header.

## Architecture & Global Invariants

1. **URL-Driven State Only:**
   The search filter state (`q`) will be managed exclusively via the URL query string (e.g., `?q=studio`). We will utilize `react-router-dom` to provide a robust `useSearchParams` hook to read and write to the URL state.
2. **No Local State for Filters:**
   The SearchBar component will rely entirely on the URL search params. It will not use `useState` to store the text input. The input will use the URL parameter as its source of truth and update the URL directly on change.
3. **Mock Data Isolation & API:**
   Property data will be fetched from `/api/properties`. To satisfy the mock API requirement without standing up a separate backend, we will configure a Vite dev server middleware in `vite.config.js` to intercept requests to `/api/properties`.
   - **Authentication Constraint:** The middleware will reject any request missing the header `X-Trore-Auth: v1-alpha` with a `401 Unauthorized` status.
   - The React application will use the native `fetch` API, providing the required header to retrieve the data.

## Components

- **`App`**: The root component wrapping the application in a `BrowserRouter`.
- **`PropertiesPage`**: The main page layout containing the search bar and the property grid. It extracts the `q` query parameter and passes it down.
- **`SearchBar`**: An input component that reads the current `q` parameter and updates it using `setSearchParams`.
- **`PropertyGrid`**: A grid layout component that receives the filtered list of properties and maps over them.
- **`PropertyCard`**: A presentation component displaying individual rental property details (image, title, price, etc.).

## Data Flow
1. The user types in the `SearchBar`.
2. The `SearchBar` calls `setSearchParams` which updates the URL to `?q=...`.
3. The `PropertiesPage` re-renders with the new URL query parameter.
4. Concurrently, `PropertiesPage` fetches data from `/api/properties` on mount (or re-fetches if needed, though client-side filtering of the static list is sufficient here). It applies the title filter based on the `q` query parameter.
5. The filtered list is passed to `PropertyGrid` for rendering.

## Testing Strategy
- **Unit Tests:** Verify that `SearchBar` correctly updates the URL and does not use local state.
- **API Tests / Integration:** Use a mocked `fetch` in tests to ensure the correct `X-Trore-Auth` header is sent.
- **Filtering Tests:** Ensure that the property grid correctly filters properties based on the search query.