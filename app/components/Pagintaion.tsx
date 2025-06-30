const renderPagination = () => {
    if (!actionData?.totalPages || actionData.totalPages <= 1) return null;

    const { currentPage = 1, totalPages = 1 } = actionData;
    const pages = [];
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm rounded ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    );
  };