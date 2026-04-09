# TroRe Web App Evaluation - Continuous Evolution Benchmark (EvoClaw/SWE-CI Inspired)

**Theme:** Rental Property Discovery Interface (Derived from TroRe BMad PRD).
**Objective:** Evaluate LLM framework resistance to structural erosion, constraint amnesia, and regression accumulation over 5 continuous iterations.
**Methodology:** "Develop-in-place, evaluate-in-isolation" (EvoClaw). Each milestone builds upon the persistent state of the previous one.

---

## 🛑 GLOBAL INVARIANTS (The "Must-Not Violate" Constraints)
*These rules simulate the "Interaction Smells" taxonomy (arxiv:2603.09701v2). If an agent violates these in later milestones while implementing new features, it triggers a "Must-Not Violate" smell and fails the Code Review.*

1.  **URL-Driven State Only:** All search queries, active filters, and pagination states MUST be managed exclusively via URL query parameters (e.g., `?q=studio&district=D1&page=2`).
2.  **No Local State for Filters:** UI components are strictly prohibited from using local component state (e.g., React `useState`) to store or manage filter selections.
3.  **Mock Data Isolation:** The core mock data array must remain unmodified and isolated from the UI components.

---

## Milestone 1: The Greenfield MVP (Seed Discovery)
**User Requirement:**
Build a responsive React application displaying a grid of rental properties using a provided array of mock data (min 10 items). Implement a text search bar that filters properties by title.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_1.1):** Entering text "Studio" in the search bar updates the URL to include `?q=Studio`.
*   **Fail-to-Pass (F2P_1.2):** The property grid renders only items matching the URL `q` parameter.
*   **Code Review (Static):** Scan codebase to ensure `useState` is NOT used for the search input value.

---

## Milestone 2: Multi-Faceted Filtering (Evolution Phase 1)
**User Requirement:**
Extend the interface to include two dropdown filters: "District" (e.g., D1, D2, D3) and "Price Range" (e.g., Under 5m, 5m-10m, Over 10m). The grid must update dynamically when these change.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_2.1):** Selecting "D1" updates the URL to append `&district=D1`.
*   **Fail-to-Pass (F2P_2.2):** The grid filters data combining both the search query AND the selected district/price.
*   **Pass-to-Pass (P2P_1.1):** (Regression Check) The text search from Milestone 1 still updates the URL correctly alongside the new filters.

---

## Milestone 3: The Pivot (Structural Erosion Stress Test)
**User Requirement:**
Add an "Advanced Search" section containing multiple checkboxes for amenities (AC, Balcony, Parking). Implement pagination (limit 4 items per page).

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_3.1):** Checking "AC" and "Balcony" updates the URL to `&amenities=AC,Balcony`.
*   **Fail-to-Pass (F2P_3.2):** Clicking "Next Page" updates the URL to `&page=2`.
*   **Pass-to-Pass (P2P_2.2):** (Regression Check) District and Price filters still function correctly.
*   **Code Review (Static):** *Critical Check.* Does the agent suffer "Constraint Amnesia" and use `useState` for the checkboxes because parsing arrays from URLs is harder? If yes -> Log "Must-Not Violate" Interaction Smell.

---

## Milestone 4: State Hydration (Cross-Turn Inconsistency Test)
**User Requirement:**
Implement a "Save Search" feature. Users click a button to save their current complex filter combination (from the URL) to `localStorage` with a custom name. Add a sidebar listing saved searches; clicking one restores all filters into the URL.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_4.1):** Clicking "Save" writes the current URL parameters to `localStorage`.
*   **Fail-to-Pass (F2P_4.2):** Clicking a saved search in the sidebar overwrites the current URL with the saved parameters.
*   **Pass-to-Pass (P2P_3.1):** (Regression Check) The checkbox UI immediately updates to reflect the newly restored URL state.
*   **Code Review (Static):** Does the agent break the "Mock Data Isolation" rule while implementing local storage?

---

## Milestone 5: View Toggling (The "Snowball Effect" Trap)
**User Requirement:**
Add a toggle button to switch between the "Grid View" and a new "Map View" (just render a placeholder `div` with the text "Map View of X items"). Both views must respect the active filters. Switching views must NOT lose the current filters or search query.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_5.1):** Toggling to "Map View" renders the placeholder and hides the Grid.
*   **Fail-to-Pass (F2P_5.2):** The "Map View" placeholder displays the correct number of filtered items.
*   **Pass-to-Pass (P2P_4.2):** (Regression Check) Loading a "Saved Search" while in "Map View" correctly updates the item count without switching back to "Grid View".
*   **Measurement (EvoScore/Verbosity):** If the agent tightly coupled the URL parsing logic to the `GridView` component in M1-M4, they will copy-paste that logic into `MapView` here. Measure the exact line count increase (Verbosity) vs Coretext v2.