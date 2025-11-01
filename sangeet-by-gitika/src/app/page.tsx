"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import FloatingContactButton from "./components/FloatingContactButton";
import HeroCarousel from "./components/HeroCarousel";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";

type Product = {
  id: string;
  name: string;
  price: number | null;
  image_url: string;
  image_urls?: string[];
  category: string;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

const ITEMS_PER_PAGE = 16;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") || "";

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("id,name,price,image_url,image_urls,category,created_at")
        .eq("is_available", true);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
      setCategories(categoriesData || []);
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category Filter
    if (filter !== "All") {
      result = result.filter((p) =>
        p.category?.toLowerCase() === filter.toLowerCase()
      );
    }

    // Sort
    if (sortBy === "Price (Low → High)") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "Price (High → Low)") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      result.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredProducts(result);
    setPage(1); // Reset page when filters change
    setHasMore(true);
  }, [filter, sortBy, products, searchQuery]);

  // Load more products when scrolling
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    const newDisplayed = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts(newDisplayed);
    setHasMore(endIndex < filteredProducts.length);
  }, [filteredProducts, page]);

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore]);

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    if (p.price) {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.price) {
      addToWishlist({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
      });
    }
  };

  return (
    <>
      <LoadingScreen />
      <Header />
      <FloatingContactButton />
      <main className="min-h-screen text-brand-text">
        {/* Hero Carousel - Only show when not searching */}
        {!searchQuery && <HeroCarousel autoPlayInterval={3000} />}

        {/* Search Results Indicator */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 pt-6 pb-2"
          >
            <p className="text-brand-text/70 text-sm">
              Search results for <span className="font-semibold text-brand-primary">"{searchQuery}"</span>
              {filteredProducts.length > 0 && ` (${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'})`}
            </p>
          </motion.div>
        )}

        {/* Filters & Sort - Moved to top right corner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-end items-center border-b border-gray-100"
        >
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-brand-text/70">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-primary transition hover:border-gray-300"
            >
              <option>All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-brand-text/70">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-primary transition hover:border-gray-300"
            >
              <option>Newest</option>
              <option>Price (Low → High)</option>
              <option>Price (High → Low)</option>
            </select>
          </div>
        </motion.div>

        {/* Product Grid */}
        <section className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 px-3 md:px-6 pb-20">
          {displayedProducts.length === 0 && filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-2xl text-brand-primary mb-2">
                  No products found
                </h3>
                <p className="text-brand-text/70 mb-6">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different search term.`
                    : "No products match your filters. Try adjusting your selection."
                  }
                </p>
                {searchQuery && (
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 hover:scale-105 transition-all"
                  >
                    View All Products
                  </Link>
                )}
              </motion.div>
            </div>
          ) : (
            <>
              {displayedProducts.map((p, index) => {
                const cartItem = cartItems.find(item => item.id === p.id);
                const cartQuantity = cartItem ? cartItem.quantity : 0;

                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={index}
                    isInWishlist={isInWishlist(p.id)}
                    cartQuantity={cartQuantity}
                    onAddToCart={(e) => handleAddToCart(e, p)}
                    onUpdateQuantity={updateQuantity}
                    onToggleWishlist={(e) => handleWishlistToggle(e, p)}
                  />
                );
              })}

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={ref} className="col-span-full py-8 flex justify-center">
                  <div className="flex items-center gap-2 text-brand-text/60">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-6 mb-20 p-8 md:p-12 bg-linear-to-br from-brand-hover-from to-brand-hover-to rounded-3xl shadow-luxury text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl text-brand-text mb-4">
            Get in Touch 💌
          </h2>
          <p className="text-brand-text/70 mb-6 text-sm md:text-base">
            Have questions? Want to place a custom order? Reach out to us!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/4809522965"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <span>💬</span>
              <span className="font-medium text-brand-text text-sm md:text-base">WhatsApp</span>
            </a>
            <a
              href="mailto:sangeet@example.com"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <span>✉️</span>
              <span className="font-medium text-brand-text text-sm md:text-base">Email</span>
            </a>
            <a
              href="https://instagram.com/sangeetbygitika"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <span>📸</span>
              <span className="font-medium text-brand-text text-sm md:text-base">Instagram</span>
            </a>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center text-xs md:text-sm text-brand-text/50 pb-8">
          © 2025 SanGeet by Gitika
        </footer>
      </main>
    </>
  );
}
