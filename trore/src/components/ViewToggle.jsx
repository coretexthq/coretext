import { useSearchParams } from 'react-router-dom';
import './ViewToggle.css';

export default function ViewToggle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'grid';

  const handleToggle = (viewName) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (viewName === 'grid') {
        newParams.delete('view');
      } else {
        newParams.set('view', viewName);
      }
      return newParams;
    });
  };

  return (
    <div className="view-toggle">
      <button 
        className={currentView === 'grid' ? 'active' : ''} 
        onClick={() => handleToggle('grid')}
      >
        Grid View
      </button>
      <button 
        className={currentView === 'map' ? 'active' : ''} 
        onClick={() => handleToggle('map')}
      >
        Map View
      </button>
    </div>
  );
}
