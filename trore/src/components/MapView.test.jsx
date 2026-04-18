import { render, screen } from '@testing-library/react';
import { MapView } from './MapView';
import { describe, it, expect } from 'vitest';

describe('MapView', () => {
  it('renders a placeholder with property count', () => {
    const mockProperties = [{ id: 1 }, { id: 2 }];
    render(<MapView properties={mockProperties} />);
    
    expect(screen.getByText(/Map View Placeholder/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing 2 properties on the map/i)).toBeInTheDocument();
  });
  
  it('renders no results message when properties array is empty', () => {
    render(<MapView properties={[]} />);
    expect(screen.getByText(/No properties found for map view/i)).toBeInTheDocument();
  });
});
