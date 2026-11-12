import { Truck } from 'lucide-react';
import { formatCurrency, FREE_SHIPPING_THRESHOLD } from '../utils/calculations';
import './CartSummary.css';

export default function CartSummary({ totals, onCheckout, showCheckoutButton = true }) {
  const { subtotal, tax, shipping, grandTotal, isFreeShipping, amountToFreeShipping } =
    totals;

  return (
    <div className="cart-summary">
      {subtotal > 0 && (
        <div
          className={`shipping-banner ${isFreeShipping ? 'is-free' : ''}`}
          role="status"
        >
          <Truck size={16} aria-hidden="true" />
          {isFreeShipping ? (
            <span>You unlocked complimentary shipping (orders above ₹{FREE_SHIPPING_THRESHOLD}).</span>
          ) : (
            <span>
              Add <strong>{formatCurrency(amountToFreeShipping)}</strong> more to unlock free
              shipping (above ₹{FREE_SHIPPING_THRESHOLD}).
            </span>
          )}
        </div>
      )}

      <dl className="summary-rows">
        <div className="summary-row">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>

        <div className="summary-row">
          <dt>Estimated Tax (5%)</dt>
          <dd>{formatCurrency(tax)}</dd>
        </div>

        <div className="summary-row">
          <dt>Shipping</dt>
          <dd className={isFreeShipping ? 'summary-free-text' : ''}>
            {subtotal === 0
              ? formatCurrency(0)
              : isFreeShipping
                ? 'Free'
                : formatCurrency(shipping)}
          </dd>
        </div>

        <div className="summary-row summary-total-row">
          <dt>Grand Total</dt>
          <dd>{formatCurrency(grandTotal)}</dd>
        </div>
      </dl>

      {showCheckoutButton && (
        <button
          type="button"
          className="btn btn-primary summary-checkout-btn"
          onClick={onCheckout}
          disabled={subtotal === 0}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
