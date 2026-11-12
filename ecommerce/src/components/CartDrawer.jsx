import { useEffect, useRef } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import './CartDrawer.css';

export default function CartDrawer({ onBrowseCatalog }) {
  const {
    cartItems,
    totalQuantity,
    totals,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
    maxItemQuantity,
  } = useCart();

  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleContinueShopping = () => {
    closeCart();
    if (onBrowseCatalog) {
      onBrowseCatalog();
    }
  };

  return (
    <div className="cart-drawer-portal">
      <div
        className="cart-drawer-overlay"
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <header className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <h2 id="cart-drawer-title" className="cart-drawer-title">
              Your Shopping Bag
            </h2>
            <span className="cart-drawer-count">
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="cart-drawer-close"
            onClick={closeCart}
            aria-label="Close shopping cart"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-icon" aria-hidden="true">
              <ShoppingBag size={30} />
            </div>
            <h3 className="cart-empty-title">Your cart is empty</h3>
            <p className="cart-empty-text">
              Explore our curated collection of electronics, jewelry, and everyday apparel
              to add items to your bag.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleContinueShopping}
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-body">
              <ul className="cart-items-list">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    maxQuantity={maxItemQuantity}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </ul>
            </div>

            <footer className="cart-drawer-footer">
              <CartSummary totals={totals} onCheckout={openCheckout} />
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
