"use client";

import Link from "next/link";
import Image from "next/image";

export default function CategoryBar() {
  const categories = [
    { name: "Tote Bags", image: "/categories/tote.jpg", href: "/" },
    { name: "Clutches", image: "/categories/clutch.jpg", href: "/" },
    { name: "Potlis", image: "/categories/potli.jpg", href: "/" },
    { name: "Wallets", image: "/categories/wallet.jpg", href: "/" },
    { name: "Trending", image: "/categories/trending.jpg", href: "/" },
    { name: "New Arrivals", image: "/categories/new.jpg", href: "/" },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-brand-bg/30 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="flex flex-col items-center gap-2 min-w-[100px] group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all overflow-hidden border-2 border-transparent group-hover:border-brand-primary/30">
                {/* Placeholder circle - replace with actual images when available */}
                <div className="w-full h-full bg-linear-to-br from-brand-hover-from to-brand-hover-to flex items-center justify-center">
                  <span className="text-2xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
              </div>
              <span className="text-sm md:text-base font-medium text-brand-text group-hover:text-brand-primary transition-colors text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
