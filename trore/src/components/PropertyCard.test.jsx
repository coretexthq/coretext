import { render, screen } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  it('renders property details correctly', () => {
    const property = { title: 'Test Home', district: 'D1', price: 1500 };
    render(<PropertyCard property={property} />);
    
    expect(screen.getByText('Test Home')).toBeDefined();
    expect(screen.getByText('District: D1')).toBeDefined();
    expect(screen.getByText('$1500/mo')).toBeDefined();
  });
});
