import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProperties } from './propertyService';

describe('propertyService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('fetches properties with auth header', async () => {
    const mockData = [{ id: 1, title: 'Test Property' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const data = await fetchProperties();
    expect(global.fetch).toHaveBeenCalledWith('/api/properties', {
      headers: { 'X-Trore-Auth': 'v1-alpha' }
    });
    expect(data).toEqual(mockData);
  });

  it('throws an error if response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchProperties()).rejects.toThrow('Failed to fetch');
  });
});
