import { useState, useEffect, useMemo } from 'react';

export function useProperties({ searchQuery = '', district = '', priceRange = '' } = {}) {
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

  const availableDistricts = useMemo(() => {
    const districts = new Set(data.map(p => p.district).filter(Boolean));
    return Array.from(districts).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(property => {
      const matchSearch = property.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDistrict = district ? property.district === district : true;
      
      let matchPrice = true;
      if (priceRange === 'under-1000') matchPrice = property.price < 1000;
      else if (priceRange === '1000-2000') matchPrice = property.price >= 1000 && property.price <= 2000;
      else if (priceRange === 'over-2000') matchPrice = property.price > 2000;

      return matchSearch && matchDistrict && matchPrice;
    });
  }, [data, searchQuery, district, priceRange]);

  return { properties: filteredData, availableDistricts, loading, error };
}
