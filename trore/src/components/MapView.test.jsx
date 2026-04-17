import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapView from './MapView';

describe('MapView component', () => {
  it('renders a placeholder with the number of properties', () => {
    const mockProperties = [
      { id: '1', title: 'Property 1' },
      { id: '2', title: 'Property 2' }
    ];
    render(<MapView properties={mockProperties} />);
    
    expect(screen.getByText(/Map View Placeholder/i)).toBeInTheDocument();
    expect(screen.getByText(/Displaying 2 properties on the map/i)).toBeInTheDocument();
  });
});
