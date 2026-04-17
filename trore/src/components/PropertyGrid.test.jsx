import { render, screen } from '@testing-library/react';
import { PropertyGrid } from './PropertyGrid';

// Mock PropertyCard to simplify test
vi.mock('./PropertyCard', () => ({
  PropertyCard: ({ property }) => <div data-testid="property-card">{property.title}</div>
}));

describe('PropertyGrid', () => {
  it('renders empty state when no properties', () => {
    render(<PropertyGrid properties={[]} />);
    expect(screen.getByText('No properties found.')).toBeDefined();
  });

  it('renders a list of property cards', () => {
    const properties = [
      { id: 1, title: 'Prop 1' },
      { id: 2, title: 'Prop 2' }
    ];
    render(<PropertyGrid properties={properties} />);
    
    const cards = screen.getAllByTestId('property-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Prop 1')).toBeDefined();
  });
});
