import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import './PropertiesPage.css';

export default function PropertiesPage() {
  const { properties, loading, error } = useProperties();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;

  return (
    <div className="properties-page">
      <h1>Rental Properties</h1>
      <SearchBar />
      <PropertyGrid properties={properties} />
    </div>
  );
}