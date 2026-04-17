import { useSearchParams } from 'react-router-dom';

export default function PropertyGrid({ properties }) {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();

  const filteredProperties = properties.filter((prop) =>
    prop.title.toLowerCase().includes(query)
  );

  return (
    <div className="property-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
      {filteredProperties.length > 0 ? (
        filteredProperties.map(property => (
          <div key={property.id} className="property-card" style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
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