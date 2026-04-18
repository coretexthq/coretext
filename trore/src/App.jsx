import { SearchBar } from './components/SearchBar';
import { PropertyGrid } from './components/PropertyGrid';
import { Filters } from './components/Filters';
import { useProperties } from './hooks/useProperties';
import { useUrlQuery } from './hooks/useUrlQuery';
import './App.css';

function App() {
  const [searchQuery] = useUrlQuery('q');
  const [district] = useUrlQuery('district');
  const [priceRange] = useUrlQuery('priceRange');
  
  const { properties, availableDistricts, loading, error } = useProperties({ 
    searchQuery, 
    district, 
    priceRange 
  });

  return (
    <div className="app-container">
      <header>
        <h1>Rental Properties</h1>
        <div className="search-and-filters">
          <SearchBar />
          <Filters availableDistricts={availableDistricts} />
        </div>
      </header>
      
      <main>
        {error && <div className="error">Error: {error}</div>}
        {loading && !error && <div className="loading">Loading properties...</div>}
        {!loading && !error && <PropertyGrid properties={properties} />}
      </main>
    </div>
  );
}

export default App;
