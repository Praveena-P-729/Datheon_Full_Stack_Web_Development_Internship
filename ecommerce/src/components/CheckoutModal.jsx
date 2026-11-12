import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, generateOrderReference } from '../utils/calculations';
import './CheckoutModal.css';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  paymentMethod: 'card',
};

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card (Simulated)',
    description: 'Instant simulated authorization',
    icon: CreditCard,
  },
  {
    id: 'wallet',
    label: 'Digital Wallet (Simulated)',
    description: 'One-click express simulation',
    icon: Wallet,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay upon package arrival',
    icon: Truck,
  },
];

function validateCheckoutForm(values) {
  const errors = {};
  const name = values.fullName.trim();
  const email = values.email.trim();
  const phoneDigits = values.phone.replace(/[^\d]/g, '');
  const address = values.address.trim();
  const city = values.city.trim();
  const postalCode = values.postalCode.trim();

  if (name.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = 'Please enter a valid phone number (7–15 digits).';
  }

  if (address.length < 5) {
    errors.address = 'Please enter your street delivery address.';
  }

  if (city.length < 2) {
    errors.city = 'Please enter your city.';
  }

  if (!/^[A-Za-z0-9\s-]{3,12}$/.test(postalCode)) {
    errors.postalCode = 'Please enter a valid postal or ZIP code.';
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = 'Please choose a payment method.';
  }

  return errors;
}

