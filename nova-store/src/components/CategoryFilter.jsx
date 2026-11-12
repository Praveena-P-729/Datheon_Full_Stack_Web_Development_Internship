import { API_CATEGORIES, formatCategoryLabel } from "../services/api";

const FILTER_OPTIONS = [
  API_CATEGORIES.ALL,
  API_CATEGORIES.ELECTRONICS,
  API_CATEGORIES.JEWELERY,
  API_CATEGORIES.MENS_CLOTHING,
  API_CATEGORIES.WOMENS_CLOTHING
];

export default function CategoryFilter({ activeCategory, onSelectCategory, sortBy, onSortChange }) {
  return (
    <div className="catalog-controls">
      <div className="category-pills" role="tablist" aria-label="Filter products by category">
        {FILTER_OPTIONS.map((categoryKey) => {
          const isSelected = activeCategory === categoryKey;
          return (
            <button
              key={categoryKey}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`category-pill ${isSelected ? "active" : ""}`}
              onClick={() => onSelectCategory(categoryKey)}
            >
              {formatCategoryLabel(categoryKey)}
            </button>
          );
        })}
      </div>

      <div className="sort-control">
        <label htmlFor="sortSelect" className="sort-label">
          Sort by
        </label>
        <select
          id="sortSelect"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}
