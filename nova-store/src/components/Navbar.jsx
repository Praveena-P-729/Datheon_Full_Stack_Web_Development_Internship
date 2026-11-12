import { useState } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { API_CATEGORIES } from "../services/api";

export default function Navbar({
  activeCategory,
  onSelectCategory,
  onNavigateHome,
  onNavigateShop,
  onFocusSearch
}) {
  const { calculateTotal, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { itemCount } = calculateTotal();

  const handleNavAction = (callback) => {
    setMobileMenuOpen(false);
    callback();
  };

  const navLinks = [
    { label: "Home", id: "home", action: () => onNavigateHome() },
    {
      label: "Shop",
      id: API_CATEGORIES.ALL,
      active: activeCategory === API_CATEGORIES.ALL,
      action: () => onNavigateShop(API_CATEGORIES.ALL)
    },
    {
      label: "Electronics",
      id: API_CATEGORIES.ELECTRONICS,
      active: activeCategory === API_CATEGORIES.ELECTRONICS,
      action: () => onNavigateShop(API_CATEGORIES.ELECTRONICS)
    },
    {
      label: "Jewelry",
      id: API_CATEGORIES.JEWELERY,
      active: activeCategory === API_CATEGORIES.JEWELERY,
      action: () => onNavigateShop(API_CATEGORIES.JEWELERY)
    },
    {
      label: "Clothing",
      id: API_CATEGORIES.CLOTHING_GROUP,
      active:
        activeCategory === API_CATEGORIES.CLOTHING_GROUP ||
        activeCategory === API_CATEGORIES.MENS_CLOTHING ||
        activeCategory === API_CATEGORIES.WOMENS_CLOTHING,
      action: () => onNavigateShop(API_CATEGORIES.CLOTHING_GROUP)
    }
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a
          href="#home"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            handleNavAction(onNavigateHome);
          }}
          aria-label="NOVA Home"
        >
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <span className="brand-wordmark">NOVA</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary Navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`nav-link ${link.active ? "active" : ""}`}
              onClick={() => handleNavAction(link.action)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => handleNavAction(onFocusSearch)}
            aria-label="Search products"
            title="Search catalog"
          >
            <Search size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="cart-trigger-btn"
            onClick={openCart}
            aria-label={`Open shopping cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <ShoppingBag size={19} strokeWidth={1.8} />
            <span className="cart-btn-label">Cart</span>
            <span className="cart-badge" aria-live="polite">
              {itemCount}
            </span>
          </button>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile Navigation">
          <div className="container mobile-nav-list">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                className={`mobile-nav-link ${link.active ? "active" : ""}`}
                onClick={() => handleNavAction(link.action)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
