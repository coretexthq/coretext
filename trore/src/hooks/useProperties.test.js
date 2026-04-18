import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useProperties } from './useProperties';

describe('useProperties', () => {
  beforeEach(() => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches properties and filters by search query', async () => {
    const { result } = renderHook(() => useProperties({ searchQuery: 'Studio' }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/properties', expect.objectContaining({
      headers: { 'X-Trore-Auth': 'v1-alpha' }
    }));
    expect(result.current.properties).toEqual([{ id: 1, title: 'Studio', district: 'Downtown', price: 900 }]);
    expect(result.current.error).toBe(null);
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
    expect(result.current.availableDistricts).toEqual(['Downtown', 'Suburbs', 'Uptown']);
  });
});
