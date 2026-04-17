# Save Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a "Save Search" button that reads the current filter state from URL parameters and POSTs it to the `/api/saved-searches` endpoint.

**Architecture:** Create a new `SaveSearchButton` component to isolate the API and UI feedback logic for saving a search, ensuring it reads filter values strictly from `useSearchParams` to adhere to the URL-driven state invariant. Integrate this button into the existing `SearchBar` component.

**Tech Stack:** React, React Router (`useSearchParams`), fetch API, Vitest/React Testing Library.

---

### Task 1: Create `SaveSearchButton` Component

**Files:**
- Create: `trore/src/components/SaveSearchButton.jsx`
- Create: `trore/src/components/SaveSearchButton.test.jsx`

- [ ] **Step 1: Write the failing test for SaveSearchButton**

```jsx
// trore/src/components/SaveSearchButton.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import SaveSearchButton from './SaveSearchButton';
import { vi } from 'vitest';

// Mock component to set initial search params
const SetupComponent = () => {
  const [, setSearchParams] = useSearchParams();
  return (
    <button onClick={() => setSearchParams({ q: 'test', district: 'D1', amenities: 'ac,parking' })}>
      Set Params
    </button>
  );
};

describe('SaveSearchButton', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST request with correct payload from URL params', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SetupComponent />
        <SaveSearchButton />
      </MemoryRouter>
    );

    // Set URL params first
    fireEvent.click(screen.getByText('Set Params'));

    const saveBtn = screen.getByRole('button', { name: /save search/i });
    fireEvent.click(saveBtn);

    expect(saveBtn).toBeDisabled();
    expect(saveBtn).toHaveTextContent(/saving/i);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'test',
          district: 'D1',
          priceRange: null,
          amenities: ['ac', 'parking']
        }),
      });
    });

    expect(screen.getByRole('button')).toHaveTextContent(/saved/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test src/components/SaveSearchButton.test.jsx`
Expected: FAIL (Component does not exist)

- [ ] **Step 3: Write minimal implementation**

```jsx
// trore/src/components/SaveSearchButton.jsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SaveSearchButton() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle'); // idle, saving, saved, error

  const handleSave = async () => {
    setStatus('saving');

    const q = searchParams.get('q');
    const district = searchParams.get('district');
    const priceRange = searchParams.get('priceRange');
    const amenitiesParam = searchParams.get('amenities');
    const amenities = amenitiesParam ? amenitiesParam.split(',') : [];

    const payload = {
      q,
      district,
      priceRange,
      amenities
    };

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      setStatus('saved');
      
      // Reset back to idle after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button 
      onClick={handleSave} 
      disabled={status === 'saving' || status === 'saved'}
      className="save-search-btn"
    >
      {status === 'idle' && 'Save Search'}
      {status === 'saving' && 'Saving...'}
      {status === 'saved' && 'Saved!'}
      {status === 'error' && 'Failed to save'}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test src/components/SaveSearchButton.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd trore
git add src/components/SaveSearchButton.jsx src/components/SaveSearchButton.test.jsx
git commit -m "feat: add SaveSearchButton component"
```

### Task 2: Integrate `SaveSearchButton` into `SearchBar`

**Files:**
- Modify: `trore/src/components/SearchBar.jsx:48-69`
- Modify: `trore/src/components/SearchBar.test.jsx`

- [ ] **Step 1: Write failing test for SearchBar integration**

Add this test to `trore/src/components/SearchBar.test.jsx`:

```jsx
// Add to trore/src/components/SearchBar.test.jsx (inside the describe block)
  it('renders the Save Search button', () => {
    render(
      <MemoryRouter>
        <SearchBar districts={['D1', 'D2']} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /save search/i })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd trore && npm run test src/components/SearchBar.test.jsx`
Expected: FAIL (Button not found)

- [ ] **Step 3: Modify SearchBar to include SaveSearchButton**

Update `trore/src/components/SearchBar.jsx` to import and render `SaveSearchButton`:

```jsx
// trore/src/components/SearchBar.jsx (top of file)
import { useSearchParams } from 'react-router-dom';
import SaveSearchButton from './SaveSearchButton';

// ... existing code ...

// Update the return statement in SearchBar.jsx:
  return (
    <div className="search-bar">
      <div className="main-search">
        {/* ... existing main-search inputs ... */}
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
        
        {/* New Save Search Button placed next to advanced filters */}
        <div style={{ marginLeft: 'auto' }}>
          <SaveSearchButton />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd trore && npm run test src/components/SearchBar.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd trore
git add src/components/SearchBar.jsx src/components/SearchBar.test.jsx
git commit -m "feat: integrate SaveSearchButton into SearchBar"
```
