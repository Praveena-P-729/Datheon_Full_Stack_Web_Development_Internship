import { useState, useEffect } from "react";
import { X, CheckCircle2, CreditCard, Lock } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency, generateOrderReference } from "../utils/calculations";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  paymentMethod: "card"
};

export default function CheckoutModal() {
  const { cartItems, isCheckoutOpen, closeCheckout, calculateTotal, clearCart, showToast } =
    useCart();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const totals = calculateTotal();

  useEffect(() => {
    if (!isCheckoutOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isCheckoutOpen, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    setConfirmedOrder(null);
    setErrors({});
    setFormData(INITIAL_FORM);
    closeCheckout();
  };

  if (!isCheckoutOpen) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const name = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const postal = formData.postalCode.trim();

    if (name.length < 2) {
      nextErrors.fullName = "Please enter your full name (at least 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      nextErrors.phone = "Please enter a valid phone number (7–15 digits).";
    }
    if (address.length < 5) {
      nextErrors.address = "Please enter a complete street delivery address.";
    }
    if (city.length < 2) {
      nextErrors.city = "Please enter your delivery city.";
    }
    if (!/^[A-Za-z0-9\s-]{3,10}$/.test(postal)) {
      nextErrors.postalCode = "Please enter a valid postal/ZIP code.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || confirmedOrder || cartItems.length === 0) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Snapshot items and totals before clearing cart
    const orderSnapshot = {
      reference: generateOrderReference(),
      placedAt: new Date().toLocaleString(),
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        paymentMethod: formData.paymentMethod
      },
      items: cartItems.map((item) => ({ ...item })),
      totals: { ...totals }
    };

    // Simulated async checkout confirmation
    setTimeout(() => {
      setConfirmedOrder(orderSnapshot);
      clearCart();
      setIsSubmitting(false);
      showToast(`Order ${orderSnapshot.reference} confirmed`);
    }, 650);
  };

  const paymentLabels = {
    card: "Credit / Debit Card (Simulated)",
    wallet: "Digital Wallet / UPI (Simulated)",
    cod: "Cash on Delivery"
  };

  return (
    <div
      className="modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkoutModalTitle"
    >
      <div className="modal-overlay" onClick={handleClose} aria-hidden="true" />

      <div className="checkout-modal">
        <div className="modal-header">
          <h2 id="checkoutModalTitle">
            {confirmedOrder ? "Order Confirmation" : "Checkout"}
          </h2>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="confirmation-view">
            <div className="confirmation-badge">
              <CheckCircle2 size={34} aria-hidden="true" />
            </div>
            <h3>Thank you for your order, {confirmedOrder.customer.fullName}</h3>
            <p className="confirmation-sub">
              Your simulated order has been placed successfully. A summary is listed below.
            </p>

            <div className="order-ref-box">
              <span>Order Reference</span>
              <strong>{confirmedOrder.reference}</strong>
            </div>

            <div className="confirmation-details">
              <div>
                <h4>Delivery Address</h4>
                <p>
                  {confirmedOrder.customer.address}, {confirmedOrder.customer.city}{" "}
                  {confirmedOrder.customer.postalCode}
                </p>
                <p>
                  {confirmedOrder.customer.email} · {confirmedOrder.customer.phone}
                </p>
              </div>
              <div>
                <h4>Payment Method</h4>
                <p>{paymentLabels[confirmedOrder.customer.paymentMethod]}</p>
              </div>
            </div>

            <div className="confirmation-items">
              <h4>Ordered Items</h4>
              <ul>
                {confirmedOrder.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>

              <div className="confirmation-total-row">
                <span>Total Paid (incl. tax &amp; shipping)</span>
                <strong>{formatCurrency(confirmedOrder.totals.grandTotal)}</strong>
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-full" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <form className="checkout-form-grid" onSubmit={handleSubmit} noValidate>
            <div className="checkout-fields">
              <h3 className="checkout-section-title">Shipping Information</h3>

              <div className="form-field">
                <label htmlFor="fullName">Customer Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleFieldChange}
                  placeholder="Alex Morgan"
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    placeholder="alex@example.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    placeholder="+1 555 234 5678"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="address">Delivery Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleFieldChange}
                  placeholder="245 Market Street, Apt 4B"
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleFieldChange}
                    placeholder="San Francisco"
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleFieldChange}
                    placeholder="94105"
                    aria-invalid={Boolean(errors.postalCode)}
                  />
                  {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
                </div>
              </div>

              <h3 className="checkout-section-title">Simulated Payment Method</h3>
              <div className="payment-options" role="radiogroup" aria-label="Payment method">
                {Object.entries(paymentLabels).map(([key, label]) => (
                  <label
                    key={key}
                    className={`payment-option ${formData.paymentMethod === key ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={key}
                      checked={formData.paymentMethod === key}
                      onChange={handleFieldChange}
                    />
                    <CreditCard size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <aside className="checkout-summary-panel">
              <h3 className="checkout-section-title">Order Summary</h3>
              <ul className="checkout-mini-list">
                {cartItems.map((item) => (
                  <li key={item.id}>
                    <span className="mini-title">
                      {item.title} <em>× {item.quantity}</em>
                    </span>
                    <span className="mini-price">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="summary-lines">
                <div className="summary-line">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(totals.subtotal)}</dd>
                </div>
                <div className="summary-line">
                  <dt>Tax (5%)</dt>
                  <dd>{formatCurrency(totals.tax)}</dd>
                </div>
                <div className="summary-line">
                  <dt>Shipping</dt>
                  <dd>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</dd>
                </div>
                <div className="summary-line summary-total">
                  <dt>Final Amount</dt>
                  <dd>{formatCurrency(totals.grandTotal)}</dd>
                </div>
              </dl>

              <p className="simulation-note">
                <Lock size={14} aria-hidden="true" />
                <span>Simulated checkout only. No real payment is charged.</span>
              </p>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isSubmitting || cartItems.length === 0}
              >
                {isSubmitting
                  ? "Processing Order..."
                  : `Place Order (${formatCurrency(totals.grandTotal)})`}
              </button>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
