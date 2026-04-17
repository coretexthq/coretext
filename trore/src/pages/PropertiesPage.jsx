import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';

export default function PropertiesPage() {
  const { properties, loading, error } = useProperties();

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="properties-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Rental Properties</h1>
      <SearchBar />
      <PropertyGrid properties={properties} />
    </div>
  );
}