"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { X, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  special_price?: number | null;
  special_price_message?: string | null;
  stock_quantity: number;
  description: string;
  image_url: string;
  image_urls?: string[];
  is_available: boolean;
  created_at: string;
};

type Props = {
  product: Product;
  onClose: () => void;
  onUpdate: (updatedProduct: Product) => void;
};

const DEFAULT_CATEGORIES = [
  "Accessories",
  "Clutch",
  "Handbag",
  "Potli",
  "Sling",
  "Tote",
] as const;

export default function EditProductModal({ product, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    name: product.name,
    price: product.price.toString(),
    special_price: product.special_price?.toString() || "",
    special_price_message: product.special_price_message || "",
    description: product.description || "",
    category: product.category,
    stock: (product.stock_quantity || 0).toString(),
    is_available: product.is_available,
  });
  const [categoryOptions, setCategoryOptions] = useState<string[]>([...DEFAULT_CATEGORIES]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [imageUrls, setImageUrls] = useState<string[]>(
    product.image_urls || [product.image_url]
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Use useMemo to create supabase client only once
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      setIsLoadingCategories(true);
      try {
        const response = await fetch("/api/admin/categories");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch categories");
        }

        const names: string[] = Array.isArray(result.categories)
          ? result.categories
              .map((cat: { name?: string | null }) => cat?.name ?? null)
              .filter((name): name is string => typeof name === "string")
              .map((name) => name.trim())
              .filter((name) => name.length > 0)
          : [];

        if (isMounted) {
          if (names.length > 0) {
            const uniqueSorted = Array.from(new Set(names)).sort((a, b) =>
              a.localeCompare(b)
            );
            setCategoryOptions(uniqueSorted);
          } else {
            setCategoryOptions([...DEFAULT_CATEGORIES]);
          }
        }
      } catch (error: unknown) {
        console.error("Error loading categories:", error);
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : "Failed to load categories";
          toast.error(message);
          setCategoryOptions([...DEFAULT_CATEGORIES]);
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

  const categoryChoices = useMemo(() => {
    const names = new Set(categoryOptions);
    if (form.category) {
      names.add(form.category);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [categoryOptions, form.category]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        // Upload to Supabase
        const fileName = `product-images/${product.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, compressedFile);

        if (error) throw error;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      setUploading(false);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (error: unknown) {
      console.error("Error uploading images:", error);
      const message =
        error instanceof Error ? error.message : "Failed to upload images";
      toast.error(message);
      setUploading(false);
    }
  }

  function handleRemoveImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (imageUrls.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setSaving(true);

    try {
      const basePrice = Number(form.price);
      const specialPrice = form.special_price ? Number(form.special_price) : undefined;

      if (!Number.isFinite(basePrice) || basePrice <= 0) {
        throw new Error("Please enter a valid price.");
      }

      if (specialPrice != null && (!Number.isFinite(specialPrice) || specialPrice <= 0)) {
        throw new Error("Please enter a valid special price or leave it blank.");
      }

      if (specialPrice != null && specialPrice >= basePrice) {
        throw new Error("Special price must be lower than the regular price.");
      }

      // Build update data with all fields
      const updateData = {
        id: product.id,
        name: form.name,
        price: basePrice,
        image_url: imageUrls[0],
        category: form.category,
        description: form.description,
        stock_quantity: Number(form.stock),
        is_available: form.is_available,
        image_urls: imageUrls,
        special_price: specialPrice ?? null,
        special_price_message: form.special_price_message?.trim() || null,
      };

      // Update the product via API route
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      onUpdate(result.product);
      onClose();
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update product: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display text-brand-primary">
            Edit Product
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
              disabled={isLoadingCategories && categoryChoices.length === 0}
            >
              <option value="">Select category</option>
              {categoryChoices.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Price (₹)
                <span className="text-gray-400 text-xs ml-1">Optional</span>
              </label>
              <input
                type="number"
                value={form.special_price}
                onChange={(e) => setForm({ ...form, special_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Price Note
                <span className="text-gray-400 text-xs ml-1">Optional</span>
              </label>
              <input
                type="text"
                value={form.special_price_message}
                onChange={(e) =>
                  setForm({ ...form, special_price_message: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Limited time only"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              checked={form.is_available}
              onChange={(e) =>
                setForm({ ...form, is_available: e.target.checked })
              }
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
              Product is available for sale
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Product ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-brand-primary text-white text-xs rounded-full">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {uploading ? "Uploading..." : "Add More Images"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Upload up to 3 images. First image will be the primary display image.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || imageUrls.length === 0}
              className="px-6 py-2 rounded-lg bg-linear-to-r from-brand-primary to-brand-accent text-white hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
