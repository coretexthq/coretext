export function MapView({ properties }) {
  if (!properties || properties.length === 0) {
    return <div className="no-results">No properties found for map view.</div>;
  }

  return (
    <div className="map-view-placeholder" style={{ 
        border: '2px dashed #ccc', 
        padding: '2rem', 
        textAlign: 'center', 
        minHeight: '300px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
      <h2>Map View Placeholder</h2>
      <p>Showing {properties.length} properties on the map.</p>
    </div>
  );
}
