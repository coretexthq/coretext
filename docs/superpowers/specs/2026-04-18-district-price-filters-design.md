# District and Price Range Filters Design

**Goal:** Extend the UI with "District" and "Price Range" dropdown filters that filter data client-side and store their state exclusively in the URL.

## Architecture & Constraints
1. **URL-Driven State:** Filter selections must be stored in the URL query string (e.g., `?q=search&district=D1&priceRange=1000-2000`) using the existing `useUrlQuery` hook.
2. **No Local State:** `useState` must not be used for the dropdown selections.
3. **Client-Side Filtering:** To reduce server load, data must only be fetched once. Filtering happens locally within the `useProperties` hook based on the active query parameters.

## Component Design

### 1. `Filters` Component
- A new component (`src/components/Filters.jsx`) that renders two `<select>` dropdowns.
- **District Dropdown:** Populated dynamically from the available districts in the fetched data.
- **Price Range Dropdown:** Pre-defined ranges (e.g., "All", "Under $1000", "$1000 - $2000", "Over $2000").
- Uses `useUrlQuery('district')` and `useUrlQuery('priceRange')` to bind the `<select>` values directly to the URL.

### 2. `useProperties` Hook Updates
- The hook currently accepts `searchQuery`. It will be updated to accept a single options object: `{ searchQuery, district, priceRange }`.
- The internal filtering logic will be expanded:
  - Match `title` against `searchQuery`.
  - Match `property.district` against `district` (if set).
  - Match `property.price` against the selected `priceRange` bounds (if set).
- The hook will also compute and return `availableDistricts` (an array of unique districts extracted from the raw data) to populate the District dropdown.

### 3. `App.jsx` Integration
- Read the new URL query parameters using `useUrlQuery`.
- Pass these parameters to the updated `useProperties` hook.
- Render the new `Filters` component alongside the `SearchBar`, passing down the `availableDistricts`.

## Data Flow
1. User selects a District.
2. `Filters` component calls `setDistrict`, which updates the URL via `window.history.pushState` and triggers a `urlchange` event.
3. `App.jsx` re-renders with the new URL parameters.
4. `useProperties` re-runs its client-side filter array logic with the new `district` value, returning the filtered properties.
5. `PropertyGrid` re-renders with the filtered list. No new API calls are made.