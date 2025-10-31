"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    // Add to cart
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });

    // Remove from wishlist
    removeFromWishlist(item.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen text-brand-text px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl text-brand-primary mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-brand-text/70 mb-8">
              Add some beautiful pieces to your wishlist!
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 hover:scale-105 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen text-brand-text px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-brand-primary">
              Your Wishlist 💕
            </h1>
            <Link
              href="/"
              className="text-brand-accent hover:text-brand-primary underline text-sm transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Wishlist Items */}
          <div className="space-y-4 mb-8">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-luxury"
              >
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="rounded-xl object-cover w-24 h-24 md:w-32 md:h-32"
                />
                <div className="flex-1">
                  <h3 className="font-display text-lg md:text-xl text-brand-text">
                    {item.name}
                  </h3>
                  <p className="text-brand-accent font-medium text-xl mt-2">
                    ₹{item.price}
                  </p>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-3 px-6 py-2 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 hover:scale-105 transition-all text-sm font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors text-2xl self-start"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>

          {/* Clear Wishlist */}
          <div className="text-center">
            <button
              onClick={clearWishlist}
              className="text-brand-text/50 hover:text-red-500 text-sm transition-colors"
            >
              Clear Wishlist
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
