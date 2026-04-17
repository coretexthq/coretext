import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SearchBar } from './SearchBar';
import * as useUrlQueryModule from '../hooks/useUrlQuery';

vi.mock('../hooks/useUrlQuery', () => ({
  useUrlQuery: vi.fn()
}));

describe('SearchBar', () => {
  it('renders input with value from hook and calls setter on change', () => {
    const setQueryMock = vi.fn();
    useUrlQueryModule.useUrlQuery.mockReturnValue(['studio', setQueryMock]);

    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search properties by title...');
    expect(input.value).toBe('studio');

    fireEvent.change(input, { target: { value: 'loft' } });
    expect(setQueryMock).toHaveBeenCalledWith('loft');
  });
});
