# Map View Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract API logic into a shared service, create a URL-driven view toggle, and add a Map View placeholder that respects active filters.

**Architecture:** We will create `src/services/api.js` to handle data fetching. `useProperties.js` will be refactored to use this service. We will build `ViewToggle` and `MapView` components. `App.jsx` will manage the URL state for the active view and conditionally render the map or grid, passing down the already-filtered properties.

**Tech Stack:** React, Vite, Jest, React Testing Library.

---

### Task 1: Create API Service

**Files:**
- Create: `src/services/api.js`
- Create: `src/services/api.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// src/services/api.test.js
import { fetchProperties } from './api';

describe('api service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches properties with the correct auth header', async () => {
    const mockData = [{ id: 1, title: 'Test Property' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchProperties();

    expect(global.fetch).toHaveBeenCalledWith('/api/properties', {
      headers: {
        'X-Trore-Auth': 'v1-alpha'
      }
    });
    expect(result).toEqual(mockData);
  });

  it('throws an error on network failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    await expect(fetchProperties()).rejects.toThrow('Network response was not ok');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/api.test.js`
Expected: FAIL with missing module error.

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/services/api.js
export async function fetchProperties() {
  const response = await fetch('/api/properties', {
    headers: {
      'X-Trore-Auth': 'v1-alpha'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/api.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/api.js src/services/api.test.js
git commit -m "feat: extract api fetching logic into a shared service"
```

### Task 2: Refactor useProperties hook

**Files:**
- Modify: `src/hooks/useProperties.js`
- Test: `src/hooks/useProperties.test.js` (Run existing tests)

- [ ] **Step 1: Write minimal implementation**

```javascript
// Modify src/hooks/useProperties.js to use the new service
// Replace lines 1-28 approximately
import { useState, useEffect, useMemo } from 'react';
import { fetchProperties } from '../services/api';

export function useProperties({ searchQuery = '', district = '', priceRange = '', amenities = '', page = '1' } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchProperties();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

      const selectedAmenities = amenities ? amenities.split(',') : [];
      const propertyAmenities = property.amenities || [];
      const matchAmenities = selectedAmenities.every(a => propertyAmenities.includes(a));

      return matchSearch && matchDistrict && matchPrice && matchAmenities;
    });
  }, [data, searchQuery, district, priceRange, amenities]);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, startIndex, itemsPerPage]);

  return { properties: paginatedData, totalPages, availableDistricts, loading, error };
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm test -- src/hooks/useProperties.test.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProperties.js
git commit -m "refactor: use shared api service in useProperties hook"
```

### Task 3: Create MapView Placeholder

**Files:**
- Create: `src/components/MapView.jsx`
- Create: `src/components/MapView.test.jsx`

- [ ] **Step 1: Write the failing test**

```javascript
// src/components/MapView.test.jsx
import { render, screen } from '@testing-library/react';
import { MapView } from './MapView';

