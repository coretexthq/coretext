import { useSearchParams } from 'react-router-dom';

export default function SearchBar({ districts = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const district = searchParams.get('district') || '';
  const priceRange = searchParams.get('priceRange') || '';

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="search-bar">
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
  );
}
