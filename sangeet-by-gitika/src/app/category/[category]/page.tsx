"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import LoadingScreen from "@/app/components/LoadingScreen";
import Header from "@/app/components/Header";
import ProductCard from "@/app/components/ProductCard";

type Product = {
  id: string;
  name: string;
  price: number | null;
  special_price?: number | null;
  special_price_message?: string | null;
  image_url: string;
  image_urls?: string[];
  category: string;
  created_at: string;
  stock_quantity?: number;
};

type CategoryRecord = {
  name: string;
  slug: string;
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const categorySlug = decodeURIComponent(category);

  const [categoryDetails, setCategoryDetails] = useState<CategoryRecord | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchProducts() {
      setLoading(true);
      try {
        const { data: categoryRow, error: categoryError } = await supabase
          .from("categories")
          .select("name, slug")
          .eq("slug", categorySlug)
          .maybeSingle();

        if (categoryError) {
          console.error("Error fetching category:", categoryError);
        }

        if (isMounted) {
          setCategoryDetails(categoryRow ?? null);
        }

        const {
          data: allProducts,
          error: productsError,
        } = await supabase
          .from("products")
          .select(
            "id,name,price,special_price,special_price_message,image_url,image_urls,category,created_at,stock_quantity"
          )
          .eq("is_available", true);

        if (productsError) {
          throw productsError;
        }

        const normalizedTargets = Array.from(
          new Set(
            [
              categoryRow?.name,
              categoryRow?.slug,
              categorySlug,
              categorySlug.replace(/-/g, " "),
            ]
              .filter(Boolean)
              .map((value) => value!.trim().toLowerCase())
          )
        );

        const matchingProducts =
          allProducts?.filter((product) => {
            const productCategory = product.category?.trim().toLowerCase();
            return (
              !!productCategory && normalizedTargets.includes(productCategory)
            );
          }) ?? [];

        if (isMounted) {
          setProducts(matchingProducts);
        }
      } catch (error) {
        console.error("Error loading category products:", error);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  useEffect(() => {
    const sorted = [...products];
    const getEffectivePrice = (product: Product) =>
      product.special_price ?? product.price ?? 0;

    if (sortBy === "Price (Low → High)") {
      sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sortBy === "Price (High → Low)") {
      sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setDisplayProducts(sorted);
  }, [products, sortBy]);

  const categoryHeading = useMemo(() => {
    if (categoryDetails?.name) {
      return categoryDetails.name;
    }
    const formatted = categorySlug.replace(/-/g, " ").trim();
    if (!formatted) {
      return "Category";
    }
    return formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [categoryDetails?.name, categorySlug]);

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    const unitPrice = p.special_price ?? p.price;
    if (unitPrice) {
      addToCart({
        id: p.id,
        name: p.name,
        price: unitPrice,
        image_url: p.image_url,
        original_price:
          p.special_price != null && p.price != null && p.special_price < p.price
            ? p.price
            : undefined,
        special_price_message: p.special_price_message,
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const unitPrice = p.special_price ?? p.price;
    if (unitPrice) {
      addToWishlist({
        id: p.id,
        name: p.name,
        price: p.price ?? unitPrice,
        special_price: p.special_price,
        special_price_message: p.special_price_message,
        image_url: p.image_url,
        stock_quantity: p.stock_quantity,
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
            {categoryHeading}
          </h1>
          <p className="text-brand-text/70">
            {products.length} {products.length === 1 ? "product" : "products"} available
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
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8 px-3 md:px-6 pb-20">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <p className="text-brand-text/70">Loading products...</p>
            </div>
          ) : displayProducts.length === 0 ? (
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
            displayProducts.map((p, index) => {
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
