import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import './PropertiesPage.css';

export default function PropertiesPage() {
  const { properties, loading, error } = useProperties();
  const [searchParams] = useSearchParams();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;

  const query = (searchParams.get('q') || '').toLowerCase();
  const districtFilter = searchParams.get('district');
  const priceRangeFilter = searchParams.get('priceRange');

  const availableDistricts = Array.from(
    new Set(properties.map(p => p.district).filter(Boolean))
  ).sort();

  const filteredProperties = properties.filter(p => {
    // Text search filter
    const matchesQuery = query 
      ? (p.title && p.title.toLowerCase().includes(query)) || 
        (p.description && p.description.toLowerCase().includes(query))
      : true;

    // District filter
    const matchesDistrict = districtFilter ? p.district === districtFilter : true;

    // Price filter
    let matchesPrice = true;
    if (priceRangeFilter && p.price !== undefined) {
      if (priceRangeFilter === '0-1000') matchesPrice = p.price < 1000;
      else if (priceRangeFilter === '1000-2000') matchesPrice = p.price >= 1000 && p.price <= 2000;
      else if (priceRangeFilter === '2000+') matchesPrice = p.price > 2000;
    }

    return matchesQuery && matchesDistrict && matchesPrice;
  });

  return (
    <div className="properties-page">
      <h1>Rental Properties</h1>
      <SearchBar districts={availableDistricts} />
      <PropertyGrid properties={filteredProperties} />
    </div>
  );
}