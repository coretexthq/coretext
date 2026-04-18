import { useState, useEffect, useMemo } from 'react';

export function useProperties({ searchQuery = '', district = '', priceRange = '', amenities = '', page = '1' } = {}) {
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

      const selectedAmenities = amenities ? amenities.split(',') : [];
      const propertyAmenities = property.amenities || [];
      const matchAmenities = selectedAmenities.every(a => propertyAmenities.includes(a));

      return matchSearch && matchDistrict && matchPrice && matchAmenities;
    });
  }, [data, searchQuery, district, priceRange, amenities]);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, startIndex, itemsPerPage]);

  return { properties: paginatedData, totalPages, availableDistricts, loading, error };
}
