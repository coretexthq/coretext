# Advanced Search & Pagination Design

## Goal
Add an "Advanced Search" section with multiple checkboxes for amenities (AC, Balcony, Parking) and implement pagination (limit 4 items per page).

## Architecture & Constraints
Following the global invariant from `ARCHITECTURE.md`, all state for these new features MUST be managed exclusively via URL query parameters. No local state will be used for filter selections or the current page.

## Components

1. **SearchBar (`src/components/SearchBar.jsx`)**
   - Extend the existing `SearchBar` to include an "Advanced Search" section.
   - Add checkboxes for amenities: "AC", "Balcony", "Parking".
   - Amenities state will be stored as a comma-separated string in the URL `amenities` parameter (e.g., `?amenities=ac,balcony`).
   - When a user toggles an amenity, it updates the `amenities` URL parameter.
   - **Crucially**, any change to filters (search, district, price, or amenities) MUST reset the `page` parameter to `1` to prevent users from being stuck on an empty page if the new filtered results are fewer than the current page offset.

2. **Pagination (`src/components/Pagination.jsx`)**
   - Create a new component to render pagination controls (Previous / Next buttons, and page text).
   - Driven entirely by `currentPage` and `totalPages` props which are computed by the parent from URL params.
   - `onChange` callback will update the `page` URL parameter.

3. **PropertiesPage (`src/pages/PropertiesPage.jsx`)**
   - Read `amenities` from the URL to filter `filteredProperties`. The filtering logic will support common mock structures (checking for boolean flags like `hasAC` or strings in an `amenities` array).
   - Read `page` from the URL (defaults to 1). Limit is hardcoded to 4 items per page.
   - Calculate pagination slice: `startIndex = (page - 1) * 4`, `endIndex = page * 4`.
   - Slice `filteredProperties` before passing to `PropertyGrid`.
   - Render `Pagination` component below `PropertyGrid` passing `currentPage` and `totalPages`.

## Data Flow
- User clicks "AC" -> `SearchBar` calls `setSearchParams({ ...existing, amenities: 'ac', page: '1' })`.
- `PropertiesPage` re-renders -> parses URL -> applies amenity filter -> computes pagination slice -> passes slice to `PropertyGrid`.
