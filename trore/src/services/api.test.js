import { fetchProperties } from './api';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('api service', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches properties with the correct auth header', async () => {
    const mockData = [{ id: 1, title: 'Test Property' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchProperties();

    expect(global.fetch).toHaveBeenCalledWith('/api/properties', {
      headers: {
        'X-Trore-Auth': 'v1-alpha'
      }
    });
    expect(result).toEqual(mockData);
  });

  it('throws an error on network failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    await expect(fetchProperties()).rejects.toThrow('Network response was not ok');
  });
});
