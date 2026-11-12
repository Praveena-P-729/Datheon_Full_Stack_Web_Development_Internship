import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { calculateCartTotals } from "../utils/calculations";

const CART_STORAGE_KEY = "nova_shopping_cart_v1";
const MAX_ITEM_QUANTITY = 99;

const CartContext = createContext(null);

function loadPersistedCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        item.id !== undefined &&
        typeof item.title === "string" &&
        typeof item.price === "number" &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch (err) {
    console.warn("Unable to read persisted cart from localStorage:", err);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadPersistedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Persist cart changes immediately to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn("Unable to persist cart to localStorage:", err);
    }
  }, [cartItems]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback((message, variant = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), message, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  /**
   * Adds a product to the cart or increments quantity if already present (prevents duplicates)
   */
  const addToCart = useCallback(
    (product) => {
      if (!product || product.id === undefined) return;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === product.id);
        if (existingIndex !== -1) {
          return prev.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, item.quantity + 1) }
              : item
          );
        }

        const sanitizedItem = {
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          image: product.image || "",
          category: product.category || "",
          quantity: 1
        };
        return [...prev, sanitizedItem];
      });

      showToast(`Added "${product.title.slice(0, 32)}${product.title.length > 32 ? "..." : ""}" to cart`);
    },
    [showToast]
  );

  /**
   * Removes an item completely from the cart
   */
  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      showToast("Item removed from cart", "neutral");
    },
    [showToast]
  );

  /**
   * Updates quantity for a specific cart item while guarding against invalid values
   */
  const updateQuantity = useCallback((productId, rawQuantity) => {
    const parsedQty = Number(rawQuantity);
    if (!Number.isFinite(parsedQty) || Number.isNaN(parsedQty)) return;

    const cleanQty = Math.floor(parsedQty);

    if (cleanQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    const boundedQty = Math.min(MAX_ITEM_QUANTITY, cleanQty);
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: boundedQty } : item
      )
    );
  }, []);

  /**
   * Clears all items from the cart (invoked after confirmed checkout)
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /**
   * Computes subtotal, 5% tax, shipping, and grand total
   */
  const calculateTotal = useCallback(() => {
    return calculateCartTotals(cartItems);
  }, [cartItems]);

  const value = {
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotal,
    toast,
    showToast,
    dismissToast
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
