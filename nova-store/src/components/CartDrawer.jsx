import { useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    openCheckout,
    removeFromCart,
    updateQuantity,
    calculateTotal
  } = useCart();

  const totals = calculateTotal();

  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-labelledby="cartDrawerTitle">
      <div className="drawer-overlay" onClick={closeCart} aria-hidden="true" />

      <aside className="cart-drawer">
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2 id="cartDrawerTitle">Shopping Cart</h2>
            <span className="drawer-count">
              {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeCart}
            aria-label="Close shopping cart"
          >
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="drawer-empty">
            <div className="drawer-empty-icon">
              <ShoppingBag size={30} strokeWidth={1.6} aria-hidden="true" />
            </div>
            <h3>Your cart is empty</h3>
            <p>Browse NOVA's electronics, jewelry, and clothing collections to add items.</p>
            <button type="button" className="btn btn-primary" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              <ul className="cart-items-list">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </ul>
            </div>

            <div className="drawer-footer">
              <CartSummary totals={totals} onProceedToCheckout={openCheckout} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
