"use client";
import ProductForm from "./components/ProductForm";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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
    <main className="min-h-screen bg-sangeet-cream text-charcoal py-10">
      <h1 className="text-center text-3xl font-display text-sangeet-gold mb-6">
        Admin Dashboard
      </h1>
      <ProductForm />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 mt-10">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-luxury p-4 text-center">
            <img src={p.image_url} alt={p.name} className="rounded-xl w-full h-64 object-cover" />
            <h3 className="mt-2 font-display">{p.name}</h3>
            <p className="text-sangeet-gold font-medium">₹{p.price}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
