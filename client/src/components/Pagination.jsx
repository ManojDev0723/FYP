import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &larr; Previous
      </button>
      
      <div className="pagination-info">
        Page <span>{currentPage}</span> of <span>{totalPages}</span>
      </div>
      
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default Pagination;
