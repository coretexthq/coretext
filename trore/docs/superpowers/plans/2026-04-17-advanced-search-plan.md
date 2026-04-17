# Advanced Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an Advanced Search section with amenity checkboxes and add pagination (4 items per page) using URL-driven state.

**Architecture:** Extend `SearchBar` for amenities, create a `Pagination` component, and update `PropertiesPage` for filtering and slicing. All state remains in URL search parameters as mandated by the project architecture.

**Tech Stack:** React, React Router (`useSearchParams`).

---

### Task 1: Create Pagination Component

**Files:**
- Create: `src/components/Pagination.jsx`
- Create: `src/components/Pagination.css`
- Create: `src/components/Pagination.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/Pagination.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pagination from './Pagination';

test('renders pagination controls correctly', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Pagination currentPage={2} totalPages={3} />
    </MemoryRouter>
  );
  
  expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
  expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Pagination.test.jsx`
Expected: FAIL due to missing component file.

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/components/Pagination.jsx
import { useSearchParams } from 'react-router-dom';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages }) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="pagination">
      <button 
        disabled={currentPage <= 1} 
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button 
        disabled={currentPage >= totalPages} 
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
```

```css
/* src/components/Pagination.css */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.pagination button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Pagination.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Pagination.jsx src/components/Pagination.css src/components/Pagination.test.jsx
git commit -m "feat: add Pagination component"
```

### Task 2: Add Advanced Search Amenities to SearchBar

**Files:**
- Modify: `src/components/SearchBar.jsx`

- [ ] **Step 1: Update SearchBar implementation**

```jsx
// src/components/SearchBar.jsx
import { useSearchParams } from 'react-router-dom';

export default function SearchBar({ districts = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const district = searchParams.get('district') || '';
  const priceRange = searchParams.get('priceRange') || '';
  
  const amenitiesParam = searchParams.get('amenities') || '';
  const activeAmenities = amenitiesParam ? amenitiesParam.split(',') : [];

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset page to 1 whenever filters change to avoid empty pages
    newParams.set('page', '1');
    setSearchParams(newParams, { replace: true });
  };

  const toggleAmenity = (amenity) => {
    let newAmenities = [...activeAmenities];
    if (newAmenities.includes(amenity)) {
      newAmenities = newAmenities.filter(a => a !== amenity);
    } else {
      newAmenities.push(amenity);
    }
    updateParams({ amenities: newAmenities.join(',') });
  };

  return (
    <div className="search-bar">
      <div className="main-search">
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
      <div className="advanced-search" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <strong>Advanced Search:</strong>
        <label>
          <input 
            type="checkbox" 
            checked={activeAmenities.includes('ac')} 
            onChange={() => toggleAmenity('ac')} 
          /> AC
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeAmenities.includes('balcony')} 
            onChange={() => toggleAmenity('balcony')} 
          /> Balcony
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeAmenities.includes('parking')} 
            onChange={() => toggleAmenity('parking')} 
          /> Parking
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SearchBar.jsx
git commit -m "feat: add advanced search amenities to SearchBar"
```

### Task 3: Integrate Pagination and Amenities in PropertiesPage

**Files:**
- Modify: `src/pages/PropertiesPage.jsx`

- [ ] **Step 1: Update PropertiesPage implementation**

```jsx
// src/pages/PropertiesPage.jsx
import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import Pagination from '../components/Pagination';
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
  const amenitiesParam = searchParams.get('amenities') || '';
  const activeAmenities = amenitiesParam ? amenitiesParam.split(',') : [];
  
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const ITEMS_PER_PAGE = 4;

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

    // Amenities filter
    const matchesAmenities = activeAmenities.every(amenity => {
      if (amenity === 'ac') return p.hasAC || (p.amenities && p.amenities.includes('AC'));
      if (amenity === 'balcony') return p.hasBalcony || (p.amenities && p.amenities.includes('Balcony'));
      if (amenity === 'parking') return p.hasParking || (p.amenities && p.amenities.includes('Parking'));
      return true;
    });

    return matchesQuery && matchesDistrict && matchesPrice && matchesAmenities;
  });

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  
  // Ensure current page is valid after filtering
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  return (
    <div className="properties-page">
      <h1>Rental Properties</h1>
      <SearchBar districts={availableDistricts} />
      <PropertyGrid properties={paginatedProperties} />
      <Pagination currentPage={validCurrentPage} totalPages={totalPages} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/PropertiesPage.jsx
git commit -m "feat: integrate pagination and amenities filtering"
```
