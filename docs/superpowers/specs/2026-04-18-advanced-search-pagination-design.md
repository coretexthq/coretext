# Advanced Search & Pagination Design

## Goal
Add an "Advanced Search" section with multiple checkboxes for amenities (AC, Balcony, Parking) and implement pagination (limit 4 items per page).

## Architecture Constraints
1. **URL-Driven State Only:** All search queries, active filters, and pagination states MUST be managed exclusively via URL query parameters (e.g., `?amenities=AC,Parking&page=2`).
2. **No Local State for Filters:** UI components are strictly prohibited from using local component state to store or manage filter selections.
3. **Mock Data Isolation:** The core mock data array must remain unmodified.

## Approach & Data Flow

### 1. URL State Management
- **Amenities:** We will use a comma-separated string in the URL to represent multiple selected amenities (e.g., `?amenities=AC,Balcony`).
- **Pagination:** We will use a `page` query parameter (e.g., `?page=1`). The default page is 1.

### 2. Components
- **`AdvancedSearch.jsx`:** A new component containing checkboxes for available amenities (AC, Balcony, Parking). It will read the `amenities` query parameter using `useUrlQuery`, parse it into an array, and when a checkbox is toggled, it will update the URL by joining the updated array back into a comma-separated string.
- **`Pagination.jsx`:** A new component to render "Previous" and "Next" buttons, and optionally page numbers. It will read the `page` query parameter, calculate total pages from the data, and update the URL when navigating.
- **`App.jsx`:** Will read `amenities` and `page` from the URL and pass them to `useProperties`. It will also render the new `AdvancedSearch` and `Pagination` components.

### 3. Data Filtering & Pagination (Hooks)
- **`useProperties.js`:** 
  - Will be updated to accept `amenities` (string) and `page` (number/string).
  - **Filtering:** It will parse the `amenities` string and filter the data so that a property must contain ALL selected amenities to match.
  - **Pagination:** After all filters are applied, it will slice the resulting array to return only 4 items per page (e.g., `page 1` -> items 0-3, `page 2` -> items 4-7).
  - **Total Pages:** It will also return `totalPages` so the `Pagination` component knows when to disable the "Next" button.

## Error Handling & Edge Cases
- If `page` is less than 1 or not a number, default to page 1.
- If `page` exceeds `totalPages`, the UI should disable the "Next" button, but if manually entered in the URL, `useProperties` will return an empty array for properties.
- When any filter changes (search, district, price, amenities), the `page` parameter should ideally be reset to 1 to avoid empty results on out-of-bounds pages.

## Testing Strategy
- **Unit Tests:** Add tests for `AdvancedSearch.jsx` to verify it updates the URL correctly. Add tests for `Pagination.jsx` to verify it displays correct buttons and updates the URL.
- **Hook Tests:** Update `useProperties.test.js` to ensure amenities filtering and pagination slicing work correctly, and that total pages are calculated accurately.
