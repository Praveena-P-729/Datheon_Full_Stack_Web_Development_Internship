export default function Loader({ count = 8 }) {
  const placeholders = Array.from({ length: count });

  return (
    <div className="product-grid" role="status" aria-label="Loading products">
      {placeholders.map((_, idx) => (
        <div key={idx} className="product-card skeleton-card" aria-hidden="true">
          <div className="skeleton-box skeleton-img" />
          <div className="product-body">
            <div className="skeleton-box skeleton-tag" />
            <div className="skeleton-box skeleton-title" />
            <div className="skeleton-box skeleton-title short" />
            <div className="skeleton-box skeleton-meta" />
            <div className="skeleton-footer">
              <div className="skeleton-box skeleton-price" />
              <div className="skeleton-box skeleton-btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
