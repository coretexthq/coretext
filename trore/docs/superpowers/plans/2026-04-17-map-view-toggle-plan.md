# Map View Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract API fetching logic into a shared service and add a toggle to switch between a PropertyGrid view and a new MapView placeholder, using URL-driven state for the view toggle.

**Architecture:** A new API service module handles the fetch. A new `ViewToggle` component updates the URL parameter `view`. `PropertiesPage` conditionally renders `PropertyGrid` or `MapView` (a placeholder component) based on the URL parameter.

**Tech Stack:** React, React Router (`useSearchParams`), Vite, Vitest, React Testing Library.

---

### Task 1: Extract API logic into a shared service

**Files:**
- Create: `trore/src/services/propertyService.js`
- Create: `trore/src/services/propertyService.test.js`
- Modify: `trore/src/hooks/useProperties.js`

- [ ] **Step 1: Write the service test**

```javascript
// trore/src/services/propertyService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProperties } from './propertyService';

describe('propertyService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('fetches properties with auth header', async () => {
    const mockData = [{ id: 1, title: 'Test Property' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const data = await fetchProperties();
    expect(global.fetch).toHaveBeenCalledWith('/api/properties', {
      headers: { 'X-Trore-Auth': 'v1-alpha' }
    });
    expect(data).toEqual(mockData);
  });

  it('throws an error if response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchProperties()).rejects.toThrow('Failed to fetch');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/services/propertyService.test.js`
Expected: FAIL due to missing file/function

- [ ] **Step 3: Implement propertyService.js**

```javascript
// trore/src/services/propertyService.js
export async function fetchProperties() {
  const res = await fetch('/api/properties', {
    headers: {
      'X-Trore-Auth': 'v1-alpha'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

- [ ] **Step 4: Update useProperties hook to use the service**

```javascript
// trore/src/hooks/useProperties.js
import { useState, useEffect } from 'react';
import { fetchProperties } from '../services/propertyService';

export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties()
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { properties, loading, error };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd trore && npm run test -- src/services/propertyService.test.js src/hooks/useProperties.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd trore
git add src/services/propertyService.js src/services/propertyService.test.js src/hooks/useProperties.js
git commit -m "refactor: extract property fetch logic into service"
```

### Task 2: Create ViewToggle component

**Files:**
- Create: `trore/src/components/ViewToggle.jsx`
- Create: `trore/src/components/ViewToggle.test.jsx`
- Create: `trore/src/components/ViewToggle.css`

- [ ] **Step 1: Write the ViewToggle test**

```javascript
// trore/src/components/ViewToggle.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import ViewToggle from './ViewToggle';

// Helper component to read URL params
function SearchParamsReader() {
  const [searchParams] = useSearchParams();
  return <div data-testid="view-param">{searchParams.get('view') || 'grid'}</div>;
}

