import './Loader.css';

export default function Loader({ count = 8 }) {
  const placeholders = Array.from({ length: count }, (_, index) => index);

  return (
    <div className="loader-grid" aria-busy="true" aria-label="Loading products">
      {placeholders.map((idx) => (
        <div key={idx} className="skeleton-card" aria-hidden="true">
          <div className="skeleton-image skeleton-shimmer" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton-badge skeleton-shimmer" />
            <div className="skeleton-line skeleton-title skeleton-shimmer" />
            <div className="skeleton-line skeleton-title-short skeleton-shimmer" />
            <div className="skeleton-meta-row">
              <div className="skeleton-line skeleton-price skeleton-shimmer" />
              <div className="skeleton-line skeleton-rating skeleton-shimmer" />
            </div>
            <div className="skeleton-line skeleton-button skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
