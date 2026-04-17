// src/pages/PropertiesPage.jsx
import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import Pagination from '../components/Pagination';
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
  const amenitiesParam = searchParams.get('amenities') || '';
  const activeAmenities = amenitiesParam ? amenitiesParam.split(',') : [];
  
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const ITEMS_PER_PAGE = 4;

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

    // Amenities filter
    const matchesAmenities = activeAmenities.every(amenity => {
      if (amenity === 'ac') return p.hasAC || (p.amenities && p.amenities.includes('AC'));
      if (amenity === 'balcony') return p.hasBalcony || (p.amenities && p.amenities.includes('Balcony'));
      if (amenity === 'parking') return p.hasParking || (p.amenities && p.amenities.includes('Parking'));
      return true;
    });

    return matchesQuery && matchesDistrict && matchesPrice && matchesAmenities;
  });

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  
  // Ensure current page is valid after filtering
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  return (
    <div className="properties-page">
      <h1>Rental Properties</h1>
      <SearchBar districts={availableDistricts} />
      <PropertyGrid properties={paginatedProperties} />
      <Pagination currentPage={validCurrentPage} totalPages={totalPages} />
    </div>
  );
}