const FREE_SHIPPING_THRESHOLD = 40;
const FLAT_SHIPPING_FEE = 2;
const TAX_RATE = 0.05;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/**
 * Formats a numeric USD amount cleanly (e.g., $42.50)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const safeAmount = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return usdFormatter.format(safeAmount);
}

/**
 * Calculates total quantity across all cart items
 * @param {Array<{quantity: number}>} items
 * @returns {number}
 */
export function calculateTotalQuantity(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
    return sum + qty;
  }, 0);
}

/**
 * Computes cart financial summary:
 * - Subtotal = Sum of (price * quantity)
 * - Tax = 5% of Subtotal
 * - Shipping = $0 if Subtotal > $40 (or empty), else $2
 * - Grand Total = Subtotal + Tax + Shipping
 * @param {Array<{price: number, quantity: number}>} items
 */
export function calculateCartTotals(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      grandTotal: 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountForFreeShipping: FREE_SHIPPING_THRESHOLD,
      qualifiesForFreeShipping: false
    };
  }

  const rawSubtotal = items.reduce((sum, item) => {
    const price = typeof item.price === "number" && item.price >= 0 ? item.price : 0;
    const qty = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0;
    return sum + price * qty;
  }, 0);

  const subtotal = roundCents(rawSubtotal);
  const tax = roundCents(subtotal * TAX_RATE);
  const qualifiesForFreeShipping = subtotal > FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal > 0 ? (qualifiesForFreeShipping ? 0 : FLAT_SHIPPING_FEE) : 0;
  const grandTotal = roundCents(subtotal + tax + shipping);
  const amountForFreeShipping = qualifiesForFreeShipping
    ? 0
    : roundCents(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal + 0.01));

  return {
    itemCount: calculateTotalQuantity(items),
    subtotal,
    tax,
    shipping,
    grandTotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountForFreeShipping,
    qualifiesForFreeShipping
  };
}

function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Generates a unique order confirmation reference
 * @returns {string}
 */
export function generateOrderReference() {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NOVA-${year}-${randomPart}`;
}
