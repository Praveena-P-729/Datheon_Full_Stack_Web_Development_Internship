import { Search, X } from "lucide-react";

export default function SearchBar({ searchQuery, onSearchChange, inputRef, resultCount, totalCount }) {
  return (
    <div className="search-toolbar">
      <div className="search-input-box">
        <Search size={17} className="search-toolbar-icon" aria-hidden="true" />
        <label htmlFor="productSearchInput" className="sr-only">
          Search products by title
        </label>
        <input
          ref={inputRef}
          id="productSearchInput"
          type="text"
          className="search-toolbar-input"
          placeholder="Search products by title..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange("")}
            aria-label="Clear search query"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <span className="catalog-count" aria-live="polite">
        Showing {resultCount} of {totalCount} items
      </span>
    </div>
  );
}
