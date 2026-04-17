export default function ErrorBanner({ error }) {
  return (
    <div className="error-banner" style={{ padding: '1rem', margin: '1rem 0', backgroundColor: '#fee', color: '#c00', border: '1px solid #fcc', borderRadius: '4px' }}>
      <strong>Error:</strong> {error}
    </div>
  );
}