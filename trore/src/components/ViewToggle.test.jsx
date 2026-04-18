import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from './ViewToggle';
import { useUrlQuery } from '../hooks/useUrlQuery';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../hooks/useUrlQuery');

describe('ViewToggle', () => {
  let mockSetView;

  beforeEach(() => {
    mockSetView = vi.fn();
    useUrlQuery.mockReturnValue(['grid', mockSetView]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Grid and Map buttons', () => {
    render(<ViewToggle />);
    expect(screen.getByText('Grid View')).toBeInTheDocument();
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });

  it('calls setView when Map button is clicked', () => {
    render(<ViewToggle />);
    fireEvent.click(screen.getByText('Map View'));
    expect(mockSetView).toHaveBeenCalledWith('map');
  });

  it('calls setView when Grid button is clicked', () => {
    useUrlQuery.mockReturnValue(['map', mockSetView]);
    render(<ViewToggle />);
    fireEvent.click(screen.getByText('Grid View'));
    expect(mockSetView).toHaveBeenCalledWith('grid');
  });
});
