export function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <p>District: {property.district}</p>
      <p className="price">${property.price}/mo</p>
    </div>
  );
}
