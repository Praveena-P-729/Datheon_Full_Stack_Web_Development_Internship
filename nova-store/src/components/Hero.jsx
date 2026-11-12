import { ArrowRight, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { API_CATEGORIES } from "../services/api";
import { formatCurrency } from "../utils/calculations";

export default function Hero({ onShopNow, onSelectCategory, featuredProducts = [], onAddToCart }) {
  const categoryShortcuts = [
    {
      key: API_CATEGORIES.ELECTRONICS,
      title: "Electronics",
      subtitle: "Audio, drives & studio hardware"
    },
    {
      key: API_CATEGORIES.JEWELERY,
      title: "Jewelry",
      subtitle: "Timeless gold, silver & gemstones"
    },
    {
      key: API_CATEGORIES.MENS_CLOTHING,
      title: "Men's Clothing",
      subtitle: "Tailored outerwear & essentials"
    },
    {
      key: API_CATEGORIES.WOMENS_CLOTHING,
      title: "Women's Clothing",
      subtitle: "Lightweight layers & everyday wear"
    }
  ];

  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">NOVA · Everyday Shopping, Made Simple.</span>
            <h1 className="hero-headline">
              Thoughtfully curated essentials for modern living.
            </h1>
            <p className="hero-description">
              Discover durable electronics, fine jewelry, and seasonal wardrobe staples. Transparent pricing, free shipping over $40, and effortless checkout.
            </p>

            <div className="hero-cta-row">
              <button type="button" className="btn btn-primary" onClick={onShopNow}>
                <span>Shop Now</span>
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onSelectCategory(API_CATEGORIES.ELECTRONICS)}
              >
                Explore Tech
              </button>
            </div>

            <div className="hero-trust-strip">
              <div className="trust-item">
                <Truck size={16} />
                <span>Free shipping above $40</span>
              </div>
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>Verified catalog quality</span>
              </div>
              <div className="trust-item">
                <Sparkles size={16} />
                <span>5% flat tax clarity</span>
              </div>
            </div>
          </div>

          {/* Editorial Lifestyle / Product Showcase Composition */}
          <div className="hero-visual" aria-label="Curated NOVA collection highlight">
            <div className="hero-studio-frame">
              <svg
                className="hero-editorial-art"
                viewBox="0 0 420 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Minimal editorial retail still life illustration"
              >
                <rect width="420" height="320" rx="8" fill="#EFEAE1" />
                {/* Architectural Pedestal */}
                <rect x="44" y="212" width="332" height="1" fill="#202923" fillOpacity="0.16" />
                <rect x="76" y="156" width="128" height="128" rx="4" fill="#FFFFFF" stroke="#DCD4C7" />
                <rect x="220" y="96" width="132" height="188" rx="4" fill="#FFFFFF" stroke="#DCD4C7" />
                {/* Stylized Minimal Watch / Wearable */}
                <circle cx="140" cy="220" r="32" fill="#F6F3ED" stroke="#202923" strokeWidth="1.5" />
                <circle cx="140" cy="220" r="22" fill="#FFFFFF" stroke="#C87955" strokeWidth="1.5" />
                <line x1="140" y1="220" x2="140" y2="207" stroke="#202923" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="140" y1="220" x2="150" y2="225" stroke="#C87955" strokeWidth="1.5" strokeLinecap="round" />
                {/* Stylized Tailored Tote / Apparel Silhouette */}
                <path
                  d="M258 148C258 131 271 118 286 118C301 118 314 131 314 148"
                  stroke="#202923"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect x="246" y="148" width="80" height="92" rx="4" fill="#DCD4C7" />
                <rect x="262" y="170" width="48" height="4" rx="2" fill="#202923" fillOpacity="0.25" />
                <circle cx="286" cy="202" r="10" fill="#C87955" />
                {/* Editorial Tag */}
                <rect x="34" y="34" width="142" height="32" rx="4" fill="#202923" />
                <text
                  x="105"
                  y="54"
                  fill="#F6F3ED"
                  fontSize="11"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  letterSpacing="1.2"
                  textAnchor="middle"
                >
                  SEASONAL EDIT
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Category Shortcuts */}
        <div className="category-shortcuts" aria-label="Category shortcuts">
          {categoryShortcuts.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className="shortcut-card"
              onClick={() => onSelectCategory(cat.key)}
            >
              <span className="shortcut-title">{cat.title}</span>
              <span className="shortcut-sub">{cat.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Featured Products Strip (Live from FakeStoreAPI) */}
        {featuredProducts.length > 0 && (
          <div className="featured-strip">
            <div className="featured-header">
              <h2>Featured Picks</h2>
              <button type="button" className="text-link-btn" onClick={onShopNow}>
                View full catalog
              </button>
            </div>
            <div className="featured-grid">
              {featuredProducts.map((item) => (
                <article key={item.id} className="featured-item">
                  <div className="featured-img-wrap">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div className="featured-info">
                    <span className="featured-title">{item.title}</span>
                    <div className="featured-bottom">
                      <span className="featured-price">{formatCurrency(item.price)}</span>
                      <button
                        type="button"
                        className="btn-inline-add"
                        onClick={() => onAddToCart(item)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
