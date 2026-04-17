import { useSyncExternalStore, useCallback } from 'react';

function subscribe(callback) {
  window.addEventListener('popstate', callback);
  window.addEventListener('urlchange', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('urlchange', callback);
  };
}

function getSnapshot() {
  return window.location.search;
}

export function useUrlQuery(param) {
  const search = useSyncExternalStore(subscribe, getSnapshot);
  const query = new URLSearchParams(search).get(param) || '';

  const setQuery = useCallback((newValue) => {
    const url = new URL(window.location);
    if (newValue) {
      url.searchParams.set(param, newValue);
    } else {
      url.searchParams.delete(param);
    }
    window.history.pushState({}, '', url.search);
    window.dispatchEvent(new Event('urlchange'));
  }, [param]);

  return [query, setQuery];
}
