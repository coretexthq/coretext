// src/components/Pagination.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pagination from './Pagination';

test('renders pagination controls correctly', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Pagination currentPage={2} totalPages={3} />
    </MemoryRouter>
  );
  
  expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
  expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
});