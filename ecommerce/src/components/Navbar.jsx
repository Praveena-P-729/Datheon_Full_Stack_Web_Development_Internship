import { useEffect, useRef, useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../utils/calculations';
import './Navbar.css';

export default function Navbar({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onNavigateHome,
  onNavigateCatalog,
}) {
  const { totalQuantity, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (action) => {
    setMobileMenuOpen(false);
    action();
  };

  const handleCategoryNav = (category) => {
    onSelectCategory(category);
    onNavigateCatalog();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onNavigateCatalog();
    setMobileMenuOpen(false);
  };

  const handleDesktopSearchClick = () => {
    if (window.innerWidth <= 960) {
      setMobileSearchOpen((prev) => !prev);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      searchInputRef.current?.focus();
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      isActive: false,
      onClick: () => handleNavClick(onNavigateHome),
    },
    {
      id: 'shop',
      label: 'Shop',
      isActive: activeCategory === 'all',
      onClick: () => handleNavClick(() => handleCategoryNav('all')),
    },
    {
      id: 'electronics',
      label: 'Electronics',
      isActive: activeCategory === 'electronics',
      onClick: () => handleNavClick(() => handleCategoryNav('electronics')),
    },
    {
      id: 'jewelery',
      label: 'Jewelry',
      isActive: activeCategory === 'jewelery',
      onClick: () => handleNavClick(() => handleCategoryNav('jewelery')),
    },
    {
      id: 'clothing',
      label: 'Clothing',
      isActive:
        activeCategory === 'clothing' ||
        activeCategory === "men's clothing" ||
        activeCategory === "women's clothing",
      onClick: () => handleNavClick(() => handleCategoryNav('clothing')),
    },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="navbar-announcement">
        <span>
          Complimentary shipping on orders above ₹{FREE_SHIPPING_THRESHOLD} — Flat ₹
          {STANDARD_SHIPPING_FEE} shipping otherwise
        </span>
      </div>

      <nav className="navbar container" aria-label="Primary navigation">
        <div className="navbar-left">
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a
            href="#top"
            className="navbar-brand"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(onNavigateHome);
            }}
            aria-label="NOVA Home"
          >
            <span className="navbar-brand-mark" aria-hidden="true">
              N
            </span>
            <span className="navbar-brand-wordmark">NOVA</span>
          </a>
        </div>

        <ul className="navbar-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`navbar-link ${item.isActive ? 'is-active' : ''}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <form className="navbar-search-form" onSubmit={handleSearchSubmit} role="search">
            <label htmlFor="navbar-search-input" className="sr-only">
              Search products
            </label>
            <Search size={16} className="navbar-search-icon" aria-hidden="true" />
            <input
              id="navbar-search-input"
              ref={searchInputRef}
              type="search"
              className="navbar-search-input"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </form>

          <button
            type="button"
            className="navbar-icon-btn navbar-search-trigger"
            onClick={handleDesktopSearchClick}
            aria-label="Toggle product search"
            aria-expanded={mobileSearchOpen}
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            className="navbar-cart-btn"
            onClick={openCart}
            aria-label={`Open shopping cart with ${totalQuantity} ${
              totalQuantity === 1 ? 'item' : 'items'
            }`}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            <span className="navbar-cart-label">Cart</span>
            <span className="navbar-cart-badge" data-testid="cart-badge">
              {totalQuantity}
            </span>
          </button>
        </div>
      </nav>

      {mobileSearchOpen && (
        <div className="navbar-mobile-search container">
          <form onSubmit={handleSearchSubmit} className="navbar-mobile-search-form" role="search">
            <label htmlFor="mobile-navbar-search" className="sr-only">
              Search products
            </label>
            <Search size={17} className="navbar-search-icon" aria-hidden="true" />
            <input
              id="mobile-navbar-search"
              type="search"
              className="navbar-mobile-search-input"
              placeholder="Search products by title..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary navbar-mobile-search-btn">
              Find
            </button>
          </form>
        </div>
      )}

      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="navbar-mobile-menu">
          <ul className="navbar-mobile-links container">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`navbar-mobile-link ${item.isActive ? 'is-active' : ''}`}
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
