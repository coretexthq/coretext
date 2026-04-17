import { PropertyCard } from './PropertyCard';

export function PropertyGrid({ properties }) {
  if (properties.length === 0) {
    return <div className="no-results">No properties found.</div>;
  }

  return (
    <div className="property-grid">
      {properties.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  );
}
