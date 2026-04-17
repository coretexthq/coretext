import { useSearchParams } from 'react-router-dom';
import './PropertyGrid.css';

export default function PropertyGrid({ properties }) {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();

  const filteredProperties = properties.filter((prop) =>
    prop.title.toLowerCase().includes(query)
  );

  return (
    <div className="property-grid">
      {filteredProperties.length > 0 ? (
        filteredProperties.map(property => (
          <div key={property.id} className="property-card">
            <h3>{property.title}</h3>
            <p><strong>Price:</strong> ${property.price}/mo</p>
            <p><strong>Location:</strong> {property.location}</p>
          </div>
        ))
      ) : (
        <p>No properties found.</p>
      )}
    </div>
  );
}