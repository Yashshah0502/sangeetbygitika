"use client";

import type { MouseEvent } from "react";

interface ProductButtonProps {
  isInStock: boolean;
  price: number | null | undefined;
  onAddToBag?: (event: MouseEvent<HTMLButtonElement>) => void;
  onAskAboutProduct?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function ProductButton({
  isInStock,
  price,
  onAddToBag,
  onAskAboutProduct,
  className = "",
}: ProductButtonProps) {
  if (isInStock) {
    return (
      <button
        onClick={onAddToBag}
        className={`w-full px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-medium bg-linear-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 hover:scale-105 transition-all ${className}`}
        aria-label={price ? `Add item priced at ₹${price} to your bag` : "Add to your bag"}
      >
        Add to Your Bag
      </button>
    );
  }

  return (
    <button
      onClick={onAskAboutProduct}
      className={`w-full px-6 py-2.5 md:py-3 rounded-full border border-red-400 bg-white/95 text-red-600 font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all ${className}`}
      aria-label="Product out of stock – ask about availability"
    >
      <span className="uppercase tracking-wide">Sold out</span>
      <span className="hidden sm:inline text-red-300 text-lg leading-none">•</span>
      <span className="hidden sm:inline text-gray-700 font-medium normal-case flex items-center gap-1">
        Ask About Restock <span className="text-base leading-none"></span>
      </span>
      {/* <span className="sm:hidden text-base leading-none">💬</span> */}
    </button>
  );
}
