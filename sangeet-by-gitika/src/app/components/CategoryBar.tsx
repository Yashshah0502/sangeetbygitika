"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Category = {
  id: string;
  name: string;
  slug: string;
};

const FALLBACK_CATEGORIES: Category[] = [
  { id: "tote", name: "Tote", slug: "tote" },
  { id: "clutch", name: "Clutch", slug: "clutch" },
  { id: "potli", name: "Potli", slug: "potli" },
  { id: "sling", name: "Sling", slug: "sling" },
  { id: "handbag", name: "Handbag", slug: "handbag" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
];

export default function CategoryBar() {
  const [categories, setCategories] =
    useState<Category[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        if (isMounted && data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-brand-bg/30 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-2 min-w-[100px] group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all overflow-hidden border-2 border-transparent group-hover:border-brand-primary/30">
                <div className="w-full h-full bg-linear-to-br from-brand-hover-from to-brand-hover-to flex items-center justify-center">
                  <span className="text-2xl">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="text-sm md:text-base font-medium text-brand-text group-hover:text-brand-primary transition-colors text-center capitalize">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
