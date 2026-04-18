# Save Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a "Save Search" feature that allows users to POST their current active filters (stored in URL parameters) to a `/api/saved-searches` endpoint.
**Architecture:** Add a new Vite middleware endpoint for the mock backend, build a `useSaveSearch` custom hook to handle the POST request, and create a `SaveSearchButton` UI component that reads the URL and triggers the save.
**Tech Stack:** React, Vite (Middleware), JS DOM Testing Library

---

### Task 1: Update Mock Backend in Vite Config

**Files:**
- Modify: `trore/vite.config.js`

- [ ] **Step 1: Add mock endpoint to middleware**

Update the `configureServer` middleware in `trore/vite.config.js` to handle `POST /api/saved-searches`.

```javascript
// Add inside configureServer(server) { server.middlewares.use(...) } block in trore/vite.config.js:
// ... existing GET /api/properties block
if (req.method === 'POST' && req.url === '/api/saved-searches') {
  if (req.headers['x-trore-auth'] !== 'v1-alpha') {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, savedFilters: JSON.parse(body) }));
  });
  return;
}
```

- [ ] **Step 2: Commit**

```bash
git add trore/vite.config.js
git commit -m "chore: add mock endpoint for saved-searches"
```

### Task 2: Create `useSaveSearch` Hook

**Files:**
- Create: `trore/src/hooks/useSaveSearch.js`
- Create: `trore/src/hooks/useSaveSearch.test.js`

- [ ] **Step 1: Write the failing test**

Create `trore/src/hooks/useSaveSearch.test.js`:

```javascript
import { renderHook, act } from '@testing-library/react';
import { useSaveSearch } from './useSaveSearch';

describe('useSaveSearch', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('performs a POST request with the correct payload and headers', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    
    const { result } = renderHook(() => useSaveSearch());
    
    await act(async () => {
      await result.current.saveSearch({ q: 'studio', district: 'D1' });
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/saved-searches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trore-Auth': 'v1-alpha'
      },
      body: JSON.stringify({ q: 'studio', district: 'D1' })
    });
    
    expect(result.current.success).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/hooks/useSaveSearch.test.js run`
Expected: FAIL due to missing `useSaveSearch` hook.

- [ ] **Step 3: Write minimal implementation**

Create `trore/src/hooks/useSaveSearch.js`:

```javascript
import { useState } from 'react';

export function useSaveSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const saveSearch = async (filters) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': 'v1-alpha'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { saveSearch, loading, error, success };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test -- src/hooks/useSaveSearch.test.js run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd ..
git add trore/src/hooks/useSaveSearch.js trore/src/hooks/useSaveSearch.test.js
git commit -m "feat: add useSaveSearch hook"
```

### Task 3: Create `SaveSearchButton` Component

**Files:**
- Create: `trore/src/components/SaveSearchButton.jsx`
- Create: `trore/src/components/SaveSearchButton.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `trore/src/components/SaveSearchButton.test.jsx`:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveSearchButton } from './SaveSearchButton';
import { useSaveSearch } from '../hooks/useSaveSearch';

vi.mock('../hooks/useSaveSearch');

describe('SaveSearchButton', () => {
  it('calls saveSearch with current URL parameters when clicked', () => {
    const mockSaveSearch = vi.fn();
    useSaveSearch.mockReturnValue({
      saveSearch: mockSaveSearch,
      loading: false,
      success: false
    });

    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: { search: '?q=studio&district=D1' },
      writable: true
    });

    render(<SaveSearchButton />);
    
    const button = screen.getByRole('button', { name: /save search/i });
    fireEvent.click(button);

    expect(mockSaveSearch).toHaveBeenCalledWith({ q: 'studio', district: 'D1' });
  });

  it('shows saving state', () => {
    useSaveSearch.mockReturnValue({
      saveSearch: vi.fn(),
      loading: true,
      success: false
    });

    render(<SaveSearchButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Saving...');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test -- src/components/SaveSearchButton.test.jsx run`
Expected: FAIL due to missing component.

- [ ] **Step 3: Write minimal implementation**

Create `trore/src/components/SaveSearchButton.jsx`:

```javascript
import { useSaveSearch } from '../hooks/useSaveSearch';

export function SaveSearchButton() {
  const { saveSearch, loading, success } = useSaveSearch();

  const handleSave = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const filters = Object.fromEntries(searchParams.entries());
    
    // Only save if there are active filters
    if (Object.keys(filters).length > 0) {
      saveSearch(filters);
    }
  };

  return (
    <div className="save-search-container">
      <button 
        onClick={handleSave} 
        disabled={loading || success}
        className="save-search-btn"
      >
        {loading ? 'Saving...' : success ? 'Saved!' : 'Save Search'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test -- src/components/SaveSearchButton.test.jsx run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd ..
git add trore/src/components/SaveSearchButton.jsx trore/src/components/SaveSearchButton.test.jsx
git commit -m "feat: add SaveSearchButton component"
```

### Task 4: Integrate `SaveSearchButton` into App

**Files:**
- Modify: `trore/src/App.jsx`

- [ ] **Step 1: Integrate into App.jsx**

Edit `trore/src/App.jsx` to import and render `<SaveSearchButton />` inside the header's `.search-and-filters` container.

```javascript
// Add import at the top of trore/src/App.jsx
import { SaveSearchButton } from './components/SaveSearchButton';

// Locate <div className="search-and-filters"> block inside the render method and add the button
        <div className="search-and-filters">
          <SearchBar />
          <Filters availableDistricts={availableDistricts} />
          <AdvancedSearch />
          <SaveSearchButton />
        </div>
```

- [ ] **Step 2: Verify application builds**

Run: `cd trore && npm run build`
Expected: Successful build with no errors.

- [ ] **Step 3: Commit**

```bash
cd ..
git add trore/src/App.jsx
git commit -m "feat: integrate SaveSearchButton into main App"
```