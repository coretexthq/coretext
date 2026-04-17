# Rental Properties Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive React property grid with a text search bar, fetching from an authenticated mock API and using URL search params for state.

**Architecture:** Use a Vite dev server middleware for the mock API, `useSyncExternalStore` for URL state management, and custom hooks for data fetching to enforce constraints.

**Tech Stack:** React 19, Vite, Vanilla CSS.

---

### Task 1: Setup Mock API in Vite

**Files:**
- Modify: `trore/vite.config.js`

- [ ] **Step 1: Add mock data and middleware to vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mockProperties = [
  { id: 1, title: 'Sunny Studio in Downtown', price: 1200, district: 'D1' },
  { id: 2, title: 'Modern 1BR with Balcony', price: 1500, district: 'D2' },
  { id: 3, title: 'Spacious 2BR Family Home', price: 2200, district: 'D1' },
  { id: 4, title: 'Cozy Loft near Station', price: 1100, district: 'D3' }
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use('/api/properties', (req, res, next) => {
          if (req.url === '/api/properties') {
            if (req.headers['x-trore-auth'] !== 'v1-alpha') {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Unauthorized' }));
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mockProperties));
            return;
          }
          next();
        });
      }
    }
  ],
})
```

- [ ] **Step 2: Commit changes**

```bash
cd trore
git add vite.config.js
git commit -m "feat: add mock api middleware for properties"
```

### Task 2: Create URL State Hook

**Files:**
- Create: `trore/src/hooks/useUrlQuery.js`
- Create: `trore/src/hooks/useUrlQuery.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
import { renderHook, act } from '@testing-library/react';
import { useUrlQuery } from './useUrlQuery';

describe('useUrlQuery', () => {
  it('reads and updates URL query param', () => {
    delete window.location;
    window.location = new URL('http://localhost');
    
    const { result } = renderHook(() => useUrlQuery('q'));
    expect(result.current[0]).toBe('');

    act(() => {
      result.current[1]('studio');
    });

    expect(window.location.search).toBe('?q=studio');
    expect(result.current[0]).toBe('studio');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/hooks/useUrlQuery.test.js --run`
Expected: FAIL with "useUrlQuery is not defined" or similar

- [ ] **Step 3: Write minimal implementation**

```javascript
import { useSyncExternalStore, useCallback } from 'react';

function subscribe(callback) {
  window.addEventListener('popstate', callback);
  window.addEventListener('urlchange', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('urlchange', callback);
  };
}

function getSnapshot() {
  return window.location.search;
}

export function useUrlQuery(param) {
  const search = useSyncExternalStore(subscribe, getSnapshot);
  const query = new URLSearchParams(search).get(param) || '';

  const setQuery = useCallback((newValue) => {
    const url = new URL(window.location);
    if (newValue) {
      url.searchParams.set(param, newValue);
    } else {
      url.searchParams.delete(param);
    }
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('urlchange'));
  }, [param]);

  return [query, setQuery];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test -- src/hooks/useUrlQuery.test.js --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd trore
git add src/hooks/useUrlQuery.js src/hooks/useUrlQuery.test.js
git commit -m "feat: add useUrlQuery hook"
```

### Task 3: Create Data Fetching Hook

**Files:**
- Create: `trore/src/hooks/useProperties.js`

- [ ] **Step 1: Write implementation**

```javascript
import { useState, useEffect } from 'react';

export function useProperties(searchQuery) {
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

  const filteredData = data.filter(property => 
    property.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { properties: filteredData, loading, error };
}
```

- [ ] **Step 2: Commit**

```bash
cd trore
git add src/hooks/useProperties.js
git commit -m "feat: add useProperties hook"
```

### Task 4: Create UI Components

**Files:**
- Create: `trore/src/components/SearchBar.jsx`
- Create: `trore/src/components/PropertyCard.jsx`
- Create: `trore/src/components/PropertyGrid.jsx`

- [ ] **Step 1: Write SearchBar component**

```javascript
import { useUrlQuery } from '../hooks/useUrlQuery';

export function SearchBar() {
  const [query, setQuery] = useUrlQuery('q');

  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search properties by title..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
    </div>
  );
}
```

- [ ] **Step 2: Write PropertyCard component**

```javascript
export function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <p>District: {property.district}</p>
      <p className="price">${property.price}/mo</p>
    </div>
  );
}
```

- [ ] **Step 3: Write PropertyGrid component**

```javascript
import { PropertyCard } from './PropertyCard';

export function PropertyGrid({ properties }) {
  if (properties.length === 0) {
    return <div className="no-results">No properties found.</div>;
  }

  return (
    <div className="property-grid">
      {properties.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit components**

```bash
cd trore
git add src/components/
git commit -m "feat: add SearchBar, PropertyGrid, and PropertyCard components"
```

### Task 5: Assemble App and Styling

**Files:**
- Modify: `trore/src/App.jsx`
- Modify: `trore/src/App.css`

- [ ] **Step 1: Update App.jsx**

```javascript
import { SearchBar } from './components/SearchBar';
import { PropertyGrid } from './components/PropertyGrid';
import { useProperties } from './hooks/useProperties';
import { useUrlQuery } from './hooks/useUrlQuery';
import './App.css';

function App() {
  const [query] = useUrlQuery('q');
  const { properties, loading, error } = useProperties(query);

  return (
    <div className="app-container">
      <header>
        <h1>Rental Properties</h1>
        <SearchBar />
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

- [ ] **Step 2: Replace App.css**

```css
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

.search-bar input {
  padding: 0.75rem;
  width: 100%;
  max-width: 400px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.property-card {
  border: 1px solid #eee;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  background: white;
}

.property-card h3 {
  margin-top: 0;
  color: #333;
}

.price {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.2rem;
}
```

- [ ] **Step 3: Commit App integration**

```bash
cd trore
git add src/App.jsx src/App.css
git commit -m "feat: integrate components into App and add styling"
```
