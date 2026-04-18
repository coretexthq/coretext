import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useProperties } from './useProperties';

describe('useProperties', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Studio', district: 'Downtown', price: 900, amenities: ['AC'] },
          { id: 2, title: 'Loft', district: 'Uptown', price: 1500, amenities: ['AC', 'Balcony'] },
          { id: 3, title: 'Villa', district: 'Suburbs', price: 2500, amenities: ['Parking'] },
          { id: 4, title: 'Condo', district: 'Downtown', price: 1800, amenities: ['AC', 'Parking', 'Balcony'] },
          { id: 5, title: 'House', district: 'Suburbs', price: 2100, amenities: ['Balcony'] },
          { id: 6, title: 'Apartment', district: 'Uptown', price: 1200, amenities: [] }
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
    expect(result.current.properties).toEqual([{ id: 1, title: 'Studio', district: 'Downtown', price: 900, amenities: ['AC'] }]);
    expect(result.current.error).toBe(null);
  });

  it('filters by district', async () => {
    const { result } = renderHook(() => useProperties({ searchQuery: '', district: 'Uptown', priceRange: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toHaveLength(2); // Loft and Apartment
    expect(result.current.properties[0].district).toBe('Uptown');
    expect(result.current.properties[1].district).toBe('Uptown');
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

  it('filters properties by amenities (ALL match)', async () => {
    const { result } = renderHook(() => useProperties({ amenities: 'AC,Balcony' }));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    // Loft and Condo have both AC and Balcony
    expect(result.current.properties).toHaveLength(2);
    expect(result.current.properties.every(p => p.amenities.includes('AC') && p.amenities.includes('Balcony'))).toBe(true);
  });

  it('paginates properties to 4 per page and returns totalPages', async () => {
    const { result } = renderHook(() => useProperties({ page: '2' }));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.properties.length).toBe(2); // items 5-6
    expect(result.current.totalPages).toBe(Math.ceil(6 / 4));
  });
});
