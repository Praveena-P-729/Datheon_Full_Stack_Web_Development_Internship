import { AlertCircle, RefreshCw, PackageSearch } from "lucide-react";
import Loader from "./Loader";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  isLoading,
  error,
  onRetry,
  onResetFilters
}) {
  if (isLoading) {
    return <Loader count={8} />;
  }

  if (error) {
    return (
      <div className="catalog-state-box error-box" role="alert">
        <AlertCircle size={28} strokeWidth={1.75} aria-hidden="true" />
        <h3>Could not load store products</h3>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="catalog-state-box empty-box">
        <PackageSearch size={30} strokeWidth={1.6} aria-hidden="true" />
        <h3>No matching products found</h3>
        <p>Try adjusting your search keywords or clearing your active category filter.</p>
        <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
          Show All Products
        </button>
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
