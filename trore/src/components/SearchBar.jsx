import { useUrlQuery } from '../hooks/useUrlQuery';

export function SearchBar() {
  const [query, setQuery] = useUrlQuery('q');

  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search properties by title..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
    </div>
  );
}
