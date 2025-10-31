"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // If only one image, show it without navigation
  if (images.length === 1) {
    return (
      <div className="relative">
        <Image
          src={images[0]}
          alt="Product image"
          width={800}
          height={800}
          className="rounded-2xl object-cover w-full h-[400px] md:h-[500px]"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={images[currentIndex]}
              alt={`Product image ${currentIndex + 1}`}
              width={800}
              height={800}
              className="rounded-2xl object-cover w-full h-[400px] md:h-[500px]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 md:w-6 md:h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 md:w-6 md:h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Indicators */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all ${
                idx === currentIndex
                  ? "ring-2 ring-brand-primary scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                width={80}
                height={80}
                className="rounded-lg object-cover w-16 h-16 md:w-20 md:h-20"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
