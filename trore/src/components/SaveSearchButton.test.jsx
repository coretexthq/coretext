import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import SaveSearchButton from './SaveSearchButton';
import { vi } from 'vitest';

// Mock component to set initial search params
const SetupComponent = () => {
  const [, setSearchParams] = useSearchParams();
  return (
    <button onClick={() => setSearchParams({ q: 'test', district: 'D1', amenities: 'ac,parking' })}>
      Set Params
    </button>
  );
};

describe('SaveSearchButton', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST request with correct payload from URL params', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SetupComponent />
        <SaveSearchButton />
      </MemoryRouter>
    );

    // Set URL params first
    fireEvent.click(screen.getByText('Set Params'));

    const saveBtn = screen.getByRole('button', { name: /save search/i });
    fireEvent.click(saveBtn);

    expect(saveBtn).toBeDisabled();
    expect(saveBtn).toHaveTextContent(/saving/i);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'test',
          district: 'D1',
          priceRange: null,
          amenities: ['ac', 'parking']
        }),
      });
    });

    expect(screen.getByRole('button', { name: /saved!/i })).toBeInTheDocument();
  });
});
