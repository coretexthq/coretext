import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SaveSearchButton() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle'); // idle, saving, saved, error

  const handleSave = async () => {
    setStatus('saving');

    const q = searchParams.get('q');
    const district = searchParams.get('district');
    const priceRange = searchParams.get('priceRange');
    const amenitiesParam = searchParams.get('amenities');
    const amenities = amenitiesParam ? amenitiesParam.split(',') : [];

    const payload = {
      q,
      district,
      priceRange,
      amenities
    };

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      setStatus('saved');
      
      // Reset back to idle after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button 
      onClick={handleSave} 
      disabled={status === 'saving' || status === 'saved'}
      className="save-search-btn"
    >
      {status === 'idle' && 'Save Search'}
      {status === 'saving' && 'Saving...'}
      {status === 'saved' && 'Saved!'}
      {status === 'error' && 'Failed to save'}
    </button>
  );
}
