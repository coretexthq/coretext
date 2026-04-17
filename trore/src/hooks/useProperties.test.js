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
