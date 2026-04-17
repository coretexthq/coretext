import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import ViewToggle from './ViewToggle';

// Helper component to read URL params
function SearchParamsReader() {
  const [searchParams] = useSearchParams();
  return <div data-testid="view-param">{searchParams.get('view') || 'grid'}</div>;
}

describe('ViewToggle component', () => {
  it('toggles URL view parameter to map and back', () => {
    render(
      <MemoryRouter initialEntries={['/properties']}>
        <ViewToggle />
        <SearchParamsReader />
      </MemoryRouter>
    );

    const mapButton = screen.getByRole('button', { name: /map view/i });
    const gridButton = screen.getByRole('button', { name: /grid view/i });
    
    // Initially grid view by default
    expect(screen.getByTestId('view-param').textContent).toBe('grid');

    // Click map button
    fireEvent.click(mapButton);
    expect(screen.getByTestId('view-param').textContent).toBe('map');

    // Click grid button
    fireEvent.click(gridButton);
    expect(screen.getByTestId('view-param').textContent).toBe('grid');
  });
});
