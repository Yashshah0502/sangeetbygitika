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
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-luxury p-4 hover:shadow-2xl transition-all duration-300 group relative"
    >
      {/* Wishlist Heart Icon - Top Right */}
      <button
        onClick={onToggleWishlist}
        className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-all"
      >
        <Heart
          className={`w-5 h-5 transition-all ${
            isInWishlist
              ? "fill-brand-primary stroke-brand-primary"
              : "stroke-gray-800 fill-none"
          }`}
        />
      </button>

      {/* Image indicators for multiple images */}
      {images.length > 1 && (
        <div className="absolute top-6 left-6 z-10 flex gap-1">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentImageIndex
                  ? "bg-brand-primary w-4"
                  : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-xl">
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            width={800}
            height={800}
            className="rounded-xl object-cover h-[300px] sm:h-[350px] md:h-[400px] w-full group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="mt-3 text-center">
          <h3 className="font-display text-base md:text-lg text-brand-text group-hover:text-brand-primary transition-colors">
            {product.name}
          </h3>
          {product.price != null && (
            <p className="text-brand-accent font-medium text-sm md:text-base mt-1">
              ₹{product.price}
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart / Quantity Controls */}
      {cartQuantity === 0 ? (
        <button
          onClick={onAddToCart}
          className="mt-3 w-full py-2 px-4 rounded-full text-sm font-medium transition-all bg-linear-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 hover:scale-105"
        >
          Add to Wishlist
        </button>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm rounded-full p-2 border-2 border-brand-primary">
          <button
            onClick={(e) => {
              e.preventDefault();
              onUpdateQuantity(product.id, cartQuantity - 1);
            }}
            className="w-8 h-8 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center justify-center"
          >
            −
          </button>
          <span className="font-medium text-brand-text min-w-[2rem] text-center">
            {cartQuantity}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onUpdateQuantity(product.id, cartQuantity + 1);
            }}
            className="w-8 h-8 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
      )}
    </motion.div>
  );
}
