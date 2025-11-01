"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import ImageCarousel from "./ImageCarousel";

type Product = {
  id: string;
  name: string;
  price: number;
  special_price?: number | null;
  special_price_message?: string | null;
  image_url: string;
  image_urls?: string[];
  description?: string;
  category?: string;
  stock_quantity?: number;
};

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, cartItems } = useCart();

  const isInCart = cartItems.find((item) => item.id === product.id);
  const effectivePrice =
    product.special_price != null ? product.special_price : product.price;
  const showSpecialPrice =
    product.special_price != null && product.special_price < product.price;

  const handleAddToCart = () => {
    if (effectivePrice) {
      addToCart({
        id: product.id,
        name: product.name,
        price: effectivePrice,
        image_url: product.image_url,
        original_price: showSpecialPrice ? product.price : undefined,
        special_price_message: product.special_price_message,
      });
    }
  };

  // Use image_urls array if available, otherwise fallback to single image_url
  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : [product.image_url];

  const isSoldOut = product.stock_quantity === 0;
  const priceSnippet = showSpecialPrice
    ? `(Special price ₹${product.special_price}, original ₹${product.price})`
    : `(₹${product.price})`;

  const whatsappMessage = isSoldOut
    ? `Hi! I'm interested in ${product.name} ${priceSnippet}. When will it be back in stock?`
    : `Hi! I'm interested in ${product.name} ${priceSnippet}. Is it available?`;
  const whatsappLink = `https://wa.me/918440866772?text=${encodeURIComponent(whatsappMessage)}`;

  const instagramMessage = isSoldOut
    ? `Hi! I'm interested in ${product.name} ${priceSnippet}. When will it be back in stock?`
    : `Hi! I'm interested in ${product.name} ${priceSnippet}. Is it available?`;

  const handleInstagramMessage = async () => {
    try {
      await navigator.clipboard.writeText(instagramMessage);
      alert("Message copied to clipboard! Opening Instagram...");
      window.open("https://ig.me/m/sangeetbygitika", "_blank");
    } catch (err) {
      alert("Please copy this message and send it on Instagram:\n\n" + instagramMessage);
      window.open("https://ig.me/m/sangeetbygitika", "_blank");
    }
  };

  return (
    <main className="min-h-screen text-brand-text px-6 py-12">
      <Link
        href="/"
        className="inline-block text-brand-primary hover:text-brand-accent underline text-sm mb-6 transition-colors"
      >
        ← Back to Catalog
      </Link>
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-luxury p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images Carousel */}
          <ImageCarousel images={images} />

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-3xl md:text-4xl text-brand-text">
              {product.name}
            </h1>
            <div className="mt-3 space-y-2">
              <p className="text-2xl md:text-3xl text-brand-accent font-semibold">
                ₹{effectivePrice}
              </p>
              {showSpecialPrice && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg text-brand-text/50 line-through">
                    ₹{product.price}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium uppercase tracking-wide">
                    ✨ {product.special_price_message?.trim() || "Limited time only"}
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            {isSoldOut && (
              <div className="mt-4 inline-block">
                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  SOLD OUT
                </span>
              </div>
            )}

            <p className="text-brand-text/70 mt-6 leading-relaxed text-sm md:text-base">
              {product.description || "Beautiful handcrafted accessory perfect for any occasion."}
            </p>

            {/* Add to Bag Button or Inquiry Buttons */}
            {isSoldOut ? (
              // Sold Out - Show inquiry buttons
              <div className="mt-6 space-y-3">
                <p className="text-center text-gray-600 text-sm font-medium">
                  This item is currently sold out. Contact us for availability:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-brand-primary to-brand-accent text-white px-6 py-3 rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-md"
                  >
                    <span className="text-xl">💬</span>
                    <span className="font-medium">Ask on WhatsApp</span>
                  </a>
                  <button
                    onClick={handleInstagramMessage}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary px-6 py-3 rounded-full hover:bg-brand-primary hover:text-white hover:scale-105 transition-all shadow-md"
                  >
                    <span className="text-xl">📸</span>
                    <span className="font-medium">Ask on Instagram</span>
                  </button>
                </div>
              </div>
            ) : (
              // In Stock - Show Add to Bag and Order buttons
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={!!isInCart}
                  className={`mt-6 w-full py-3 px-6 rounded-full font-medium transition-all ${
                    isInCart
                      ? "bg-brand-primary/20 text-brand-primary cursor-not-allowed"
                      : "bg-linear-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 hover:scale-105"
                  }`}
                >
                  {isInCart ? "🛍 Added to Bag" : "Add to Bag 🛍"}
                </button>

                {/* Order Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-linear-to-r from-brand-primary to-brand-accent text-white px-6 py-3 rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-md"
                  >
                    <span className="text-xl">🛍</span>
                    <span className="font-medium">Order via WhatsApp</span>
                  </a>
                  <button
                    onClick={handleInstagramMessage}
                    className="flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary px-6 py-3 rounded-full hover:bg-brand-primary hover:text-white hover:scale-105 transition-all shadow-md"
                  >
                    <span className="text-xl">📸</span>
                    <span className="font-medium">Message on Instagram</span>
                  </button>
                </div>
              </>
            )}

            {/* Product Details */}
            {product.category && (
              <div className="mt-8 p-4 bg-linear-to-br from-brand-hover-from/50 to-brand-hover-to/50 rounded-xl">
                <p className="text-sm text-brand-text/70">
                  <span className="font-medium text-brand-text">Category:</span>{" "}
                  <span className="capitalize">{product.category}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
