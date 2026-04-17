import { useSearchParams } from 'react-router-dom';

export default function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search properties..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}