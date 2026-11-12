import { ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../services/api';
import './CategoryFilter.css';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Sort: Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: Highest Rated' },
];

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="filter-bar">
      <div className="category-pills" role="group" aria-label="Filter by product category">
        {CATEGORIES.map((category) => {
          const isSelected = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={`category-pill ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onCategoryChange(category.id)}
              aria-pressed={isSelected}
            >
              {category.label}
            </button>
          );
        })}

        {activeCategory === 'clothing' && (
          <button
            type="button"
            className="category-pill is-selected"
            onClick={() => onCategoryChange('clothing')}
            aria-pressed="true"
          >
            All Clothing
          </button>
        )}
      </div>

      <div className="sort-control">
        <ArrowUpDown size={15} className="sort-icon" aria-hidden="true" />
        <label htmlFor="product-sort-select" className="sr-only">
          Sort products
        </label>
        <select
          id="product-sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
