### What Was Implemented
Added District and Price Range dropdown filters to the `SearchBar` component. Implemented client-side filtering logic in `PropertiesPage` to parse URL query parameters and filter the property list accordingly before rendering the `PropertyGrid`.

**Fixes based on feedback:**
Removed redundant `useSearchParams` and internal filtering logic from `PropertyGrid.jsx`, making it a pure presentational component that maps over the `properties` prop. Updated `PropertyGrid.test.jsx` to reflect this change.

### Requirements/Plan
Plan: `docs/superpowers/plans/2026-04-17-dropdown-filters-plan.md`
Tasks executed:
- Task 1: Update SearchBar Component to Include Dropdowns
- Task 2: Implement Client-Side Filtering in PropertiesPage
- Feedback fix: Made PropertyGrid a pure presentational component

### Git Range to Review
**Base:** c94a435059a7c5fecb9ab2e293f6d0337b844218
**Head:** b3f82136deb6ab031f652b046f92a94d3236e268