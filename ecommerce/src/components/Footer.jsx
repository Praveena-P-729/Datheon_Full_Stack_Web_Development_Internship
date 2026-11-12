import { ArrowUp } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../utils/calculations';
import './Footer.css';

export default function Footer({ onSelectCategory, onOpenCart }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <span className="footer-brand-mark" aria-hidden="true">
              N
            </span>
            <span className="footer-brand-wordmark">NOVA</span>
          </div>
          <p className="footer-tagline">Everyday Shopping, Made Simple.</p>
          <p className="footer-desc">
            A curated online retail storefront built with transparent pricing, instant
            cart persistence, and thoughtful design across desktop, tablet, and mobile.
          </p>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Departments</h3>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={() => onSelectCategory('all')}>
                All Products
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory('electronics')}>
                Electronics
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory('jewelery')}>
                Jewelry
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory("men's clothing")}>
                Men&apos;s Clothing
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onSelectCategory("women's clothing")}>
                Women&apos;s Clothing
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Customer Care</h3>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={onOpenCart}>
                View Shopping Bag
              </button>
            </li>
            <li>
              <a href="#featured">Featured Collection</a>
            </li>
            <li>
              <a href="#catalog">Browse Full Catalog</a>
            </li>
            <li>
              <span className="footer-info-note">
                Free shipping above ₹{FREE_SHIPPING_THRESHOLD}
              </span>
            </li>
            <li>
              <span className="footer-info-note">
                Flat ₹{STANDARD_SHIPPING_FEE} shipping under ₹{FREE_SHIPPING_THRESHOLD}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} NOVA Retail. Powered by FakeStoreAPI.
        </p>
        <button type="button" className="footer-top-btn" onClick={scrollToTop}>
          Back to top
          <ArrowUp size={15} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
