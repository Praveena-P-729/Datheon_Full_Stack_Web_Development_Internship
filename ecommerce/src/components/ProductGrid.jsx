import { AlertCircle, PackageSearch, RefreshCw } from 'lucide-react';
import Loader from './Loader';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({
  products,
  loading,
  error,
  onRetry,
  onResetFilters,
  hasActiveFilters,
}) {
  if (loading) {
    return <Loader count={8} />;
  }

  if (error) {
    return (
      <div className="catalog-state-box is-error" role="alert">
        <div className="catalog-state-icon">
          <AlertCircle size={32} aria-hidden="true" />
        </div>
        <h3 className="catalog-state-title">Could not load the product catalog</h3>
        <p className="catalog-state-text">{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          Retry Loading Products
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="catalog-state-box" role="status">
        <div className="catalog-state-icon">
          <PackageSearch size={32} aria-hidden="true" />
        </div>
        <h3 className="catalog-state-title">No matching products found</h3>
        <p className="catalog-state-text">
          {hasActiveFilters
            ? 'Try adjusting your search keywords or switching to a different category.'
            : 'There are currently no items available in the catalog.'}
        </p>
        {hasActiveFilters && (
          <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
            Reset Search &amp; Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
