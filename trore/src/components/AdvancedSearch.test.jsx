import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedSearch } from './AdvancedSearch';

test('renders amenities checkboxes and updates URL', () => {
  window.history.pushState({}, '', '?amenities=AC');
  render(<AdvancedSearch />);
  
  const acCheckbox = screen.getByLabelText('AC');
  const balconyCheckbox = screen.getByLabelText('Balcony');
  
  expect(acCheckbox.checked).toBe(true);
  expect(balconyCheckbox.checked).toBe(false);
  
  fireEvent.click(balconyCheckbox);
  
  // Checking the URL update
  const params = new URLSearchParams(window.location.search);
  const amenities = params.get('amenities');
  expect(amenities).toContain('AC');
  expect(amenities).toContain('Balcony');
  // It should also reset page to 1
  expect(params.get('page')).toBe('1');
});
