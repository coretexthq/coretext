# Rental Properties Feature Design

## Goal
Build a responsive React application displaying a grid of rental properties. Implement a text search bar that filters properties by title. The property data must be fetched from a mock API endpoint `/api/properties`, which requires a custom authentication header `X-Trore-Auth: v1-alpha`.

## Architecture & Constraints

- **URL-Driven State Only:** All search queries will be managed exclusively via URL query parameters (e.g., `?q=studio`).
- **No Local State for Filters:** We will use `useSyncExternalStore` to sync the URL state with React, completely avoiding `useState` for the search term, strictly adhering to the global invariant.
- **Mock Data Isolation:** The core mock data will reside in a Vite dev server middleware to simulate a real backend. The frontend will fetch data over HTTP. The UI will only filter the *fetched* responses locally, keeping the source data fully isolated.
- **Tech Stack:** React 19, Vite, Vanilla CSS, native Fetch API.

## Components & Modules

### 1. Vite Mock API (vite.config.js)
A custom plugin to intercept `/api/properties` requests. It will validate the `X-Trore-Auth: v1-alpha` header (returning 401 if missing) and return an array of mock properties.

### 2. URL State Hook (`src/hooks/useUrlQuery.js`)
A custom hook that encapsulates `useSyncExternalStore` to read from `window.location.search`. It provides the current query string for a given key and an update function that calls `window.history.pushState` and dispatches a custom event to trigger React updates.

### 3. Data Fetching Hook (`src/hooks/useProperties.js`)
Fetches data from `/api/properties` with the required authorization header. It returns `data`, `loading`, and `error` states. The hook will filter the fetched properties based on the search query parameter before returning them to the UI.

### 4. UI Components (`src/components/`)
- **SearchBar:** An input field that reads its value from `useUrlQuery('q')` and updates the URL on change.
- **PropertyGrid:** A CSS grid layout container displaying a list of `PropertyCard` components.
- **PropertyCard:** Displays an individual property's title, price, and other details.

## Data Flow
1. User types in `SearchBar`.
2. `SearchBar` updates the URL `?q=value` via `history.pushState`.
3. `useUrlQuery` detects the URL change and triggers a re-render.
4. `App` passes the new query to `useProperties`.
5. `useProperties` filters the loaded data based on the query.
6. `PropertyGrid` receives the filtered list and re-renders the `PropertyCard`s.
