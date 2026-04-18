# District and Price Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement District and Price Range dropdown filters using URL-driven state and client-side data filtering.

**Architecture:** We will update `useProperties` to filter by district and price range locally. A new `Filters` component will use `useUrlQuery` to sync dropdown state with the URL. `App.jsx` will tie them together.

**Tech Stack:** React, URLSearchParams.

---

### Task 1: Update `useProperties` hook to support new filters

**Files:**
- Modify: `trore/src/hooks/useProperties.js`
- Modify: `trore/src/hooks/useProperties.test.js`

- [ ] **Step 1: Write the failing tests**

```javascript
// In trore/src/hooks/useProperties.test.js (assuming it exists, otherwise create it)
import { renderHook, waitFor } from '@testing-library/react';
import { useProperties } from './useProperties';

// Mock global fetch for testing
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, title: 'Studio', district: 'Downtown', price: 900 },
      { id: 2, title: 'Loft', district: 'Uptown', price: 1500 },
      { id: 3, title: 'Villa', district: 'Suburbs', price: 2500 }
    ]),
  })
);

describe('useProperties', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('filters by district', async () => {
    const { result } = renderHook(() => useProperties({ searchQuery: '', district: 'Uptown', priceRange: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toHaveLength(1);
    expect(result.current.properties[0].district).toBe('Uptown');
  });

  it('filters by price range (under-1000)', async () => {
    const { result } = renderHook(() => useProperties({ searchQuery: '', district: '', priceRange: 'under-1000' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toHaveLength(1);
    expect(result.current.properties[0].price).toBeLessThan(1000);
  });

  it('returns available districts', async () => {
    const { result } = renderHook(() => useProperties({ searchQuery: '', district: '', priceRange: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.availableDistricts).toEqual(['Downtown', 'Uptown', 'Suburbs']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- useProperties.test.js` (or the equivalent test command).
Expected: Tests fail because the hook doesn't accept the options object or implement the new filtering/districts return.

- [ ] **Step 3: Write the implementation**

```javascript
// In trore/src/hooks/useProperties.js
import { useState, useEffect, useMemo } from 'react';

export function useProperties({ searchQuery = '', district = '', priceRange = '' } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties', {
          headers: {
            'X-Trore-Auth': 'v1-alpha'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const availableDistricts = useMemo(() => {
    const districts = new Set(data.map(p => p.district).filter(Boolean));
    return Array.from(districts).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(property => {
      const matchSearch = property.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDistrict = district ? property.district === district : true;
      
      let matchPrice = true;
      if (priceRange === 'under-1000') matchPrice = property.price < 1000;
      else if (priceRange === '1000-2000') matchPrice = property.price >= 1000 && property.price <= 2000;
      else if (priceRange === 'over-2000') matchPrice = property.price > 2000;

      return matchSearch && matchDistrict && matchPrice;
    });
  }, [data, searchQuery, district, priceRange]);

  return { properties: filteredData, availableDistricts, loading, error };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test -- useProperties.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd trore
git add src/hooks/useProperties.js src/hooks/useProperties.test.js
git commit -m "feat: add district and price filtering to useProperties hook"
```

### Task 2: Create the `Filters` Component

**Files:**
- Create: `trore/src/components/Filters.jsx`
- Create: `trore/src/components/Filters.test.jsx`

- [ ] **Step 1: Write the failing tests**

```javascript
// In trore/src/components/Filters.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Filters } from './Filters';
import * as useUrlQueryHook from '../hooks/useUrlQuery';
import { vi } from 'vitest';

vi.mock('../hooks/useUrlQuery');

describe('Filters', () => {
  it('renders dropdowns and updates url query', () => {
    const setDistrictMock = vi.fn();
    const setPriceRangeMock = vi.fn();
    
    useUrlQueryHook.useUrlQuery.mockImplementation((param) => {
      if (param === 'district') return ['Downtown', setDistrictMock];
      if (param === 'priceRange') return ['under-1000', setPriceRangeMock];
      return ['', vi.fn()];
    });

    render(<Filters availableDistricts={['Downtown', 'Uptown']} />);
    
    const districtSelect = screen.getByLabelText(/District/i);
    expect(districtSelect.value).toBe('Downtown');
    fireEvent.change(districtSelect, { target: { value: 'Uptown' } });
    expect(setDistrictMock).toHaveBeenCalledWith('Uptown');

    const priceSelect = screen.getByLabelText(/Price Range/i);
    expect(priceSelect.value).toBe('under-1000');
    fireEvent.change(priceSelect, { target: { value: 'over-2000' } });
    expect(setPriceRangeMock).toHaveBeenCalledWith('over-2000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- Filters.test.jsx`
Expected: FAIL because `Filters.jsx` doesn't exist.

- [ ] **Step 3: Write the minimal implementation**

```javascript
// In trore/src/components/Filters.jsx
import { useUrlQuery } from '../hooks/useUrlQuery';

export function Filters({ availableDistricts = [] }) {
  const [district, setDistrict] = useUrlQuery('district');
  const [priceRange, setPriceRange] = useUrlQuery('priceRange');

  return (
    <div className="filters">
      <label>
        District:
        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {availableDistricts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>

      <label>
        Price Range:
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">All Prices</option>
          <option value="under-1000">Under $1000</option>
          <option value="1000-2000">$1000 - $2000</option>
          <option value="over-2000">Over $2000</option>
        </select>
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test -- Filters.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd trore
git add src/components/Filters.jsx src/components/Filters.test.jsx
git commit -m "feat: create Filters component with URL-driven state"
```

### Task 3: Integrate Filters into App.jsx

**Files:**
- Modify: `trore/src/App.jsx`

- [ ] **Step 1: Write the implementation**

```javascript
// In trore/src/App.jsx
import { SearchBar } from './components/SearchBar';
import { PropertyGrid } from './components/PropertyGrid';
import { Filters } from './components/Filters';
import { useProperties } from './hooks/useProperties';
import { useUrlQuery } from './hooks/useUrlQuery';
import './App.css';

function App() {
  const [searchQuery] = useUrlQuery('q');
  const [district] = useUrlQuery('district');
  const [priceRange] = useUrlQuery('priceRange');
  
  const { properties, availableDistricts, loading, error } = useProperties({ 
    searchQuery, 
    district, 
    priceRange 
  });

  return (
    <div className="app-container">
      <header>
        <h1>Rental Properties</h1>
        <div className="search-and-filters">
          <SearchBar />
          <Filters availableDistricts={availableDistricts} />
        </div>
      </header>
      
      <main>
        {error && <div className="error">Error: {error}</div>}
        {loading && !error && <div className="loading">Loading properties...</div>}
        {!loading && !error && <PropertyGrid properties={properties} />}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Run tests to verify the integration**

Run: `cd trore && npm run test`
Expected: All tests pass. 

*(Note: we may need to update App.test.jsx if it exists and asserts on useProperties arguments, but for this step verifying the app runs is sufficient)*

- [ ] **Step 3: Commit**

```bash
cd trore
git add src/App.jsx
git commit -m "feat: integrate Filters into App and connect URL state to data hooks"
```
