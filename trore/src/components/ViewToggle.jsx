import { useUrlQuery } from '../hooks/useUrlQuery';

export function ViewToggle() {
  const [view, setView] = useUrlQuery('view');
  const currentView = view || 'grid';

  return (
    <div className="view-toggle" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
      <button 
        onClick={() => setView('grid')}
        style={{ fontWeight: currentView === 'grid' ? 'bold' : 'normal' }}
      >
        Grid View
      </button>
      <button 
        onClick={() => setView('map')}
        style={{ fontWeight: currentView === 'map' ? 'bold' : 'normal' }}
      >
        Map View
      </button>
    </div>
  );
}
