import { render, screen, fireEvent } from '@testing-library/react';
import { Filters } from './Filters';
import * as useUrlQueryHook from '../hooks/useUrlQuery';
import { vi } from 'vitest';

vi.mock('../hooks/useUrlQuery');

describe('Filters', () => {
  it('renders dropdowns and updates url query', () => {
    const setDistrictMock = vi.fn();
    const setPriceRangeMock = vi.fn();
    
    useUrlQueryHook.useUrlQuery.mockImplementation((param) => {
      if (param === 'district') return ['Downtown', setDistrictMock];
      if (param === 'priceRange') return ['under-1000', setPriceRangeMock];
      return ['', vi.fn()];
    });

    render(<Filters availableDistricts={['Downtown', 'Uptown']} />);
    
    const districtSelect = screen.getByLabelText(/District/i);
    expect(districtSelect.value).toBe('Downtown');
    fireEvent.change(districtSelect, { target: { value: 'Uptown' } });
    expect(setDistrictMock).toHaveBeenCalledWith('Uptown');

    const priceSelect = screen.getByLabelText(/Price Range/i);
    expect(priceSelect.value).toBe('under-1000');
    fireEvent.change(priceSelect, { target: { value: 'over-2000' } });
    expect(setPriceRangeMock).toHaveBeenCalledWith('over-2000');
  });
});
