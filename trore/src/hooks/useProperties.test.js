import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useProperties } from './useProperties';

describe('useProperties', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches properties and filters by search query', async () => {
    const mockData = [
      { id: 1, title: 'Sunny Studio' },
      { id: 2, title: 'Modern 1BR' }
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useProperties('sunny'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/properties', expect.objectContaining({
      headers: { 'X-Trore-Auth': 'v1-alpha' }
    }));
    expect(result.current.properties).toEqual([{ id: 1, title: 'Sunny Studio' }]);
    expect(result.current.error).toBe(null);
  });
});
