"use client";
import ProductForm from "./components/ProductForm";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import AuthCheck from "./components/AuthCheck";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  special_price?: number | null;
  special_price_message?: string | null;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,special_price,special_price_message,image_url")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    setProducts(data || []);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <AuthCheck>
      <main className="min-h-screen bg-sangeet-cream text-charcoal py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8">
        <h1 className="text-center text-2xl md:text-3xl lg:text-4xl font-display text-sangeet-gold mb-6 md:mb-8">
          Add New Product
        </h1>
        <ProductForm />
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10 lg:mt-12">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-luxury p-4 md:p-6 text-center">
              <Image
                src={p.image_url}
                alt={p.name}
                width={400}
                height={256}
                className="rounded-xl w-full h-48 sm:h-56 md:h-64 object-cover"
              />
              <h3 className="mt-3 md:mt-4 font-display text-base md:text-lg">{p.name}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sangeet-gold font-semibold text-sm md:text-base">
                  ₹{p.special_price != null && p.special_price < p.price ? p.special_price : p.price}
                </p>
                {p.special_price != null && p.special_price < p.price && (
                  <>
                    <p className="text-xs text-gray-500 line-through">₹{p.price}</p>
                    <p className="text-[10px] uppercase tracking-wide text-brand-primary">
                      {p.special_price_message?.trim() || "Limited time only"}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>
    </AuthCheck>
  );
}
