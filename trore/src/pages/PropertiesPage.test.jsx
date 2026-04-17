// src/pages/PropertiesPage.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PropertiesPage from './PropertiesPage';
import { useProperties } from '../hooks/useProperties';

vi.mock('../hooks/useProperties', () => ({
  useProperties: vi.fn()
}));

const mockProperties = [
  { id: 1, title: 'Prop 1', price: 500, amenities: ['AC'] },
  { id: 2, title: 'Prop 2', price: 600, amenities: ['Balcony'] },
  { id: 3, title: 'Prop 3', price: 700, amenities: ['Parking'] },
  { id: 4, title: 'Prop 4', price: 800, amenities: ['AC', 'Parking'] },
  { id: 5, title: 'Prop 5', price: 900, amenities: ['Balcony'] }
];

describe('PropertiesPage Integration', () => {
  it('renders paginated properties', () => {
    useProperties.mockReturnValue({
      properties: mockProperties,
      loading: false,
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <PropertiesPage />
      </MemoryRouter>
    );

    expect(screen.queryByText('Prop 5')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });
});