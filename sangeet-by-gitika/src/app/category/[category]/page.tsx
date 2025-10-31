"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import LoadingScreen from "@/app/components/LoadingScreen";
import Header from "@/app/components/Header";
import ProductCard from "@/app/components/ProductCard";
import { use } from "react";

type Product = {
  id: string;
  name: string;
  price: number | null;
  image_url: string;
  image_urls?: string[];
  category: string;
  created_at: string;
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params);
  const category = decodeURIComponent(resolvedParams.category);

  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from("products")
        .select("id,name,price,image_url,image_urls,category,created_at")
        .eq("is_available", true)
        .ilike("category", category);

      let sortedProducts = data || [];

      // Sort
      if (sortBy === "Price (Low → High)") {
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortBy === "Price (High → Low)") {
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else {
        sortedProducts.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      setProducts(sortedProducts);
      setLoading(false);
    }
    fetchProducts();
  }, [category, sortBy]);

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
        {/* Category Header */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-block text-brand-primary hover:text-brand-accent underline text-sm mb-4 transition-colors"
          >
            ← Back to All Products
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-brand-primary mb-2 capitalize">
            {category}
          </h1>
          <p className="text-brand-text/70">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-end items-center border-b border-gray-100"
        >
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
          {loading ? (
            <div className="col-span-full text-center py-20">
              <p className="text-brand-text/70">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <div className="text-6xl mb-4">📦</div>
                <h3 className="font-display text-2xl text-brand-primary mb-2">
                  No products found
                </h3>
                <p className="text-brand-text/70 mb-6">
                  No products available in this category yet.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 hover:scale-105 transition-all"
                >
                  View All Products
                </Link>
              </motion.div>
            </div>
          ) : (
            products.map((p, index) => {
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
            })
          )}
        </section>
      </main>
    </>
  );
}
