import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyGrid from './PropertyGrid';

const mockProperties = [
  { id: 1, title: 'Downtown Studio', price: 1200, location: 'City Center' },
  { id: 2, title: 'Suburban 2BR', price: 1800, location: 'North Hills' }
];

describe('PropertyGrid', () => {
  it('renders correctly filtered properties based on URL query', () => {
    render(
      <MemoryRouter initialEntries={['/?q=studio']}>
        <PropertyGrid properties={mockProperties} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Downtown Studio')).toBeInTheDocument();
    expect(screen.queryByText('Suburban 2BR')).not.toBeInTheDocument();
  });
});