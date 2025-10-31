"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import ImageCarousel from "./ImageCarousel";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image_urls?: string[];
  description?: string;
  category?: string;
};

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, cartItems } = useCart();

  const isInCart = cartItems.find((item) => item.id === product.id);

  const handleAddToCart = () => {
    if (product.price) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
    }
  };

  // Use image_urls array if available, otherwise fallback to single image_url
  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : [product.image_url];

  const whatsappMessage = `Hi! I'm interested in ${product.name} (₹${product.price}). Is it available?`;
  const whatsappLink = `https://wa.me/4809522965?text=${encodeURIComponent(whatsappMessage)}`;

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
            <p className="text-2xl md:text-3xl text-brand-accent font-medium mt-3">
              ₹{product.price}
            </p>
            <p className="text-brand-text/70 mt-6 leading-relaxed text-sm md:text-base">
              {product.description || "Beautiful handcrafted accessory perfect for any occasion."}
            </p>

            {/* Add to Wishlist Button */}
            <button
              onClick={handleAddToCart}
              disabled={!!isInCart}
              className={`mt-6 w-full py-3 px-6 rounded-full font-medium transition-all ${
                isInCart
                  ? "bg-brand-primary/20 text-brand-primary cursor-not-allowed"
                  : "bg-linear-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 hover:scale-105"
              }`}
            >
              {isInCart ? "💕 Added to Wishlist" : "Add to Wishlist 💕"}
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
              <a
                href="https://instagram.com/sangeetbygitika"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary px-6 py-3 rounded-full hover:bg-brand-primary hover:text-white hover:scale-105 transition-all shadow-md"
              >
                <span className="text-xl">📸</span>
                <span className="font-medium">View on Instagram</span>
              </a>
            </div>

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
