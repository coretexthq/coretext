import { useUrlQuery } from '../hooks/useUrlQuery';

export function Filters({ availableDistricts = [] }) {
  const [district, setDistrict] = useUrlQuery('district');
  const [priceRange, setPriceRange] = useUrlQuery('priceRange');

  return (
    <div className="filters">
      <label>
        District:
        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {availableDistricts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>

      <label>
        Price Range:
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">All Prices</option>
          <option value="under-1000">Under $1000</option>
          <option value="1000-2000">$1000 - $2000</option>
          <option value="over-2000">Over $2000</option>
        </select>
      </label>
    </div>
  );
}
