"use client";

import { useWishlist, type WishlistItem } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";
import ProductButton from "../components/ProductButton";

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
            {wishlistItems.map((item, index) => {
              const effectivePrice = item.special_price ?? item.price;
              const showSpecial =
                item.special_price != null && item.special_price < item.price;

              return (
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
                  {effectivePrice ? (
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
                  ) : null}

                  {/* Add to Cart / Inquiry Button */}
                  {item.stock_quantity === 0 ? (
                    <ProductButton
                      isInStock={false}
                      price={effectivePrice}
                      onAskAboutProduct={(e) => {
                        e.preventDefault();
                        handleInquiry(item);
                      }}
                      className="mt-3"
                    />
                  ) : (
                    <ProductButton
                      isInStock
                      price={effectivePrice}
                      onAddToBag={(e) => {
                        e.preventDefault();
                        handleAddToCart(item);
                      }}
                      className="mt-3"
                    />
                  )}
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors text-2xl self-start"
                >
                  ×
                </button>
              </motion.div>
              );
            })}
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
