export const TAX_RATE = 0.05;
export const FREE_SHIPPING_THRESHOLD = 40;
export const STANDARD_SHIPPING_FEE = 2;

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Round a numeric value to 2 decimal places to avoid floating-point drift.
 */
export function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Format a numeric amount as INR currency (e.g. ₹42.50).
 */
export function formatCurrency(amount) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return currencyFormatter.format(safeAmount);
}

/**
 * Calculate cart subtotal: Sum of (Product Price * Quantity).
 */
export function calculateSubtotal(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  const rawTotal = items.reduce((sum, item) => {
    const price = Number(item?.price);
    const quantity = Number(item?.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0 || price < 0) {
      return sum;
    }
    return sum + price * quantity;
  }, 0);

  return roundCurrency(rawTotal);
}

/**
 * Calculate 5% tax on the subtotal.
 */
export function calculateTax(subtotal) {
  const safeSubtotal = Number.isFinite(Number(subtotal)) && Number(subtotal) > 0 ? Number(subtotal) : 0;
  return roundCurrency(safeSubtotal * TAX_RATE);
}

/**
 * Calculate shipping:
 * - ₹0 when cart is empty (subtotal === 0)
 * - Free shipping (₹0) when subtotal > ₹40
 * - ₹2 flat shipping charge otherwise
 */
export function calculateShipping(subtotal) {
  const safeSubtotal = Number(subtotal);
  if (!Number.isFinite(safeSubtotal) || safeSubtotal <= 0) {
    return 0;
  }
  return safeSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

/**
 * Calculate complete order totals breakdown.
 */
export function calculateOrderTotals(items = []) {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const grandTotal = roundCurrency(subtotal + tax + shipping);
  const amountToFreeShipping =
    subtotal > 0 && subtotal <= FREE_SHIPPING_THRESHOLD
      ? roundCurrency(FREE_SHIPPING_THRESHOLD - subtotal + 0.01)
      : 0;

  return {
    subtotal,
    tax,
    shipping,
    grandTotal,
    isFreeShipping: subtotal > FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
  };
}

/**
 * Calculate total quantity of items in the cart.
 */
export function calculateTotalQuantity(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    const qty = Number(item?.quantity);
    return Number.isInteger(qty) && qty > 0 ? total + qty : total;
  }, 0);
}

/**
 * Generate a unique readable order reference (e.g. NOVA-261112-8F3A).
 */
export function generateOrderReference() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NOVA-${yy}${mm}${dd}-${suffix}`;
}
