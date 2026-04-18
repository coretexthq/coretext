import { SearchBar } from './components/SearchBar';
import { PropertyGrid } from './components/PropertyGrid';
import { Filters } from './components/Filters';
import { AdvancedSearch } from './components/AdvancedSearch';
import { Pagination } from './components/Pagination';
import { SaveSearchButton } from './components/SaveSearchButton';
import { useProperties } from './hooks/useProperties';
import { useUrlQuery } from './hooks/useUrlQuery';
import './App.css';

function App() {
  const [searchQuery] = useUrlQuery('q');
  const [district] = useUrlQuery('district');
  const [priceRange] = useUrlQuery('priceRange');
  const [amenities] = useUrlQuery('amenities');
  const [page] = useUrlQuery('page');
  
  const { properties, totalPages, availableDistricts, loading, error } = useProperties({ 
    searchQuery, 
    district, 
    priceRange,
    amenities,
    page
  });

  return (
    <div className="app-container">
      <header>
        <h1>Rental Properties</h1>
        <div className="search-and-filters">
          <SearchBar />
          <Filters availableDistricts={availableDistricts} />
          <AdvancedSearch />
          <SaveSearchButton />
        </div>
      </header>
      
      <main>
        {error && <div className="error">Error: {error}</div>}
        {loading && !error && <div className="loading">Loading properties...</div>}
        {!loading && !error && (
          <>
            <PropertyGrid properties={properties} />
            <Pagination totalPages={totalPages} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
