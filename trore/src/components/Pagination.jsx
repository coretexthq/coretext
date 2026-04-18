import { useUrlQuery } from '../hooks/useUrlQuery';

export function Pagination({ totalPages }) {
  const [pageQuery, setPageQuery] = useUrlQuery('page');
  const currentPage = Math.max(1, parseInt(pageQuery, 10) || 1);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button 
        disabled={currentPage <= 1} 
        onClick={() => setPageQuery(String(currentPage - 1))}
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button 
        disabled={currentPage >= totalPages} 
        onClick={() => setPageQuery(String(currentPage + 1))}
      >
        Next
      </button>
    </div>
  );
}
