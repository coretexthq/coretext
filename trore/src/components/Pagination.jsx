// src/components/Pagination.jsx
import { useSearchParams } from 'react-router-dom';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages }) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="pagination">
      <button 
        disabled={currentPage <= 1} 
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button 
        disabled={currentPage >= totalPages} 
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}