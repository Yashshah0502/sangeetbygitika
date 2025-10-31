"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: "Tote", href: "/category/tote" },
    { name: "Clutch", href: "/category/clutch" },
    { name: "Potli", href: "/category/potli" },
    { name: "Sling", href: "/category/sling" },
    { name: "Handbag", href: "/category/handbag" },
    { name: "Accessories", href: "/category/accessories" },
  ];

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left: Shop Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 text-brand-text hover:text-brand-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Shop</span>
          </button>

          {/* Center: Brand */}
          <Link href="/" className="flex flex-col items-center">
            <h1 className="font-display text-2xl md:text-3xl text-brand-primary">
              Sangeet by Gitika
            </h1>
            <p className="text-xs text-brand-text/60 hidden sm:block">
              Premium Handbags & Accessories
            </p>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-brand-text hover:text-brand-primary transition-colors hover:scale-110 transform duration-200">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/wishlist"
              className="relative text-brand-text hover:text-brand-primary transition-colors hover:scale-110 transform duration-200"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-brand-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative text-brand-text hover:text-brand-primary transition-colors hover:scale-110 transform duration-200"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Side Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl text-brand-primary">
                  Shop by Category
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-brand-text hover:text-brand-primary text-2xl"
                >
                  ×
                </button>
              </div>
              <nav className="space-y-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg text-brand-text hover:bg-gradient-to-r hover:from-brand-hover-from hover:to-brand-hover-to hover:text-brand-primary transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 rounded-lg font-medium text-brand-primary hover:bg-gradient-to-r hover:from-brand-hover-from hover:to-brand-hover-to transition-all"
                >
                  All Products
                </Link>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
