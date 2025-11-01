"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock_quantity?: number;
  special_price?: number | null;
  special_price_message?: string | null;
};

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  wishlistCount: number;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setIsHydrated(true);
    const savedWishlist = localStorage.getItem("sangeet-wishlist");
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      if (wishlistItems.length > 0) {
        localStorage.setItem("sangeet-wishlist", JSON.stringify(wishlistItems));
      } else {
        localStorage.removeItem("sangeet-wishlist");
      }
    }
  }, [wishlistItems, isHydrated]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        // Update stored details (price, stock, etc.)
        return prev.map((i) => (i.id === item.id ? { ...i, ...item } : i));
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sangeet-wishlist");
    }
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlistItems.length,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
