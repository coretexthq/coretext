import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';

// Helper component to observe URL params
function LocationDisplay() {
  const [searchParams] = useSearchParams();
  return <div data-testid="location-display">{searchParams.get('q')}</div>;
}

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

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

  it('renders district and price range dropdowns', () => {
    renderWithRouter(<SearchBar districts={['D1', 'D2']} />);
    expect(screen.getByRole('combobox', { name: /district/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /price range/i })).toBeInTheDocument();
  });
});
