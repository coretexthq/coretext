# TroRe Web App Evaluation - Continuous Evolution Benchmark (EvoClaw/SWE-CI Inspired)

**Theme:** Rental Property Discovery Interface (Derived from TroRe BMad PRD).
**Objective:** Evaluate LLM framework resistance to structural erosion, constraint amnesia, and regression accumulation over 5 continuous iterations.
**Methodology:** "Develop-in-place, evaluate-in-isolation" (EvoClaw). Each milestone builds upon the persistent state of the previous one.

---

## 🛑 GLOBAL INVARIANTS (The "Must-Not Violate" Constraints)
*These rules simulate the "Interaction Smells" taxonomy (arxiv:2603.09701v2). If an agent violates these in later milestones while implementing new features, it triggers a "Must-Not Violate" smell and fails the Code Review. They should be stored in an `ARCHITECTURE.md` file at the root of the project before M1 begins.*

1.  **URL-Driven State Only:** All search queries, active filters, and pagination states MUST be managed exclusively via URL query parameters (e.g., `?q=studio&district=D1&page=2`).
2.  **No Local State for Filters:** UI components are strictly prohibited from using local component state (e.g., React `useState`) to store or manage filter selections.
3.  **Mock Data Isolation:** The core mock data array must remain unmodified and isolated from the UI components.

---

## Milestone 1: The Greenfield MVP & The Local Rule Trap
modif

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_1.1):** Entering text updates the URL to `?q=text`.
*   **Fail-to-Pass (F2P_1.2):** Fetches from `/api/properties` include the `X-Trore-Auth` header.
*   **Fail-to-Pass (F2P_1.3):** The property grid renders items matching the query.
*   **Rule Extraction (Coretext v2):** The Reviewer extracts the header rule to `docs/rules/api_rules.md`.

---

## Milestone 2: Multi-Faceted Client-Side Filtering (Context Dilution)
**User Requirement:**
Extend the interface to include two dropdown filters: "District" and "Price Range". 
*Product Constraint:* To reduce server load, these new filters must filter the data already fetched on the client side. Do not make new API calls.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_2.1):** Selecting "D1" updates URL to `&district=D1`.
*   **Fail-to-Pass (F2P_2.2):** The grid correctly applies client-side district/price filtering.
*   **Pass-to-Pass (P2P_1.1, P2P_1.2):** Text search still triggers API calls with the correct header.

---

## Milestone 3: The Pivot (Structural Erosion Stress Test)
**User Requirement:**
Add an "Advanced Search" section with multiple checkboxes for amenities (AC, Balcony, Parking). Implement pagination (limit 4 items per page).

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_3.1):** Checking "AC" updates URL to `&amenities=AC`.
*   **Fail-to-Pass (F2P_3.2):** Pagination correctly slices the client-side array.
*   **Pass-to-Pass (P2P_2.1, P2P_2.2):** Previous filters still work in combination.
*   **Code Review (Static):** *Critical Check.* Does the agent use `useState` instead of URL parameters? (Must-Not Violate smell).

---

## Milestone 4: State Hydration & The JIT Trigger
**User Requirement:**
Implement a "Save Search" feature. Users click a button to save their current complex filter combination to the backend.
*Product Constraint:* Make a POST request to `/api/saved-searches` with the filter payload.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_4.1):** Clicking "Save" makes a POST request to `/api/saved-searches`.
*   **Must-Do Omission Check:** *Critical Check.* Did the agent remember to include the `X-Trore-Auth: v1-alpha` header? (If forgotten, logs "Must-Do Omission". Coretext v2 should prevent this via JIT).
*   **Pass-to-Pass (P2P_3.1, P2P_3.2):** All grid filtering and pagination remain intact.

---

## Milestone 5: View Toggling (The "Snowball Effect" Trap)
**User Requirement:**
Add a toggle button to switch between the "Grid View" and a new "Map View" (render a placeholder component for the map). The new view should automatically reflect whatever filters are currently active. Extract the API calling logic into a dedicated shared service if it isn't already.

**[Future Automated Test Assertions]**
*   **Fail-to-Pass (F2P_5.1):** Toggling to "Map View" renders the placeholder and hides the Grid.
*   **Pass-to-Pass (P2P_4.1):** Saving a search still sends the correct payload and headers.
*   **Measurement (EvoScore/Verbosity):** Measure Structural Erosion. Did the agent copy-paste URL parsing and API logic into both views, or cleanly abstract them?