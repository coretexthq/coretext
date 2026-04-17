import { SearchBar } from './components/SearchBar';
import { PropertyGrid } from './components/PropertyGrid';
import { useProperties } from './hooks/useProperties';
import { useUrlQuery } from './hooks/useUrlQuery';
import './App.css';

function App() {
  const [query] = useUrlQuery('q');
  const { properties, loading, error } = useProperties(query);

  return (
    <div className="app-container">
      <header>
        <h1>Rental Properties</h1>
        <SearchBar />
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
