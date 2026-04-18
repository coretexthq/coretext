import { render, screen, fireEvent } from '@testing-library/react';
import { SaveSearchButton } from './SaveSearchButton';
import { useSaveSearch } from '../hooks/useSaveSearch';

vi.mock('../hooks/useSaveSearch');

describe('SaveSearchButton', () => {
  it('calls saveSearch with current URL parameters when clicked', () => {
    const mockSaveSearch = vi.fn();
    useSaveSearch.mockReturnValue({
      saveSearch: mockSaveSearch,
      loading: false,
      success: false
    });

    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: { search: '?q=studio&district=D1' },
      writable: true
    });

    render(<SaveSearchButton />);
    
    const button = screen.getByRole('button', { name: /save search/i });
    fireEvent.click(button);

    expect(mockSaveSearch).toHaveBeenCalledWith({ q: 'studio', district: 'D1' });
  });

  it('shows saving state', () => {
    useSaveSearch.mockReturnValue({
      saveSearch: vi.fn(),
      loading: true,
      success: false
    });

    render(<SaveSearchButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Saving...');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
