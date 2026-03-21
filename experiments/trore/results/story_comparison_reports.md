# Detailed Experiment Comparison Reports: Exp B vs. Exp C-2

This document provides a structured, deep-dive comparison of the implementation of Stories 1.1 through 1.5 in the TroRe project, comparing the file-based retrieval method (Experiment B) and the graph-based CoreText retrieval method (Experiment C-2).

---

### **Story 1.1: Project Scaffolding & Database Foundation**

| Feature | **Experiment B (File-Based)** | **Experiment C-2 (CoreText Graph)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | **Structural Discovery:** Used `list_directory`, `glob`, and `read_file` to read the full `architecture.md` and `epics.md`. | **Semantic Discovery:** Blocked from files. Used `query_knowledge` to retrieve specific nodes for "Epic 1" and "Story 1.1". |
| **DB Schema Accuracy** | Correctly identified the `listings` table. Implemented basic SQLite schema for development. | **High Fidelity:** Correctly identified the specific Supabase/PostgreSQL schema, including `JSONB` for features and `SCD Type 2` history requirements. |
| **Tech Stack Selection** | Used generic versions of FastAPI and React 19. | **Proactive Research:** Performed `google_web_search` and `web_fetch` to identify and lock specific stable versions (e.g., React 19.2.4). |
| **Build Configuration** | Standard Turborepo setup. | **Advanced Configuration:** Handled complex `Hatchling` and `uv` backend configurations more effectively for the monorepo structure. |
| **Fidelity Conclusion** | **Good.** Replicated the specs by reading them directly. | **Excellent.** Reconstructed the "hidden" specs through the knowledge graph with higher technical precision (versioning). |

---

### **Story 1.2: Admin Manual Listing Creation**

| Feature | **Experiment B (File-Based)** | **Experiment C-2 (CoreText Graph)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Read `epics.md` and `ux-design-specification.md` in full. | Targeted queries for Scenario 1 (Success), 2 (Validation), and 3 (Server Error). |
| **Negative Price Logic** | Implemented via Zod (`.positive()`) and Pydantic (`gt=0`). | Implemented via Pydantic (`Field(gt=0)`) and manual React `if (price <= 0)` state checks. |
| **503 Error Handling** | Implemented a generic error message in the API client. | **Explicit Compliance:** Specifically implemented the AC-required message: *"System is currently busy, please try again later"* via a `response.status === 503` check. |
| **UI Implementation** | Used `react-hook-form` and `@tanstack/react-query` for a robust, modular setup. | Used vanilla React `useState` and `fetch`. Simpler, but matched all 5 acceptance criteria precisely. |
| **Fidelity Conclusion** | **Robust Architecture.** Focused on best practices over specific text adherence. | **Business Logic Fidelity.** Semantic retrieval ensured specific error-handling strings were implemented exactly as specified. |

---

### **Story 1.3: Seeker Discovery Grid & Keyword Search**

| Feature | **Experiment B (File-Based)** | **Experiment C-2 (CoreText Graph)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Direct `read_file` on large planning artifacts. | `query_knowledge` forced a structured retrieval of specific requirement nodes (FR3). |
| **Requirement Coverage** | **Failed:** Omitted the "Keyword Search" requirement entirely in the generated code and story artifact. | **Success:** Explicitly identified and implemented the "Keyword Search" requirement. |
| **Backend Implementation** | Basic `GET /listings` with only status filtering and pagination. | Robust search using SQL `ilike` across `title` and `description` with `OR` conditions. |
| **Frontend UI** | Only implemented the property grid and pagination. | Implemented the property grid plus a functional search bar linked to the backend query. |
| **Conclusion** | **Skimming Error.** Direct access to large files led to the agent "missing" sub-requirements buried in the text. | **Topology Success.** The graph forced the agent to see the "Keyword Search" node as a primary functional requirement. |

---

### **Story 1.4: Property Detail View**

| Feature | **Experiment B (File-Based)** | **Experiment C-2 (CoreText Graph)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Standard `read_file` and `grep` on planning artifacts. | Blocked from files; used `query_knowledge` to retrieve coding standards and API structure. |
| **JSONB Handling** | Parsed the `features` JSONB field and formatted keys using JS title-casing. | Parsed the `features` field and used CSS `capitalize` for the UI list rendering. |
| **Error Handling** | Created a dedicated `NotFound` component for invalid IDs (404). | Implemented a 404 state within the main detail page with a "Return Home" link. |
| **Env Management** | Pre-configured environment; used existing packages. | **Resilient Setup:** Detected missing dependencies and manually installed/configured React Router and Tailwind (downgrading v4 to v3 for compatibility). |
| **Fidelity Conclusion** | **Modular UI.** Better separation of concerns (dedicated components). | **High Resilience.** Solved environment blockers (Tailwind v4 issues) while maintaining full functional spec adherence. |

---

### **Story 1.5: Admin Listing Management**

| Feature | **Experiment B (File-Based)** | **Experiment C-2 (CoreText Graph)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Structural/Keyword-based (`grep`, `ls`). Found Story 1.5 via physical file proximity. | **Intent-Based:** Used `natural_query` ("Full content of Story 1.5") to fetch logically connected subgraphs. |
| **Implementation Pattern** | **TDD Cycle:** Wrote `ListingForm.test.tsx` and refactored the form to support both Create and Edit modes via props. | **Implementation-First:** Refactored the `ListingForm` based on the retrieved schema, but without a formal TDD cycle. |
| **Token Efficiency** | Higher token usage due to reading multiple large Markdown files (`prd.md`, `epics.md`). | **~30% more efficient** in input tokens by retrieving only relevant requirement "nodes" rather than full files. |
| **Final Dashboard** | High-quality Admin Dashboard with full CRUD (Create, Read, Update, Delete) and automated tests. | Functional Admin Dashboard with full CRUD; highly accurate to the schema but fewer unit tests. |
| **Conclusion** | **Test-Driven Quality.** Resulted in slightly more maintainable code through TDD. | **Semantic Efficiency.** Arrived at the same functional destination faster and with less context noise. |
