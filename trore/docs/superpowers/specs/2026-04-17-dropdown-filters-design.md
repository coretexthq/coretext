# Dropdown Filters Design

## Purpose
Extend the existing property interface with two new dropdown filters: "District" and "Price Range".

## Constraints & Invariants
- **Client-Side Only:** The data fetched by `useProperties` must not be re-fetched. Filtering is strictly local to reduce server load.
- **URL-Driven State:** Active filters must be managed exclusively via URL query parameters (`district` and `priceRange`). Component `useState` is prohibited for filter selections.
- **Data Isolation:** The original array of properties returned by `useProperties` must remain unmodified.

## Architecture

### 1. SearchBar Component
- Modify `src/components/SearchBar.jsx` to include two new `<select>` elements: one for District and one for Price Range.
- The dropdowns will read their current values from the URL via `useSearchParams`.
- When a dropdown value changes, the component will update the URL search parameters without clearing existing parameters (e.g., maintaining `q` while updating `district`).
- Predefined Price Ranges: "All", "Under $1000" (value "0-1000"), "$1000 - $2000" (value "1000-2000"), "Over $2000" (value "2000+").
- Districts: We will extract a unique list of available districts dynamically from the properties passed as a prop. `SearchBar` will accept a list of `districts` passed down from `PropertiesPage`.

### 2. PropertiesPage Component
- `src/pages/PropertiesPage.jsx` will read the URL query parameters (`q`, `district`, `priceRange`) using `useSearchParams`.
- It will compute `availableDistricts` (unique district values from `properties`) and pass them to the `SearchBar`.
- It will derive a new array `filteredProperties` by applying the filters to the `properties` array returned by `useProperties()`.
- The `filteredProperties` array will be passed to `PropertyGrid`.

## Data Flow
1. User changes District or Price Range dropdown in `SearchBar`.
2. `SearchBar` calls `setSearchParams`, updating the URL parameters in the router history.
3. React Router triggers a re-render of `PropertiesPage`.
4. `PropertiesPage` reads the new `searchParams`, recalculates `filteredProperties`, and re-renders `PropertyGrid` with the filtered data.
