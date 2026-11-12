import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  calculateOrderTotals,
  calculateTotalQuantity,
} from '../utils/calculations';

const CART_STORAGE_KEY = 'nova_shopping_cart_v1';
const MAX_ITEM_QUANTITY = 99;

const CartContext = createContext(null);

function sanitizeCartItems(raw) {
  if (!Array.isArray(raw)) return [];

  const seenIds = new Set();
  const validItems = [];

  for (const item of raw) {
    if (!item || item.id === undefined || item.id === null) continue;
    if (seenIds.has(item.id)) continue;

    const price = Number(item.price);
    const quantity = Math.floor(Number(item.quantity));

    if (!Number.isFinite(price) || price < 0) continue;
    if (!Number.isInteger(quantity) || quantity < 1) continue;

    seenIds.add(item.id);
    validItems.push({
      id: item.id,
      title: String(item.title || 'Product'),
      price,
      image: String(item.image || ''),
      category: String(item.category || ''),
      quantity: Math.min(quantity, MAX_ITEM_QUANTITY),
    });
  }

  return validItems;
}

function loadCartFromStorage() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return sanitizeCartItems(parsed);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota or private browsing errors cleanly
    }
  }, [cartItems]);

  // Sync cart across multiple open browser tabs
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === CART_STORAGE_KEY) {
        setCartItems(loadCartFromStorage());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({
      id: Date.now() + Math.random(),
      message,
      type,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const addToCart = useCallback(
    (product) => {
      if (!product || product.id === undefined || product.id === null) return;

      const numericPrice = Number(product.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) return;

      let reachedLimit = false;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === product.id);
        if (existingIndex !== -1) {
          const current = prev[existingIndex];
          if (current.quantity >= MAX_ITEM_QUANTITY) {
            reachedLimit = true;
            return prev;
          }
          const updated = [...prev];
          updated[existingIndex] = {
            ...current,
            quantity: current.quantity + 1,
          };
          return updated;
        }

        return [
          ...prev,
          {
            id: product.id,
            title: String(product.title || 'Product'),
            price: numericPrice,
            image: String(product.image || ''),
            category: String(product.category || ''),
            quantity: 1,
          },
        ];
      });

      if (reachedLimit) {
        showToast(`Maximum quantity (${MAX_ITEM_QUANTITY}) reached for this item.`, 'info');
      } else {
        showToast(`Added "${product.title}" to cart.`, 'success');
      }
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId) => {
      let removedTitle = '';
      setCartItems((prev) => {
        const target = prev.find((item) => item.id === productId);
        if (target) removedTitle = target.title;
        return prev.filter((item) => item.id !== productId);
      });
      if (removedTitle) {
        showToast(`Removed "${removedTitle}" from cart.`, 'info');
      }
    },
    [showToast]
  );

  const updateQuantity = useCallback((productId, quantity) => {
    const parsedQty = Number(quantity);
    if (!Number.isFinite(parsedQty) || !Number.isInteger(parsedQty)) {
      return;
    }

    if (parsedQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    const clampedQty = Math.min(parsedQty, MAX_ITEM_QUANTITY);

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: clampedQty } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const calculateTotal = useCallback(
    () => calculateOrderTotals(cartItems),
    [cartItems]
  );

  const totals = useMemo(() => calculateOrderTotals(cartItems), [cartItems]);
  const totalQuantity = useMemo(() => calculateTotalQuantity(cartItems), [cartItems]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const value = useMemo(
    () => ({
      cartItems,
      totalQuantity,
      totals,
      isCartOpen,
      isCheckoutOpen,
      toast,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      calculateTotal,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      showToast,
      dismissToast,
      maxItemQuantity: MAX_ITEM_QUANTITY,
    }),
    [
      cartItems,
      totalQuantity,
      totals,
      isCartOpen,
      isCheckoutOpen,
      toast,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      calculateTotal,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      showToast,
      dismissToast,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
