"use client";

import { useEffect, useMemo, useState } from "react";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

const DEFAULT_CATEGORIES = [
  "Accessories",
  "Clutch",
  "Handbag",
  "Potli",
  "Sling",
  "Tote",
] as const;

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductForm() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    special_price: "",
    special_price_message: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      setIsLoadingCategories(true);
      try {
        const response = await fetch("/api/admin/categories");
        const result = (await response.json()) as {
          categories?: CategoryOption[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load categories");
        }

        if (isMounted && Array.isArray(result.categories)) {
          setCategories(result.categories);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    if (categories.length === 0) {
      return [...DEFAULT_CATEGORIES];
    }

    return categories
      .map((category) => category.name.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const basePrice = Number(form.price);
      const specialPrice = form.special_price
        ? Number(form.special_price)
        : undefined;

      if (!Number.isFinite(basePrice) || basePrice <= 0) {
        throw new Error("Please enter a valid price.");
      }

      if (
        specialPrice != null &&
        (!Number.isFinite(specialPrice) || specialPrice <= 0)
      ) {
        throw new Error("Please enter a valid special price or leave it blank.");
      }

      if (specialPrice != null && specialPrice >= basePrice) {
        throw new Error("Special price must be lower than the regular price.");
      }

      if (!form.category.trim()) {
        throw new Error("Please select a category.");
      }

      const productData = {
        name: form.name.trim(),
        price: basePrice,
        description: form.description.trim(),
        category: form.category.trim(),
        image_url: imageUrls[0], // First image for backwards compatibility
        image_urls: imageUrls, // All images as array
        is_available: true,
        special_price: specialPrice,
        special_price_message: form.special_price_message?.trim() || null,
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
      setForm({
        name: "",
        price: "",
        description: "",
        category: "",
        special_price: "",
        special_price_message: "",
      });
      setImageUrls([]);

      // Reload the page to show the new product
      window.location.href = "/admin/products";
    } catch (error: unknown) {
      console.error("Insert error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to add product";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-luxury max-w-md mx-auto"
    >
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
        min="0"
      />
      <input
        type="number"
        placeholder="Special Price (₹) — optional"
        className="border p-2 rounded"
        value={form.special_price}
        onChange={(e) => setForm({ ...form, special_price: e.target.value })}
        min="0"
      />
      <input
        type="text"
        placeholder="Special Price Note (e.g., Limited time only)"
        className="border p-2 rounded"
        value={form.special_price_message}
        onChange={(e) =>
          setForm({ ...form, special_price_message: e.target.value })
        }
      />
      <textarea
        placeholder="Description"
        className="border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="border p-2 rounded bg-white"
        required
      >
        <option value="">Select category</option>
        {categoryOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {isLoadingCategories && (
        <p className="text-xs text-gray-500">Loading categories…</p>
      )}

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
