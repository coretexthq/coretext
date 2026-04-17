import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import { describe, it, expect } from 'vitest';

// Helper component to observe URL params
function LocationDisplay() {
  const [searchParams] = useSearchParams();
  return <div data-testid="location-display">{searchParams.get('q')}</div>;
}

describe('SearchBar', () => {
  it('updates URL query parameters on input change', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
        <LocationDisplay />
      </MemoryRouter>
    );
    
    const input = screen.getByPlaceholderText('Search properties...');
    fireEvent.change(input, { target: { value: 'studio' } });
    
    expect(screen.getByTestId('location-display')).toHaveTextContent('studio');
  });
});
