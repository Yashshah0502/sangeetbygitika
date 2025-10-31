"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";

export default function ProductForm() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        image_url: imageUrl,
        is_available: true,
      },
    ]);

    setLoading(false);
    if (error) alert(error.message);
    else {
      alert("Product added successfully!");
      setForm({ name: "", price: "", description: "", category: "" });
      setImageUrl("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-luxury max-w-md mx-auto">
      <input
        type="text"
        placeholder="Product Name"
        className="border p-2 rounded"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Price (₹)"
        className="border p-2 rounded"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        className="border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Category"
        className="border p-2 rounded"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      />

      <ImageUploader onUpload={(url) => setImageUrl(url)} />

      <button
        type="submit"
        disabled={!imageUrl || loading}
        className="bg-sangeet-gold text-white py-2 rounded hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
