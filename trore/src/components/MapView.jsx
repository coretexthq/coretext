import './MapView.css';

export default function MapView({ properties }) {
  return (
    <div className="map-view-placeholder">
      <h2>Map View Placeholder</h2>
      <p>Displaying {properties.length} properties on the map.</p>
    </div>
  );
}
