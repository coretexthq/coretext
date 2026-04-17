# TroRe Web App Evaluation Report - Control Group (Superpowers)

**Experiment:** Superpowers vs. Superpowers + Coretext v2 (D-SDD)
**Group:** Control Group (Superpowers alone)
**Evaluation Method:** Static Code Analysis & Test Execution

## Executive Summary
The Control Group successfully implemented most functional requirements across all 5 milestones. It demonstrated a strong adherence to the "Must-Not Violate" invariant (No Local State for Filters) by rigorously utilizing URL search parameters. 

However, the agent suffered a critical **Constraint Amnesia** failure in Milestone 4, triggering a **Must-Do Omission** smell. The agent forgot to include the mandatory `X-Trore-Auth` header in the newly created API call, proving the hypothesis that without continuous context injection (Coretext v2), the LLM loses track of early constraints in long-running evolutionary tasks.

---

## Detailed Milestone Evaluation

### 🛑 Global Invariants
* **URL-Driven State Only:** **PASS**. The application relies heavily on `useSearchParams` from `react-router-dom` for all state (search, filters, pagination, view toggle).
* **No Local State for Filters:** **PASS**. `useState` is used exclusively for fetching states (data, loading, error) and UI interaction states (save button status), but *never* for filter data. 
* **Mock Data Isolation:** **PASS**. Data is fetched via a mock API layer (`/api/properties`) and managed correctly.

### Milestone 1: The Greenfield MVP
* **F2P_1.1 (URL update):** **PASS**. Implemented via `q` URL parameter.
* **F2P_1.2 (Auth Header):** **PASS**. The initial fetch logic inside `services/propertyService.js` correctly includes the `X-Trore-Auth: v1-alpha` header.
* **F2P_1.3 (Filtering):** **PASS**. 

### Milestone 2: Multi-Faceted Client-Side Filtering
* **F2P_2.1 (URL update):** **PASS**. Implemented via `district` and `priceRange` parameters.
* **F2P_2.2 (Client-Side filtering):** **PASS**. Logic is correctly positioned in `PropertiesPage.jsx` after data fetch.
* **P2P_1.1, 1.2:** **PASS**. Initial features remained intact.

### Milestone 3: The Pivot (Structural Erosion Stress Test)
* **F2P_3.1 (URL update):** **PASS**. Implemented via `amenities` parameter.
* **F2P_3.2 (Pagination):** **PASS**. Client-side slicing correctly limits items to 4 per page.
* **Code Review (Must-Not Violate check):** **PASS**. The agent resisted the temptation to use `useState` for the new complex checkboxes, continuing to parse the `amenities` string from the URL.

### Milestone 4: State Hydration & The JIT Trigger
* **F2P_4.1 (API Call):** **PASS**. `SaveSearchButton.jsx` correctly packages URL parameters and makes a POST request to `/api/saved-searches`.
* **Must-Do Omission Check:** ❌ **FAIL (Critical)**. 
  The agent failed to include the `X-Trore-Auth: v1-alpha` header in the `fetch` call within `SaveSearchButton.jsx`. This is the exact failure mode predicted for the Control Group—the agent "forgot" the global API constraint introduced in Milestone 1 because it was not forcibly injected into its context window during Session B of Milestone 4.

### Milestone 5: View Toggling
* **F2P_5.1 (Toggle View):** **PASS**. The toggle updates the URL to `?view=map` and the MapView placeholder is rendered with the filtered property count.
* **Structural Erosion Measurement:** **MODERATE SUCCESS**.
  The agent did *not* fall into the "Snowball Effect Trap" of copy-pasting the URL parsing and filtering logic into both `PropertyGrid.jsx` and `MapView.jsx`. Instead, it kept the "God Component" pattern, leaving all URL parsing and filtering logic centralized in `PropertiesPage.jsx`, and passing the `filteredProperties` array down as a prop to both views. While this creates a slightly bloated page component (high Cyclomatic Complexity), it cleanly avoided redundant code and structural duplication. The API calling logic was also cleanly abstracted into `useProperties.js` and `propertyService.js`.

---

## Conclusion
The Control Group performed well on structural organization and functional recall but failed the primary benchmark hypothesis: **Constraint Amnesia**. Without explicit systemic reminders, the LLM dropped a critical security constraint (the authentication header) when implementing a new API integration late in the evolutionary lifecycle.