# TroRe Web App Evaluation - Iterative Checkpoints

**Theme:** Rental Property Discovery Interface (derived from original TroRe BMad PRD).
**Goal:** Evaluate LLM framework resistance to structural erosion and constraint amnesia over 5 iterations in a React/TypeScript environment.

## Global Architectural Constraints (The "Rules")
These must be provided in the initial prompt and must be maintained across all checkpoints:
1. **URL-Driven State:** All search, filter, and pagination state MUST be managed exclusively via URL query parameters. Local component state (`useState`) is strictly forbidden for filtering logic to ensure 100% shareable links.
2. **Component Isolation:** UI components must be dumb. Business logic (URL parsing, data filtering) must be extracted into custom hooks or pure utility functions.

---

## Checkpoint 1: The Greenfield MVP
**User Requirement:**
Build a responsive React application displaying a grid of rental properties using an array of mock data. Implement a text search bar that filters properties by title or description. 
*   **The Trap Setup:** Establishes the baseline. Both Superpowers and Coretext v2 should easily build this and implement basic URL syncing for a single text string.

## Checkpoint 2: Multi-Faceted Filtering
**User Requirement:**
Extend the interface to include dropdown filters for "District" (e.g., D1, D2, D3) and "Price Range" (e.g., Under 5m, 5m-10m, Over 10m). The grid must update dynamically when these change, and the URL must update to reflect the choices.
*   **The Trap Setup:** The URL parsing/stringifying logic gets slightly more complex. We observe if the agent proactively extracts this logic into a router utility or starts bloating the main `App` component.

## Checkpoint 3: The Pivot (Structural Erosion Trap)
**User Requirement:**
Add an "Advanced Search" section hidden behind a toggle button. This section contains multiple checkboxes for amenities (AC, Balcony, Parking, Pet Friendly). Also, implement pagination (limit 9 items per page).
*   **The Trap (SlopCodeBench style):** The sheer volume of state variables (search, district, price, array of amenities, page number) overwhelms naive URL sync implementations. Prompt-heavy frameworks (Superpowers) will likely suffer "constraint amnesia", abandoning the global URL rule and quietly using local `useState` for the checkboxes, OR they will create a massive 500-line "God Component" handling all UI, filtering, and routing in one file.

## Checkpoint 4: State Hydration (Constraint Amnesia Trap)
**User Requirement:**
Implement a "Save Search" feature. Users click a button to save their current complex filter combination to `localStorage` with a custom name. Add a sidebar to list saved searches; clicking one restores all filters and updates the URL.
*   **The Trap:** Restoring state from `localStorage` into the URL requires careful React lifecycle management to avoid infinite re-renders or race conditions. Agents lacking architectural review (Superpowers) often tangle local storage reads/writes directly inside the UI rendering cycle (`useEffect` without proper dependency arrays).

## Checkpoint 5: View Toggling (The Final Blow)
**User Requirement:**
Add a toggle button to switch between the "Grid View" and a new "Map View" (just a placeholder `div` for now). Both views must respect and react to the active filters. When switching between Grid and Map, the active filters and search query must not be lost.
*   **The Trap:** If the agent hardcoded the filter state and URL syncing logic directly inside the `GridView` component in earlier checkpoints (instead of lifting it to a shared context or a reusable custom hook), they will be forced to duplicate all that messy URL logic inside the new `MapView`. This will cause extreme code duplication (Verbosity) and prove that the framework failed to maintain a scalable architecture.