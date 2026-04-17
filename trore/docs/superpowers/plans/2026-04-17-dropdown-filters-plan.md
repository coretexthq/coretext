# Dropdown Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add District and Price Range dropdown filters that filter properties locally via URL query parameters.

**Architecture:** Update `SearchBar` to include the dropdowns and manage URL state. Update `PropertiesPage` to read the URL and filter the client-side `properties` array before rendering.

**Tech Stack:** React, React Router (`useSearchParams`), JavaScript.

---

### Task 1: Update SearchBar Component to Include Dropdowns

**Files:**
- Modify: `src/components/SearchBar.jsx`
- Modify: `src/components/SearchBar.test.jsx`

- [ ] **Step 1: Write failing tests for SearchBar dropdowns**

Modify `src/components/SearchBar.test.jsx` to check for the presence of the two selects. Ensure it handles the `districts` prop correctly.

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import { expect, test } from 'vitest';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

test('renders district and price range dropdowns', () => {
  renderWithRouter(<SearchBar districts={['D1', 'D2']} />);
  expect(screen.getByRole('combobox', { name: /district/i })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /price range/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/SearchBar.test.jsx`
Expected: FAIL (combobox not found)

- [ ] **Step 3: Update SearchBar implementation**

Modify `src/components/SearchBar.jsx` to accept `districts` prop and include the dropdowns, updating URL params directly.

```jsx
import { useSearchParams } from 'react-router-dom';

export default function SearchBar({ districts = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const district = searchParams.get('district') || '';
  const priceRange = searchParams.get('priceRange') || '';

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search properties..."
        value={query}
        onChange={(e) => updateParams({ q: e.target.value })}
        aria-label="Search"
      />
      <select 
        value={district} 
        onChange={(e) => updateParams({ district: e.target.value })}
        aria-label="District"
      >
        <option value="">All Districts</option>
        {districts.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select 
        value={priceRange} 
        onChange={(e) => updateParams({ priceRange: e.target.value })}
        aria-label="Price Range"
      >
        <option value="">All Prices</option>
        <option value="0-1000">Under $1000</option>
        <option value="1000-2000">$1000 - $2000</option>
        <option value="2000+">Over $2000</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/SearchBar.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/SearchBar.jsx src/components/SearchBar.test.jsx
git commit -m "feat: add district and price range dropdowns to SearchBar"
```

### Task 2: Implement Client-Side Filtering in PropertiesPage

**Files:**
- Modify: `src/pages/PropertiesPage.jsx`

- [ ] **Step 1: Write the filtering logic implementation**

Modify `src/pages/PropertiesPage.jsx` to parse the URL parameters, compute available districts, and filter the `properties` array before passing it to `PropertyGrid`.

```jsx
import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import './PropertiesPage.css';

export default function PropertiesPage() {
  const { properties, loading, error } = useProperties();
  const [searchParams] = useSearchParams();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;

  const query = (searchParams.get('q') || '').toLowerCase();
  const districtFilter = searchParams.get('district');
  const priceRangeFilter = searchParams.get('priceRange');

  const availableDistricts = Array.from(
    new Set(properties.map(p => p.district).filter(Boolean))
  ).sort();

  const filteredProperties = properties.filter(p => {
    // Text search filter
    const matchesQuery = query 
      ? (p.title && p.title.toLowerCase().includes(query)) || 
        (p.description && p.description.toLowerCase().includes(query))
      : true;

    // District filter
    const matchesDistrict = districtFilter ? p.district === districtFilter : true;

    // Price filter
    let matchesPrice = true;
    if (priceRangeFilter && p.price !== undefined) {
      if (priceRangeFilter === '0-1000') matchesPrice = p.price < 1000;
      else if (priceRangeFilter === '1000-2000') matchesPrice = p.price >= 1000 && p.price <= 2000;
      else if (priceRangeFilter === '2000+') matchesPrice = p.price > 2000;
    }

    return matchesQuery && matchesDistrict && matchesPrice;
  });

  return (
    <div className="properties-page">
      <h1>Rental Properties</h1>
      <SearchBar districts={availableDistricts} />
      <PropertyGrid properties={filteredProperties} />
    </div>
  );
}
```

- [ ] **Step 2: Verify the page builds**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/pages/PropertiesPage.jsx
git commit -m "feat: implement client-side URL-driven filtering for properties"
```
