"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Heart, ShoppingBag, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Header() {
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (data) {
      setCategories(data);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

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
              SanGeet by Gitika
            </h1>
            <p className="text-xs text-brand-text/60 hidden sm:block">
              Premium Handbags & Accessories
            </p>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-brand-text hover:text-brand-primary transition-colors hover:scale-110 transform duration-200"
            >
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

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-200 bg-white"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-6 py-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for bags, accessories..."
                    autoFocus
                    className="w-full px-5 py-3 pl-12 pr-12 rounded-full border-2 border-brand-primary/30 focus:outline-none focus:border-brand-primary transition-all text-brand-text"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
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
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg text-brand-text hover:bg-linear-to-r hover:from-brand-hover-from hover:to-brand-hover-to hover:text-brand-primary transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 rounded-lg font-medium text-brand-primary hover:bg-linear-to-r hover:from-brand-hover-from hover:to-brand-hover-to transition-all"
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
