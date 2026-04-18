import { useUrlQuery, updateUrlQueries } from '../hooks/useUrlQuery';

const AMENITIES = ['AC', 'Balcony', 'Parking'];

export function AdvancedSearch() {
  const [amenitiesQuery] = useUrlQuery('amenities');
  const selectedAmenities = amenitiesQuery ? amenitiesQuery.split(',') : [];

  const handleToggle = (amenity) => {
    let newAmenities;
    if (selectedAmenities.includes(amenity)) {
      newAmenities = selectedAmenities.filter(a => a !== amenity);
    } else {
      newAmenities = [...selectedAmenities, amenity];
    }
    
    updateUrlQueries({
      amenities: newAmenities.length > 0 ? newAmenities.join(',') : null,
      page: '1' // Reset to page 1 on filter change
    });
  };

  return (
    <div className="advanced-search">
      <fieldset>
        <legend>Amenities</legend>
        {AMENITIES.map(amenity => (
          <label key={amenity}>
            <input
              type="checkbox"
              checked={selectedAmenities.includes(amenity)}
              onChange={() => handleToggle(amenity)}
            />
            {amenity}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
