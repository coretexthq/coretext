// src/components/SearchBar.jsx
import { useSearchParams } from 'react-router-dom';

export default function SearchBar({ districts = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const district = searchParams.get('district') || '';
  const priceRange = searchParams.get('priceRange') || '';
  
  const amenitiesParam = searchParams.get('amenities') || '';
  const activeAmenities = amenitiesParam ? amenitiesParam.split(',') : [];

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset page to 1 whenever filters change to avoid empty pages
    newParams.set('page', '1');
    setSearchParams(newParams, { replace: true });
  };

  const toggleAmenity = (amenity) => {
    let newAmenities = [...activeAmenities];
    if (newAmenities.includes(amenity)) {
      newAmenities = newAmenities.filter(a => a !== amenity);
    } else {
      newAmenities.push(amenity);
    }
    updateParams({ amenities: newAmenities.join(',') });
  };

  return (
    <div className="search-bar">
      <div className="main-search">
        <input
          type="text"
          placeholder="Search properties..."
          value={query}
          onChange={(e) => updateParams({ q: e.target.value })}
          aria-label="Search"
        />
        <select 
          value={district} 
          onChange={(e) => updateParams({ district: e.target.value })}
          aria-label="District"
        >
          <option value="">All Districts</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select 
          value={priceRange} 
          onChange={(e) => updateParams({ priceRange: e.target.value })}
          aria-label="Price Range"
        >
          <option value="">All Prices</option>
          <option value="0-1000">Under $1000</option>
          <option value="1000-2000">$1000 - $2000</option>
          <option value="2000+">Over $2000</option>
        </select>
      </div>
      <div className="advanced-search" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <strong>Advanced Search:</strong>
        <label>
          <input 
            type="checkbox" 
            checked={activeAmenities.includes('ac')} 
            onChange={() => toggleAmenity('ac')} 
          /> AC
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeAmenities.includes('balcony')} 
            onChange={() => toggleAmenity('balcony')} 
          /> Balcony
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeAmenities.includes('parking')} 
            onChange={() => toggleAmenity('parking')} 
          /> Parking
        </label>
      </div>
    </div>
  );
}