describe('ViewToggle component', () => {
  it('toggles URL view parameter to map and back', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <ViewToggle />
        <SearchParamsReader />
      </MemoryRouter>
    );

    const mapButton = screen.getByRole('button', { name: /map view/i });
    const gridButton = screen.getByRole('button', { name: /grid view/i });
    
    // Initially grid view by default
    expect(screen.getByTestId('view-param').textContent).toBe('grid');

    // Click map button
    fireEvent.click(mapButton);
    expect(screen.getByTestId('view-param').textContent).toBe('map');

    // Click grid button
    fireEvent.click(gridButton);
    expect(screen.getByTestId('view-param').textContent).toBe('grid');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/components/ViewToggle.test.jsx`
Expected: FAIL due to missing file

- [ ] **Step 3: Implement ViewToggle**

```javascript
// trore/src/components/ViewToggle.jsx
import { useSearchParams } from 'react-router-dom';
import './ViewToggle.css';

export default function ViewToggle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'grid';

  const handleToggle = (viewName) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (viewName === 'grid') {
        newParams.delete('view');
      } else {
        newParams.set('view', viewName);
      }
      return newParams;
    });
  };

  return (
    <div className="view-toggle">
      <button 
        className={currentView === 'grid' ? 'active' : ''} 
        onClick={() => handleToggle('grid')}
      >
        Grid View
      </button>
      <button 
        className={currentView === 'map' ? 'active' : ''} 
        onClick={() => handleToggle('map')}
      >
        Map View
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create ViewToggle styling**

```css
/* trore/src/components/ViewToggle.css */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}

.view-toggle button.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd trore && npm run test -- src/components/ViewToggle.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd trore
git add src/components/ViewToggle.jsx src/components/ViewToggle.test.jsx src/components/ViewToggle.css
git commit -m "feat: add ViewToggle component"
```

### Task 3: Create MapView placeholder component

**Files:**
- Create: `trore/src/components/MapView.jsx`
- Create: `trore/src/components/MapView.test.jsx`
- Create: `trore/src/components/MapView.css`

- [ ] **Step 1: Write MapView test**

```javascript
// trore/src/components/MapView.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapView from './MapView';

describe('MapView component', () => {
  it('renders a placeholder with the number of properties', () => {
    const mockProperties = [
      { id: '1', title: 'Property 1' },
      { id: '2', title: 'Property 2' }
    ];
    render(<MapView properties={mockProperties} />);
    
    expect(screen.getByText(/Map View Placeholder/i)).toBeInTheDocument();
    expect(screen.getByText(/Displaying 2 properties on the map/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/components/MapView.test.jsx`
Expected: FAIL due to missing file

- [ ] **Step 3: Implement MapView**

```javascript
// trore/src/components/MapView.jsx
import './MapView.css';

export default function MapView({ properties }) {
  return (
    <div className="map-view-placeholder">
      <h2>Map View Placeholder</h2>
      <p>Displaying {properties.length} properties on the map.</p>
    </div>
  );
}
```

- [ ] **Step 4: Create MapView styling**

```css
/* trore/src/components/MapView.css */
.map-view-placeholder {
  min-height: 400px;
  background-color: #e5e7eb;
  border: 2px dashed #9ca3af;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  margin-bottom: 2rem;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd trore && npm run test -- src/components/MapView.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd trore
git add src/components/MapView.jsx src/components/MapView.test.jsx src/components/MapView.css
git commit -m "feat: add MapView placeholder component"
```

### Task 4: Integrate MapView and ViewToggle into PropertiesPage

**Files:**
- Modify: `trore/src/pages/PropertiesPage.jsx`
- Modify: `trore/src/pages/PropertiesPage.test.jsx`

- [ ] **Step 1: Update PropertiesPage test to verify conditional rendering**

```javascript
// Add to trore/src/pages/PropertiesPage.test.jsx (or create if needed)
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertiesPage from './PropertiesPage';

// Mock hook
vi.mock('../hooks/useProperties', () => ({
  useProperties: () => ({
    properties: [
      { id: '1', title: 'Prop 1', district: 'D1', price: 1500, hasAC: true },
      { id: '2', title: 'Prop 2', district: 'D2', price: 2500, hasAC: false }
    ],
    loading: false,
    error: null
  })
}));

describe('PropertiesPage View Toggling', () => {
  it('renders PropertyGrid by default', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <PropertiesPage />
      </MemoryRouter>
    );
    // Presuming PropertyGrid renders property titles
    expect(screen.getByText('Prop 1')).toBeInTheDocument();
  });

  it('renders MapView when view=map URL param is present', () => {
    render(
      <MemoryRouter initialEntries={['/properties?view=map']}>
        <PropertiesPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Map View Placeholder/i)).toBeInTheDocument();
    // Assuming MapView renders text about total filtered properties
    expect(screen.getByText(/Displaying 2 properties on the map/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/pages/PropertiesPage.test.jsx`
Expected: FAIL because `MapView` logic isn't in `PropertiesPage` yet.

- [ ] **Step 3: Update PropertiesPage to conditionally render views**

```javascript
// Replace the return block in trore/src/pages/PropertiesPage.jsx with:
import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import ViewToggle from '../components/ViewToggle';
import MapView from '../components/MapView';
import './PropertiesPage.css';

// ... existing component logic up to paginatedProperties ...

  const currentView = searchParams.get('view') || 'grid';

  return (
    <div className="properties-page">
      <h1>Rental Properties</h1>
      <SearchBar districts={availableDistricts} />
      
      <div className="view-controls" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ViewToggle />
      </div>

      {currentView === 'map' ? (
        <MapView properties={filteredProperties} />
      ) : (
        <>
          <PropertyGrid properties={paginatedProperties} />
          <Pagination currentPage={validCurrentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
```

*(Note: ensure all existing import logic remains intact, just add the new imports for `ViewToggle` and `MapView` at the top and update the `return` statement.)*

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd trore && npm run test -- src/pages/PropertiesPage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd trore
git add src/pages/PropertiesPage.jsx src/pages/PropertiesPage.test.jsx
git commit -m "feat: integrate MapView and ViewToggle into PropertiesPage"
```
