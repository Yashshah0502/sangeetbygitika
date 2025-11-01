"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

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

    try {
      const productData = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        image_url: imageUrls[0], // First image for backwards compatibility
        image_urls: imageUrls, // All images as array
        is_available: true,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add product");
      }

      toast.success("Product added successfully!");
      setForm({ name: "", price: "", description: "", category: "" });
      setImageUrls([]);

      // Reload the page to show the new product
      window.location.href = "/admin/products";
    } catch (error: any) {
      console.error("Insert error:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setLoading(false);
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
