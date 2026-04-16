# Rental Properties Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive React app displaying rental properties with a URL-driven search bar and fetch data from a mock API requiring a custom authentication header.

**Architecture:** We will use `react-router-dom` for robust URL state management. The Vite dev server will be configured with a custom middleware plugin to mock the `/api/properties` endpoint and enforce the `X-Trore-Auth: v1-alpha` header. Components will exclusively use URL query parameters for filtering state to adhere to global invariants.

**Tech Stack:** React, react-router-dom, Vite, Vitest, Testing Library

---

### Task 1: Install Dependencies and Mock API Setup

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install React Router DOM**

Run: `npm install react-router-dom`
Expected: Installation completes successfully.

- [ ] **Step 2: Update Vite Config to Provide Mock API**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to mock the API
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use('/api/properties', (req, res) => {
      const authHeader = req.headers['x-trore-auth'];
      if (authHeader !== 'v1-alpha') {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        { id: 1, title: 'Downtown Studio', price: 1200, location: 'City Center' },
        { id: 2, title: 'Suburban 2BR', price: 1800, location: 'North Hills' },
        { id: 3, title: 'Luxury Loft', price: 2500, location: 'West End' },
        { id: 4, title: 'Cozy 1BR', price: 950, location: 'East Side' }
      ]));
    });
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
})
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "chore: add react-router-dom and mock api middleware"
```

### Task 2: Implement Data Fetching Hook

**Files:**
- Create: `src/hooks/useProperties.js`
- Create: `src/hooks/useProperties.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useProperties } from './useProperties';

// Mock global fetch
global.fetch = vi.fn();

describe('useProperties', () => {
  it('fetches properties with the correct auth header', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Test Property' }]
    });

    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.properties).toEqual([{ id: 1, title: 'Test Property' }]);
    });

    expect(fetch).toHaveBeenCalledWith('/api/properties', {
      headers: {
        'X-Trore-Auth': 'v1-alpha'
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/hooks/useProperties.test.js`
Expected: FAIL with "useProperties is not defined"

- [ ] **Step 3: Write minimal implementation**

```javascript
import { useState, useEffect } from 'react';

export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/properties', {
      headers: {
        'X-Trore-Auth': 'v1-alpha'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/hooks/useProperties.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useProperties.js src/hooks/useProperties.test.js
git commit -m "feat: add useProperties hook to fetch data with auth header"
```

### Task 3: Implement URL-Driven SearchBar

**Files:**
- Create: `src/components/SearchBar.jsx`
- Create: `src/components/SearchBar.test.jsx`

- [ ] **Step 1: Write the failing test**

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';

// Helper component to observe URL params
function LocationDisplay() {
  const [searchParams] = useSearchParams();
  return <div data-testid="location-display">{searchParams.get('q')}</div>;
}

describe('SearchBar', () => {
  it('updates URL query parameters on input change', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
        <LocationDisplay />
      </MemoryRouter>
    );
    
    const input = screen.getByPlaceholderText('Search properties...');
    fireEvent.change(input, { target: { value: 'studio' } });
    
    expect(screen.getByTestId('location-display')).toHaveTextContent('studio');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/SearchBar.test.jsx`
Expected: FAIL due to missing SearchBar component.

- [ ] **Step 3: Write minimal implementation**

```javascript
import { useSearchParams } from 'react-router-dom';

export default function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search properties..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/SearchBar.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchBar.jsx src/components/SearchBar.test.jsx
git commit -m "feat: add URL-driven SearchBar component"
```

### Task 4: Implement Property Grid and Cards

**Files:**
- Create: `src/components/PropertyGrid.jsx`
- Create: `src/components/PropertyGrid.test.jsx`

- [ ] **Step 1: Write the failing test**

```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyGrid from './PropertyGrid';

const mockProperties = [
  { id: 1, title: 'Downtown Studio', price: 1200, location: 'City Center' },
  { id: 2, title: 'Suburban 2BR', price: 1800, location: 'North Hills' }
];

describe('PropertyGrid', () => {
  it('renders correctly filtered properties based on URL query', () => {
    render(
      <MemoryRouter initialEntries={['/?q=studio']}>
        <PropertyGrid properties={mockProperties} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Downtown Studio')).toBeInTheDocument();
    expect(screen.queryByText('Suburban 2BR')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/PropertyGrid.test.jsx`
Expected: FAIL due to missing component.

- [ ] **Step 3: Write minimal implementation**

```javascript
import { useSearchParams } from 'react-router-dom';

export default function PropertyGrid({ properties }) {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();

  const filteredProperties = properties.filter((prop) =>
    prop.title.toLowerCase().includes(query)
  );

  return (
    <div className="property-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
      {filteredProperties.length > 0 ? (
        filteredProperties.map(property => (
          <div key={property.id} className="property-card" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h3>{property.title}</h3>
            <p><strong>Price:</strong> ${property.price}/mo</p>
            <p><strong>Location:</strong> {property.location}</p>
          </div>
        ))
      ) : (
        <p>No properties found.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/PropertyGrid.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PropertyGrid.jsx src/components/PropertyGrid.test.jsx
git commit -m "feat: add PropertyGrid component with client-side filtering"
```

### Task 5: Assemble the Application

**Files:**
- Create: `src/pages/PropertiesPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Write the PropertiesPage Layout**

```javascript
// src/pages/PropertiesPage.jsx
import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';

export default function PropertiesPage() {
  const { properties, loading, error } = useProperties();

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="properties-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Rental Properties</h1>
      <SearchBar />
      <PropertyGrid properties={properties} />
    </div>
  );
}
```

- [ ] **Step 2: Update App Component**

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropertiesPage from './pages/PropertiesPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="/properties" element={<PropertiesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: Update main.jsx for StrictMode wrapper**
(Optional check, main.jsx already has App.jsx imported directly, no changes needed if App handles the BrowserRouter).

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PropertiesPage.jsx src/App.jsx
git commit -m "feat: assemble application layout and router setup"
```
