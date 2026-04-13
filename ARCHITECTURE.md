# 🛑 GLOBAL INVARIANTS (The "Must-Not Violate" Constraints)

1.  **URL-Driven State Only:** All search queries, active filters, and pagination states MUST be managed exclusively via URL query parameters (e.g., `?q=studio&district=D1&page=2`).
2.  **No Local State for Filters:** UI components are strictly prohibited from using local component state (e.g., React `useState`) to store or manage filter selections.
3.  **Mock Data Isolation:** The core mock data array must remain unmodified and isolated from the UI components.
