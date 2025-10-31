"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-brand-primary/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-display text-2xl md:text-3xl text-brand-primary hover:text-brand-accent transition-colors">
          Sangeet by Gitika
        </Link>
        <Link
          href="/cart"
          className="relative flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 hover:from-brand-primary/20 hover:to-brand-accent/20 transition-all hover:scale-105"
        >
          <span className="text-xl">🛍</span>
          <span className="font-medium text-brand-text text-sm md:text-base">Wishlist</span>
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
        </Link>
      </div>
    </motion.nav>
  );
}
