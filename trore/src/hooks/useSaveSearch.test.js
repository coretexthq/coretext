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
