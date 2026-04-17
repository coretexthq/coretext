import { useState, useEffect } from 'react';

export function useProperties(searchQuery) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties', {
          headers: {
            'X-Trore-Auth': 'v1-alpha'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredData = data.filter(property => 
    property.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { properties: filteredData, loading, error };
}
