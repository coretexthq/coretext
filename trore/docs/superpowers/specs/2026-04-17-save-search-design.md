# Save Search Feature Design

## Overview
Implement a "Save Search" feature that allows users to save their current complex filter combination (query, district, price range, and amenities) by clicking a button. This will send a POST request with the filter payload to the backend.

## Architecture & Constraints
*   **URL-Driven State Only:** Adhering to the Global Invariant, the "Save Search" feature MUST extract the current filter state directly from the URL query parameters, NOT from any local component state.
*   **Payload:** The payload sent to the backend will be a JSON object containing the active search parameters (`q`, `district`, `priceRange`, `amenities`).
*   **Endpoint:** A POST request must be made to `/api/saved-searches`.
*   **Component Structure:** We will introduce a new, focused component `SaveSearchButton.jsx` to handle the UI and API logic for saving the search, separating this concern from the primary `SearchBar.jsx` input handling.

## Components

### `SaveSearchButton.jsx` (New)
*   **Responsibility:** Renders a button that, when clicked, reads the current `searchParams` from `react-router-dom`, constructs a payload of the active filters, and sends it to the server.
*   **State:** Will manage its own local state for the API request lifecycle (e.g., `isSaving`, `saveSuccess`, `error`) to provide UI feedback to the user (e.g., changing text from "Save Search" to "Saving..." to "Saved!"). *Note: This does not violate the invariant, as this state is for the button's UI feedback, not for storing the filter values themselves.*
*   **Dependencies:** `useSearchParams` from `react-router-dom`.

### `SearchBar.jsx` (Modified)
*   **Changes:** Integrate the `<SaveSearchButton />` into the UI, likely alongside or below the advanced search options.

## Data Flow
1.  User clicks "Save Search".
2.  `SaveSearchButton` calls `useSearchParams` to get the current URL parameters.
3.  The parameters are serialized into a JSON object:
    ```javascript
    {
      q: '...',
      district: '...',
      priceRange: '...',
      amenities: ['...', '...'] // Parsed from comma-separated string
    }
    ```
4.  A `fetch` POST request is made to `/api/saved-searches` with the JSON payload.
5.  On success, the button indicates success. On failure, it shows an error state.

## Error Handling
*   If the API request fails, the button should display an error message (or revert to its default state and show an error banner/alert, depending on existing error patterns). Given the current simple architecture, changing the button text to "Failed to save" briefly is a minimal, effective approach.

## Testing
*   **`SaveSearchButton.test.jsx`**:
    *   Test that it renders correctly.
    *   Test that clicking it triggers a `fetch` call to the correct endpoint with the correctly parsed payload from `searchParams`.
    *   Test loading and success/error states.