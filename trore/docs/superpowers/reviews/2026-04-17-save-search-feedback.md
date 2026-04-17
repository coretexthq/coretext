# Code Review: Save Search

### Strengths
- **Clean Implementation:** The `SaveSearchButton` cleanly isolates the API interaction and UI state for saving a search.
- **Good Test Coverage:** You successfully added tests for both the new component and its integration into `SearchBar`.
- **Architectural Alignment:** The implementation strictly adheres to the "URL-Driven State Only" invariant by reading filter values directly from `useSearchParams`. The `useState` hook is correctly used only for local UI status feedback (idle/saving/saved/error), which complies with the "No Local State for Filters" invariant.

### Issues

#### Critical (Must Fix)
- None.

#### Important (Should Fix)
- None.

#### Minor (Nice to Have)
- **Unmounted Component State Update:** In `SaveSearchButton.jsx`, `setTimeout` is used to reset the `status` back to `'idle'`. If the user navigates away or the component unmounts before the 3-second timeout completes, this might cause a memory leak or a React state update warning. It is recommended to use a `useEffect` with a cleanup function (clearing the timeout) to handle this gracefully.

### Assessment

**Ready to proceed?** Yes

**Reasoning:** The implementation matches the plan perfectly, does not violate any global architectural constraints, maintains clean separation of concerns, and includes appropriate tests. The minor issue with `setTimeout` cleanup does not block progress.