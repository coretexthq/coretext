import { render, screen } from '@testing-library/react';
import PropertyGrid from './PropertyGrid';

const mockProperties = [
  { id: 1, title: 'Downtown Studio', price: 1200, location: 'City Center' },
  { id: 2, title: 'Suburban 2BR', price: 1800, location: 'North Hills' }
];

describe('PropertyGrid', () => {
  it('renders all properties passed to it', () => {
    render(<PropertyGrid properties={mockProperties} />);
    
    expect(screen.getByText('Downtown Studio')).toBeInTheDocument();
    expect(screen.getByText('Suburban 2BR')).toBeInTheDocument();
  });
});
