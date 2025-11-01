"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  image_url: string;
  category_slug: string | null;
  display_order: number;
  is_active: boolean;
}

interface HeroCarouselProps {
  autoPlayInterval?: number;
}

export default function HeroCarousel({
  autoPlayInterval = 3000,
}: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Fetch slides from Supabase
  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching hero slides:", error);
          setSlides([]);
        } else {
          setSlides(data || []);
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isHovering || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval, isHovering]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  const goToPrevious = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gradient-to-br from-brand-bg to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[current];
  const slideLink = currentSlide.category_slug
    ? `/category/${currentSlide.category_slug}`
    : "/";

  return (
    <div
      className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-gradient-to-br from-brand-bg to-white"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Link href={slideLink} className="relative w-full h-full block group">
            {/* Image */}
            <Image
              src={currentSlide.image_url}
              alt={currentSlide.title}
              fill
              priority={current === 0}
              quality={90}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Text overlay */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 text-white"
            >
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 drop-shadow-lg">
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p className="font-body text-base md:text-lg lg:text-xl mb-4 md:mb-6 max-w-2xl drop-shadow-lg">
                  {currentSlide.subtitle}
                </p>
              )}
              {currentSlide.button_text && (
                <button className="px-6 md:px-8 py-2 md:py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-accent transition-all hover:scale-105 text-sm md:text-base">
                  {currentSlide.button_text}
                </button>
              )}
            </motion.div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={`transition-all ${
                index === current
                  ? "w-6 md:w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/75"
              } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <div className="absolute top-4 md:top-8 right-4 md:right-8 px-3 md:px-4 py-1.5 md:py-2 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-semibold">
        {current + 1} / {slides.length}
      </div>
    </div>
  );
}
