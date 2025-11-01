"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number | null;
  image_url: string;
  image_urls?: string[];
  category: string;
  stock_quantity?: number;
};

type ProductCardProps = {
  product: Product;
  index: number;
  isInWishlist: boolean;
  cartQuantity: number;
  onAddToCart: (e: React.MouseEvent) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onToggleWishlist: (e: React.MouseEvent) => void;
};

export default function ProductCard({
  product,
  index,
  isInWishlist,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get all available images
  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : [product.image_url];

  // WhatsApp inquiry for sold out items
  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `Hi! I'm interested in ${product.name}${product.price ? ` (₹${product.price})` : ''}. When will it be back in stock?`;
    const whatsappLink = `https://wa.me/918440866772?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  // Auto-slideshow on hover
  useEffect(() => {
    if (isHovering && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2500); // Change image every 2.5 seconds for smooth, elegant transitions
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentImageIndex(0); // Reset to first image when not hovering
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -8 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="bg-white/80 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-luxury p-2 md:p-4 hover:shadow-2xl transition-all duration-300 group relative"
    >
      {/* Wishlist Heart Icon - Top Right */}
      <button
        onClick={onToggleWishlist}
        className="absolute top-3 right-3 md:top-6 md:right-6 z-10 p-1.5 md:p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-all"
      >
        <Heart
          className={`w-4 h-4 md:w-5 md:h-5 transition-all ${
            isInWishlist
              ? "fill-brand-primary stroke-brand-primary"
              : "stroke-gray-800 fill-none"
          }`}
        />
      </button>

      {/* Image indicators for multiple images */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10 flex gap-1">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ${
                idx === currentImageIndex
                  ? "bg-brand-primary w-3 md:w-4"
                  : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg md:rounded-xl">
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            width={800}
            height={800}
            className="rounded-lg md:rounded-xl object-cover h-[120px] sm:h-[200px] md:h-[300px] lg:h-[400px] w-full group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="mt-2 md:mt-3 text-center">
          <h3 className="font-display text-xs sm:text-sm md:text-base lg:text-lg text-brand-text group-hover:text-brand-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.price != null && (
            <p className="text-brand-accent font-medium text-xs sm:text-sm md:text-base mt-0.5 md:mt-1">
              ₹{product.price}
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart / Quantity Controls */}
      {product.stock_quantity === 0 ? (
        <button
          onClick={handleInquiry}
          className="mt-2 md:mt-3 w-full py-1.5 md:py-2 px-2 md:px-4 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 text-gray-800 hover:from-red-100 hover:to-red-200 hover:scale-105 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            <span className="text-red-600 font-bold text-[10px] sm:text-xs">OUT OF STOCK</span>
            <span className="text-red-400 hidden sm:inline">•</span>
            <span className="text-gray-700 text-[10px] sm:text-xs">Ask About Product 💬</span>
          </div>
        </button>
      ) : cartQuantity === 0 ? (
        <button
          onClick={onAddToCart}
          className="mt-2 md:mt-3 w-full py-1.5 md:py-2 px-2 md:px-4 rounded-full text-xs md:text-sm font-medium transition-all bg-linear-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 hover:scale-105"
        >
          Add to  Your Bag
        </button>
      ) : (
        <div className="mt-2 md:mt-3 flex items-center justify-center gap-2 md:gap-3 bg-white/60 backdrop-blur-sm rounded-full p-1 md:p-2 border-2 border-brand-primary">
          <button
            onClick={(e) => {
              e.preventDefault();
              onUpdateQuantity(product.id, cartQuantity - 1);
            }}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center justify-center text-xs md:text-base"
          >
            −
          </button>
          <span className="font-medium text-brand-text min-w-[1.5rem] md:min-w-[2rem] text-center text-xs md:text-base">
            {cartQuantity}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onUpdateQuantity(product.id, cartQuantity + 1);
            }}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center justify-center text-xs md:text-base"
          >
            +
          </button>
        </div>
      )}
    </motion.div>
  );
}