describe('MapView', () => {
  it('renders a placeholder with property count', () => {
    const mockProperties = [{ id: 1 }, { id: 2 }];
    render(<MapView properties={mockProperties} />);
    
    expect(screen.getByText(/Map View Placeholder/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing 2 properties on the map/i)).toBeInTheDocument();
  });
  
  it('renders no results message when properties array is empty', () => {
    render(<MapView properties={[]} />);
    expect(screen.getByText(/No properties found for map view/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/MapView.test.jsx`
Expected: FAIL with missing module error.

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/components/MapView.jsx
export function MapView({ properties }) {
  if (!properties || properties.length === 0) {
    return <div className="no-results">No properties found for map view.</div>;
  }

  return (
    <div className="map-view-placeholder" style={{ 
        border: '2px dashed #ccc', 
        padding: '2rem', 
        textAlign: 'center', 
        minHeight: '300px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
      <h2>Map View Placeholder</h2>
      <p>Showing {properties.length} properties on the map.</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/MapView.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/MapView.jsx src/components/MapView.test.jsx
git commit -m "feat: create MapView placeholder component"
```

### Task 4: Create ViewToggle Component

**Files:**
- Create: `src/components/ViewToggle.jsx`
- Create: `src/components/ViewToggle.test.jsx`

- [ ] **Step 1: Write the failing test**

```javascript
// src/components/ViewToggle.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from './ViewToggle';
import { useUrlQuery } from '../hooks/useUrlQuery';

jest.mock('../hooks/useUrlQuery');

describe('ViewToggle', () => {
  let mockSetView;

  beforeEach(() => {
    mockSetView = jest.fn();
    useUrlQuery.mockReturnValue(['grid', mockSetView]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Grid and Map buttons', () => {
    render(<ViewToggle />);
    expect(screen.getByText('Grid View')).toBeInTheDocument();
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });

  it('calls setView when Map button is clicked', () => {
    render(<ViewToggle />);
    fireEvent.click(screen.getByText('Map View'));
    expect(mockSetView).toHaveBeenCalledWith('map');
  });

  it('calls setView when Grid button is clicked', () => {
    useUrlQuery.mockReturnValue(['map', mockSetView]);
    render(<ViewToggle />);
    fireEvent.click(screen.getByText('Grid View'));
    expect(mockSetView).toHaveBeenCalledWith('grid');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/ViewToggle.test.jsx`
Expected: FAIL with missing module error.

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/components/ViewToggle.jsx
import { useUrlQuery } from '../hooks/useUrlQuery';

export function ViewToggle() {
  const [view, setView] = useUrlQuery('view');
  const currentView = view || 'grid';

  return (
    <div className="view-toggle" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
      <button 
        onClick={() => setView('grid')}
        style={{ fontWeight: currentView === 'grid' ? 'bold' : 'normal' }}
      >
        Grid View
      </button>
      <button 
        onClick={() => setView('map')}
        style={{ fontWeight: currentView === 'map' ? 'bold' : 'normal' }}
      >
        Map View
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/ViewToggle.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ViewToggle.jsx src/components/ViewToggle.test.jsx
git commit -m "feat: create ViewToggle component to manage URL state"
```

### Task 5: Integrate Map View in App

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Write minimal implementation**

```javascript
// Modify src/App.jsx
// Need to add import for ViewToggle and MapView, read `view` from useUrlQuery, and conditionally render.
import { SearchBar } from './components/SearchBar';
import { PropertyGrid } from './components/PropertyGrid';
import { Filters } from './components/Filters';
import { AdvancedSearch } from './components/AdvancedSearch';
import { Pagination } from './components/Pagination';
import { SaveSearchButton } from './components/SaveSearchButton';
import { ViewToggle } from './components/ViewToggle';
import { MapView } from './components/MapView';
import { useProperties } from './hooks/useProperties';
import { useUrlQuery } from './hooks/useUrlQuery';
import './App.css';

function App() {
  const [searchQuery] = useUrlQuery('q');
  const [district] = useUrlQuery('district');
  const [priceRange] = useUrlQuery('priceRange');
  const [amenities] = useUrlQuery('amenities');
  const [page] = useUrlQuery('page');
  const [view] = useUrlQuery('view'); // New
  
  const { properties, totalPages, availableDistricts, loading, error } = useProperties({ 
    searchQuery, 
    district, 
    priceRange,
    amenities,
    page
  });

  const isMapView = view === 'map';

  return (
    <div className="app-container">
      <header>
        <h1>Rental Properties</h1>
        <div className="search-and-filters">
          <SearchBar />
          <Filters availableDistricts={availableDistricts} />
          <AdvancedSearch />
          <SaveSearchButton />
          <ViewToggle />
        </div>
      </header>
      
      <main>
        {error && <div className="error">Error: {error}</div>}
        {loading && !error && <div className="loading">Loading properties...</div>}
        {!loading && !error && (
          <>
            {isMapView ? (
              <MapView properties={properties} />
            ) : (
              <PropertyGrid properties={properties} />
            )}
            <Pagination totalPages={totalPages} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Run application tests to verify no breakage**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate ViewToggle and MapView into App"
```