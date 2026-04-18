import { renderHook, act } from '@testing-library/react';
import { useUrlQuery, updateUrlQueries } from './useUrlQuery';

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

  it('updateUrlQueries updates multiple parameters', () => {
    window.history.replaceState({}, '', '?a=1');
    
    let eventFired = false;
    const listener = () => { eventFired = true; };
    window.addEventListener('urlchange', listener);
    
    updateUrlQueries({ b: '2', a: null });
    
    expect(window.location.search).toBe('?b=2');
    expect(eventFired).toBe(true);
    
    window.removeEventListener('urlchange', listener);
  });
});
