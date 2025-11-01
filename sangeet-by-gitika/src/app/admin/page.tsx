"use client";
import ProductForm from "./components/ProductForm";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import AuthCheck from "./components/AuthCheck";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("id,name,price,image_url")
      .order("created_at", { ascending: false });
    setProducts(data || []);
  }

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
              <img src={p.image_url} alt={p.name} className="rounded-xl w-full h-48 sm:h-56 md:h-64 object-cover" />
              <h3 className="mt-3 md:mt-4 font-display text-base md:text-lg">{p.name}</h3>
              <p className="text-sangeet-gold font-medium text-sm md:text-base mt-2">₹{p.price}</p>
            </div>
          ))}
        </section>
      </main>
    </AuthCheck>
  );
}
