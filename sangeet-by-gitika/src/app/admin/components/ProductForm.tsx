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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Store the first image in image_url for backwards compatibility
    // Store all images in image_urls array
    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        image_url: imageUrls[0], // First image for backwards compatibility
        image_urls: imageUrls, // All images as array
        is_available: true,
      },
    ]);

    setLoading(false);
    if (error) {
      console.error("Insert error:", error);
      alert(error.message);
    } else {
      alert("Product added successfully!");
      setForm({ name: "", price: "", description: "", category: "" });
      setImageUrls([]);
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
        placeholder="Category (e.g., Tote, Clutch, Potli, Sling, Handbag, Accessories)"
        className="border p-2 rounded"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      />

      <ImageUploader onUpload={(urls) => setImageUrls(urls)} />

      <button
        type="submit"
        disabled={imageUrls.length === 0 || loading}
        className="bg-brand-primary text-white py-2 rounded hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
