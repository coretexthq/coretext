import './PropertyGrid.css';

export default function PropertyGrid({ properties }) {
  return (
    <div className="property-grid">
      {properties.length > 0 ? (
        properties.map(property => (
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