import { ArrowRight, Gem, Laptop, Shirt, Sparkles } from 'lucide-react';
import {
  formatCurrency,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from '../utils/calculations';
import './Hero.css';

const CATEGORY_SHORTCUTS = [
  {
    id: 'electronics',
    label: 'Electronics',
    description: 'Precision audio, displays & daily tech',
    icon: Laptop,
  },
  {
    id: 'jewelery',
    label: 'Jewelry',
    description: 'Minimalist rings, bracelets & pendants',
    icon: Gem,
  },
  {
    id: "men's clothing",
    label: "Men's Clothing",
    description: 'Structured outerwear & cotton staples',
    icon: Shirt,
  },
  {
    id: "women's clothing",
    label: "Women's Clothing",
    description: 'Tailored layers & everyday silhouettes',
    icon: Sparkles,
  },
];

export default function Hero({
  products = [],
  onShopNow,
  onSelectCategory,
  onQuickAdd,
}) {
  const categoryCounts = products.reduce((acc, product) => {
    const key = product.category;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const spotlightProducts = [...products]
    .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
    .slice(0, 2);

  return (
    <section id="top" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">NOVA • Curated Retail Storefront</span>
            <h1 className="hero-headline">
              Everyday Shopping,
              <br />
              Made Simple.
            </h1>
            <p className="hero-description">
              Discover dependable electronics, finely crafted jewelry, and versatile
              wardrobe essentials. Transparent pricing, instant cart updates, and free
              shipping on every order over ₹{FREE_SHIPPING_THRESHOLD}.
            </p>

            <div className="hero-cta-row">
              <button
                type="button"
                className="btn btn-primary hero-primary-btn"
                onClick={onShopNow}
              >
                Shop Now
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <a href="#featured" className="btn btn-outline">
                View Featured
              </a>
            </div>

            <dl className="hero-metrics">
              <div className="hero-metric">
                <dt>Free Delivery</dt>
                <dd>Orders above ₹{FREE_SHIPPING_THRESHOLD}</dd>
              </div>
              <div className="hero-metric">
                <dt>Flat Rate</dt>
                <dd>
                  ₹{STANDARD_SHIPPING_FEE} under ₹{FREE_SHIPPING_THRESHOLD}
                </dd>
              </div>
              <div className="hero-metric">
                <dt>Curated Catalog</dt>
                <dd>{products.length > 0 ? `${products.length} Live Items` : '4 Departments'}</dd>
              </div>
            </dl>
          </div>

          <div className="hero-visual" aria-label="Curated product showcase">
            <div className="hero-visual-frame">
              <div className="hero-visual-header">
                <span className="hero-visual-tag">Editor&apos;s Pick</span>
                <span className="hero-visual-sub">Live Catalog Highlights</span>
              </div>

              {spotlightProducts.length > 0 ? (
                <div className="hero-spotlight-grid">
                  {spotlightProducts.map((item) => (
                    <article key={item.id} className="hero-spotlight-card">
                      <div className="hero-spotlight-img-wrap">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="hero-spotlight-img"
                          loading="eager"
                        />
                      </div>
                      <div className="hero-spotlight-info">
                        <p className="hero-spotlight-title" title={item.title}>
                          {item.title}
                        </p>
                        <div className="hero-spotlight-footer">
                          <span className="hero-spotlight-price">
                            {formatCurrency(item.price)}
                          </span>
                          <button
                            type="button"
                            className="hero-spotlight-add"
                            onClick={() => onQuickAdd(item)}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="hero-spotlight-placeholder">
                  <div className="hero-placeholder-box" />
                  <div className="hero-placeholder-box" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Shortcuts */}
        <div className="category-shortcuts" aria-label="Shop by department">
          {CATEGORY_SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon;
            const count = categoryCounts[shortcut.id];
            return (
              <button
                key={shortcut.id}
                type="button"
                className="shortcut-card"
                onClick={() => onSelectCategory(shortcut.id)}
              >
                <div className="shortcut-icon-wrap" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-title">{shortcut.label}</span>
                  <span className="shortcut-desc">{shortcut.description}</span>
                </div>
                <span className="shortcut-count">
                  {count !== undefined ? `${count} items` : 'Explore'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
