"use client";

import { useWishlist, type WishlistItem } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: WishlistItem) => {
    if (item.stock_quantity === 0) {
      return;
    }
    const unitPrice = item.special_price ?? item.price;
    // Add to cart
    addToCart({
      id: item.id,
      name: item.name,
      price: unitPrice,
      image_url: item.image_url,
      original_price:
        item.special_price != null && item.special_price < item.price
          ? item.price
          : undefined,
      special_price_message: item.special_price_message,
    });

    // Remove from wishlist
    removeFromWishlist(item.id);
  };

  const handleInquiry = (item: WishlistItem) => {
    const hasDiscount =
      item.special_price != null && item.special_price < item.price;
    const message = `Hi! I'm interested in ${item.name}${
      hasDiscount
        ? ` (Special price ₹${item.special_price}, original ₹${item.price})`
        : item.price
          ? ` (₹${item.price})`
          : ""
    }. When will it be back in stock?`;
    const whatsappLink = `https://wa.me/918440866772?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");
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
                <Link href={`/product/${item.id}`} className="flex-shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={120}
                    height={120}
                    className="rounded-xl object-cover w-24 h-24 md:w-32 md:h-32 hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-display text-lg md:text-xl text-brand-text hover:text-brand-accent transition-colors cursor-pointer">
                      {item.name}
                    </h3>
                  </Link>
                  {(() => {
                    const effectivePrice = item.special_price ?? item.price;
                    const showSpecial =
                      item.special_price != null && item.special_price < item.price;
                    return effectivePrice ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-brand-accent font-semibold text-xl">
                          ₹{effectivePrice}
                        </p>
                        {showSpecial && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm">
                            <span className="text-brand-text/50 line-through">
                              ₹{item.price}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium uppercase tracking-wide">
                              ✨ {item.special_price_message?.trim() || "Limited time only"}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* Add to Cart / Inquiry Button */}
                  {item.stock_quantity === 0 ? (
                    <button
                      onClick={() => handleInquiry(item)}
                      className="mt-3 w-full py-2 px-4 rounded-2xl transition-all bg-white border border-red-200 hover:border-red-300 hover:bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-base md:text-lg leading-none text-red-500">
                          
                        </span>
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                            SOLD OUT
                          </span>
                          <span className="text-[11px] md:text-xs text-gray-600 font-normal">
                            Ask about this product 💬
                          </span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="mt-3 px-6 py-2 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 hover:scale-105 transition-all text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                  )}
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