export default function CheckoutModal() {
  const {
    cartItems,
    totals,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    showToast,
  } = useCart();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (!isCheckoutOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCheckoutOpen, isSubmitting]);

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setConfirmedOrder(null);
    setErrors({});
    setFormData(INITIAL_FORM);
    closeCheckout();
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting || confirmedOrder || cartItems.length === 0) return;

    const validationErrors = validateCheckoutForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Snapshot order details before clearing the cart
    const orderSnapshot = {
      reference: generateOrderReference(),
      placedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
      },
      paymentMethodLabel:
        PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.label ||
        'Simulated Payment',
      items: cartItems.map((item) => ({ ...item })),
      totals: { ...totals },
    };

    setTimeout(() => {
      setConfirmedOrder(orderSnapshot);
      clearCart();
      setIsSubmitting(false);
      showToast(`Order ${orderSnapshot.reference} confirmed!`, 'success');
    }, 450);
  };

  return (
    <div className="checkout-modal-portal">
      <div
        className="checkout-overlay"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        <header className="checkout-header">
          <div>
            <span className="checkout-eyebrow">
              {confirmedOrder ? 'Order Confirmation' : 'Simulated Checkout'}
            </span>
            <h2 id="checkout-modal-title" className="checkout-title">
              {confirmedOrder ? 'Thank you for your order' : 'Complete Your Order'}
            </h2>
          </div>

          <button
            type="button"
            className="checkout-close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close checkout"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {confirmedOrder ? (
          <div className="checkout-confirmation">
            <div className="confirmation-banner">
              <CheckCircle2 size={32} className="confirmation-icon" aria-hidden="true" />
              <div>
                <p className="confirmation-ref">
                  Order Reference: <strong>{confirmedOrder.reference}</strong>
                </p>
                <p className="confirmation-meta">
                  Confirmed on {confirmedOrder.placedAt} • Confirmation sent to{' '}
                  {confirmedOrder.customer.email}
                </p>
              </div>
            </div>

            <div className="confirmation-grid">
              <section className="confirmation-box">
                <h3 className="confirmation-box-title">Delivery Details</h3>
                <p>{confirmedOrder.customer.fullName}</p>
                <p>{confirmedOrder.customer.address}</p>
                <p>
                  {confirmedOrder.customer.city}, {confirmedOrder.customer.postalCode}
                </p>
                <p>{confirmedOrder.customer.phone}</p>
                <p className="confirmation-payment-tag">
                  Payment: {confirmedOrder.paymentMethodLabel}
                </p>
              </section>

              <section className="confirmation-box">
                <h3 className="confirmation-box-title">Payment Breakdown</h3>
                <div className="confirmation-totals">
                  <div>
                    <span>Subtotal</span>
                    <span>{formatCurrency(confirmedOrder.totals.subtotal)}</span>
                  </div>
                  <div>
                    <span>Tax (5%)</span>
                    <span>{formatCurrency(confirmedOrder.totals.tax)}</span>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <span>
                      {confirmedOrder.totals.isFreeShipping
                        ? 'Free'
                        : formatCurrency(confirmedOrder.totals.shipping)}
                    </span>
                  </div>
                  <div className="confirmation-grand-total">
                    <span>Total Paid</span>
                    <span>{formatCurrency(confirmedOrder.totals.grandTotal)}</span>
                  </div>
                </div>
              </section>
            </div>

            <section className="confirmation-items-section">
              <h3 className="confirmation-box-title">
                Ordered Items ({confirmedOrder.items.length})
              </h3>
              <ul className="confirmation-items-list">
                {confirmedOrder.items.map((item) => (
                  <li key={item.id} className="confirmation-item-row">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="confirmation-item-img"
                    />
                    <div className="confirmation-item-info">
                      <p className="confirmation-item-name">{item.title}</p>
                      <p className="confirmation-item-qty">
                        Qty {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="confirmation-item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="confirmation-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <form className="checkout-body" onSubmit={handleSubmit} noValidate>
            <div className="checkout-form-column">
              <div className="checkout-notice">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>
                  Demo checkout simulation — no real payment or card charge will be made.
                </span>
              </div>

              <fieldset className="checkout-fieldset">
                <legend className="checkout-legend">Customer &amp; Delivery Information</legend>

                <div className="form-grid">
                  <div className="form-field form-field-full">
                    <label htmlFor="checkout-name" className="form-label">
                      Full Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      className={`form-input ${errors.fullName ? 'has-error' : ''}`}
                      value={formData.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      placeholder="Alex Morgan"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <p className="form-error" role="alert">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="checkout-email" className="form-label">
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      className={`form-input ${errors.email ? 'has-error' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="alex@example.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="form-error" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="checkout-phone" className="form-label">
                      Phone Number <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'has-error' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="form-error" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="form-field form-field-full">
                    <label htmlFor="checkout-address" className="form-label">
                      Delivery Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      className={`form-input ${errors.address ? 'has-error' : ''}`}
                      value={formData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      placeholder="420 Mercer Street, Apt 4B"
                      autoComplete="street-address"
                    />
                    {errors.address && (
                      <p className="form-error" role="alert">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="checkout-city" className="form-label">
                      City <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      className={`form-input ${errors.city ? 'has-error' : ''}`}
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="Portland"
                      autoComplete="address-level2"
                    />
                    {errors.city && (
                      <p className="form-error" role="alert">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="checkout-postal" className="form-label">
                      Postal Code <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="checkout-postal"
                      type="text"
                      className={`form-input ${errors.postalCode ? 'has-error' : ''}`}
                      value={formData.postalCode}
                      onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                      placeholder="97205"
                      autoComplete="postal-code"
                    />
                    {errors.postalCode && (
                      <p className="form-error" role="alert">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend className="checkout-legend">Simulated Payment Method</legend>
                <div className="payment-methods-list">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = formData.paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`payment-method-card ${isSelected ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                          className="sr-only"
                        />
                        <span className="payment-method-icon" aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        <span className="payment-method-text">
                          <span className="payment-method-title">{method.label}</span>
                          <span className="payment-method-desc">{method.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.paymentMethod && (
                  <p className="form-error" role="alert">
                    {errors.paymentMethod}
                  </p>
                )}
              </fieldset>
            </div>

            <aside className="checkout-summary-column">
              <div className="checkout-summary-card">
                <h3 className="checkout-summary-title">Order Summary</h3>

                <ul className="checkout-summary-items">
                  {cartItems.map((item) => (
                    <li key={item.id} className="checkout-summary-item">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="checkout-summary-img"
                      />
                      <div className="checkout-summary-item-meta">
                        <p className="checkout-summary-item-title">{item.title}</p>
                        <span className="checkout-summary-item-qty">
                          Qty {item.quantity} × {formatCurrency(item.price)}
                        </span>
                      </div>
                      <span className="checkout-summary-item-total">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="checkout-totals">
                  <div className="checkout-total-row">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(totals.subtotal)}</dd>
                  </div>
                  <div className="checkout-total-row">
                    <dt>Tax (5%)</dt>
                    <dd>{formatCurrency(totals.tax)}</dd>
                  </div>
                  <div className="checkout-total-row">
                    <dt>Shipping</dt>
                    <dd>{totals.isFreeShipping ? 'Free' : formatCurrency(totals.shipping)}</dd>
                  </div>
                  <div className="checkout-total-row checkout-grand-total">
                    <dt>Final Amount</dt>
                    <dd>{formatCurrency(totals.grandTotal)}</dd>
                  </div>
                </dl>

                <button
                  type="submit"
                  className="btn btn-primary checkout-submit-btn"
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  <Lock size={16} aria-hidden="true" />
                  {isSubmitting
                    ? 'Confirming Order...'
                    : `Place Order (${formatCurrency(totals.grandTotal)})`}
                </button>
              </div>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
