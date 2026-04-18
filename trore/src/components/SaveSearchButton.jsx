import { useSaveSearch } from '../hooks/useSaveSearch';

export function SaveSearchButton() {
  const { saveSearch, loading, success } = useSaveSearch();

  const handleSave = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const filters = Object.fromEntries(searchParams.entries());
    
    // Only save if there are active filters
    if (Object.keys(filters).length > 0) {
      saveSearch(filters);
    }
  };

  return (
    <div className="save-search-container">
      <button 
        onClick={handleSave} 
        disabled={loading || success}
        className="save-search-btn"
      >
        {loading ? 'Saving...' : success ? 'Saved!' : 'Save Search'}
      </button>
    </div>
  );
}
