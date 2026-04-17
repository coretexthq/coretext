import { renderHook, act } from '@testing-library/react';
import { useUrlQuery } from './useUrlQuery';

describe('useUrlQuery', () => {
  it('reads and updates URL query param', () => {
    // Reset location properly for jsdom
    window.history.replaceState({}, '', '/');
    
    const { result } = renderHook(() => useUrlQuery('q'));
    expect(result.current[0]).toBe('');

    act(() => {
      result.current[1]('studio');
    });

    expect(window.location.search).toBe('?q=studio');
    expect(result.current[0]).toBe('studio');
  });
});
