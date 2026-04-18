import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

test('renders pagination buttons and updates URL', () => {
  window.history.pushState({}, '', '?page=2');
  render(<Pagination totalPages={3} />);
  
  const prevBtn = screen.getByText('Previous');
  const nextBtn = screen.getByText('Next');
  
  expect(prevBtn.disabled).toBe(false);
  expect(nextBtn.disabled).toBe(false);
  
  fireEvent.click(prevBtn);
  expect(new URLSearchParams(window.location.search).get('page')).toBe('1');
});
