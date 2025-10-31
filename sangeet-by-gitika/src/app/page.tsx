"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";

type Product = {
  id: string;
  name: string;
  price: number | null;
  image_url: string;
  category: string;
  created_at: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from("products")
        .select("id,name,price,image_url,category,created_at")
        .eq("is_available", true)
        .limit(24);

      setProducts(data || []);
      setFilteredProducts(data || []);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter
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
  }, [filter, sortBy, products]);

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
      <main className="min-h-screen text-brand-text">
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
              <option>Tote</option>
              <option>Clutch</option>
              <option>Potli</option>
              <option>Sling</option>
              <option>Handbag</option>
              <option>Accessories</option>
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 px-6 pb-20">
          {filteredProducts.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-luxury p-4 hover:shadow-xl transition-all duration-300 group relative"
            >
              {/* Wishlist Heart Icon - Top Right */}
              <button
                onClick={(e) => handleWishlistToggle(e, p)}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-all"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isInWishlist(p.id)
                      ? "fill-brand-primary stroke-brand-primary"
                      : "stroke-gray-800 fill-none"
                  }`}
                />
              </button>

              <Link href={`/product/${p.id}`}>
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    width={800}
                    height={800}
                    className="rounded-xl object-cover h-[300px] sm:h-[350px] md:h-[400px] w-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-display text-base md:text-lg text-brand-text group-hover:text-brand-primary transition-colors">
                    {p.name}
                  </h3>
                  {p.price != null && (
                    <p className="text-brand-accent font-medium text-sm md:text-base mt-1">
                      ₹{p.price}
                    </p>
                  )}
                </div>
              </Link>

              {/* Add to Cart Button */}
              <button
                onClick={(e) => handleAddToCart(e, p)}
                className="mt-3 w-full py-2 px-4 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 hover:scale-105"
              >
                Add to Cart
              </button>
            </motion.div>
          ))}
        </section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-6 mb-20 p-8 md:p-12 bg-gradient-to-br from-brand-hover-from to-brand-hover-to rounded-3xl shadow-luxury text-center"
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
          © 2025 Sangeet by Gitika
        </footer>
      </main>
    </>
  );
}
