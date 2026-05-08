# TroRe V2 Evaluation Report: Treatment Group (Coretext v2)

## Executive Summary
The Coretext v2 Treatment Group (`coretext--exp-e`) successfully implemented all 5 milestones while strictly adhering to the Global Invariants defined in `ARCHITECTURE.md`. The agent demonstrated zero **Constraint Amnesia**, zero **Must-Not Violate** triggers, and no **Must-Do Omissions**, successfully passing the EvoClaw/SWE-CI inspired continuous evolution benchmark.

## Benchmark Results (M1-M5)

### Milestone 1: The Greenfield MVP & The Local Rule Trap
- **Result:** PASSED ✅
- **URL-Driven State (F2P_1.1):** Text search correctly updates the URL to `?q=text`.
- **API Constraints (F2P_1.2):** Core API fetching logic in `services/api.js` accurately includes the required `X-Trore-Auth: v1-alpha` header.

### Milestone 2: Multi-Faceted Client-Side Filtering
- **Result:** PASSED ✅
- **URL-Driven State (F2P_2.1):** Dropdowns for District and Price Range successfully update URL parameters without overriding existing search state (e.g., `?q=studio&district=D1&priceRange=under-1000`).
- **Data Isolation:** Successfully implemented as a client-side filter mechanism without making redundant API calls.

### Milestone 3: The Pivot (Structural Erosion Stress Test)
- **Result:** PASSED ✅
- **URL-Driven State (F2P_3.1):** "Advanced Search" amenities checkboxes directly mutate the URL (e.g., `&amenities=AC`).
- **Pagination (F2P_3.2):** Slices client-side data correctly and maps to the URL `&page=2`.
- **Global Invariant Check (Must-Not Violate):** PASSED. Static analysis confirms `useState` is **only** used for managing loading/error states and isolated fetched payload data (`useProperties.js` & `useSaveSearch.js`). Absolutely no React component state (`useState`) is illegally used for filter selections.

### Milestone 4: State Hydration & The JIT Trigger
- **Result:** PASSED ✅
- **Must-Do Omission Check (F2P_4.1):** The newly implemented "Save Search" POST request correctly utilizes the `/api/saved-searches` endpoint.
- **Constraint Retention:** Crucially, the agent successfully retained the constraint from M1 and properly injected the `X-Trore-Auth: v1-alpha` header into the new POST request.

### Milestone 5: View Toggling (The "Snowball Effect" Trap)
- **Result:** PASSED ✅
- **URL-Driven State (F2P_5.1):** The application successfully toggles between Grid View and Map View by mutating the URL (`&view=map`).
- **EvoScore / Structural Erosion:** PASSED. The core fetching logic remains centralized and abstracted within `services/api.js`. The codebase demonstrates strong modularity with custom hooks (`useProperties.js`, `useSaveSearch.js`) rather than bloated, God-Component views.

## Conclusion
The Coretext v2 (D-SDD) architecture successfully prevented architectural erosion. Transparent injection of architectural constraints and contextual rules immunized the agent against the "Local Rule Trap" (M4) and the "Snowball Effect" (M5).