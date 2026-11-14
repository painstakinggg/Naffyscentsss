import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "naffy_cart";
const WISHLIST_KEY = "naffy_wishlist";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((product, quantity = 1, size_ml = null) => {
    setItems((prev) => {
      const size = size_ml != null ? size_ml : (product.size_ml || 100);
      const existing = prev.find((i) => i.id === product.id && i.size_ml === size);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.size_ml === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          size_ml: size,
          is_bundle: !!product.is_bundle,
          quantity,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id, size_ml) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size_ml === size_ml)));
  }, []);

  const updateQuantity = useCallback((id, size_ml, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.size_ml === size_ml ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    isOpen,
    setIsOpen,
    wishlist,
    toggleWishlist,
    isWishlisted,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}