import { API_CATEGORIES } from "../services/api";

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div className="brand-logo footer-brand">
            <span className="brand-mark" aria-hidden="true">
              N
            </span>
            <span className="brand-wordmark">NOVA</span>
          </div>
          <p className="footer-tagline">Everyday Shopping, Made Simple.</p>
          <p className="footer-copy">
            An independent editorial storefront built with React, Context API, and FakeStoreAPI.
          </p>
        </div>

        <div className="footer-links-col">
          <h3>Shop Categories</h3>
          <ul>
            <li>
              <button type="button" onClick={() => onSelectCategory(API_CATEGORIES.ALL)}>
                All Products
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory(API_CATEGORIES.ELECTRONICS)}>
                Electronics
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory(API_CATEGORIES.JEWELERY)}>
                Jewelry
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory(API_CATEGORIES.MENS_CLOTHING)}>
                Men&apos;s Clothing
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory(API_CATEGORIES.WOMENS_CLOTHING)}>
                Women&apos;s Clothing
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-info-col">
          <h3>Store Policy</h3>
          <ul>
            <li>Free shipping on orders above $40.00</li>
            <li>$2.00 flat shipping under $40.00</li>
            <li>5% standard tax calculation</li>
            <li>Cart automatically persisted locally</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} NOVA Store. All rights reserved.</span>
        <span>
          Product data powered by{" "}
          <a href="https://fakestoreapi.com/" target="_blank" rel="noopener noreferrer">
            FakeStoreAPI
          </a>
        </span>
      </div>
    </footer>
  );
}
