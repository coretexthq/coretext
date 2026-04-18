import { useState } from 'react';

export function useSaveSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const saveSearch = async (filters) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trore-Auth': 'v1-alpha'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { saveSearch, loading, error, success };
}
