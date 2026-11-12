import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="searchbar-wrap">
      <label htmlFor="catalog-search-input" className="sr-only">
        Search products by title
      </label>
      <Search size={18} className="searchbar-icon" aria-hidden="true" />
      <input
        id="catalog-search-input"
        type="text"
        className="searchbar-input"
        placeholder="Search by product title (e.g., jacket, SSD, ring)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          className="searchbar-clear"
          onClick={onClear}
          aria-label="Clear search query"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
