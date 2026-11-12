import { ArrowRight, Truck } from "lucide-react";
import { formatCurrency } from "../utils/calculations";

export default function CartSummary({ totals, onProceedToCheckout }) {
  const {
    subtotal,
    tax,
    shipping,
    grandTotal,
    qualifiesForFreeShipping,
    amountForFreeShipping
  } = totals;

  return (
    <div className="cart-summary">
      <div className={`shipping-notice ${qualifiesForFreeShipping ? "qualified" : ""}`}>
        <Truck size={16} aria-hidden="true" />
        <span>
          {qualifiesForFreeShipping
            ? "Your order qualifies for free standard shipping."
            : `Add ${formatCurrency(amountForFreeShipping)} more for free shipping (orders above $40).`}
        </span>
      </div>

      <dl className="summary-lines">
        <div className="summary-line">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        <div className="summary-line">
          <dt>Estimated Tax (5%)</dt>
          <dd>{formatCurrency(tax)}</dd>
        </div>
        <div className="summary-line">
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
        </div>
        <div className="summary-line summary-total">
          <dt>Grand Total</dt>
          <dd>{formatCurrency(grandTotal)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="btn btn-primary btn-full"
        onClick={onProceedToCheckout}
      >
        <span>Proceed to Checkout</span>
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
