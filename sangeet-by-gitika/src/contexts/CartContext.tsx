"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsHydrated(true);
    const savedCart = localStorage.getItem("sangeet-cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);
      // Ensure all items have quantity property (for backwards compatibility)
      const itemsWithQuantity = items.map((item: any) => ({
        ...item,
        quantity: item.quantity || 1
      }));
      setCartItems(itemsWithQuantity);
    }
  }, []);

  // Save cart to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      if (cartItems.length > 0) {
        localStorage.setItem("sangeet-cart", JSON.stringify(cartItems));
      } else {
        localStorage.removeItem("sangeet-cart");
      }
    }
  }, [cartItems, isHydrated]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        // Increment quantity if already exists
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sangeet-cart");
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount: cartItems.length,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
