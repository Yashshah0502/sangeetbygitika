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
  stock_quantity: number;
  description: string;
  image_url: string;
  image_urls?: string[];
  is_available: boolean;
};

type Props = {
  product: Product;
  onClose: () => void;
  onUpdate: (updatedProduct: Product) => void;
};

export default function EditProductModal({ product, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    name: product.name,
    price: product.price.toString(),
    description: product.description || "",
    category: product.category,
    stock: (product.stock_quantity || 0).toString(),
    is_available: product.is_available,
  });

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
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
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
      // Build update data with all fields
      const updateData: any = {
        name: form.name,
        price: Number(form.price),
        image_url: imageUrls[0],
        category: form.category,
        description: form.description,
        stock_quantity: Number(form.stock),
        is_available: form.is_available,
        image_urls: imageUrls,
      };

      // Update the product in Supabase
      const { data: updateResult, error: updateError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", product.id)
        .select();

      if (updateError) {
        console.error("Error updating product:", updateError);
        toast.error(`Failed to update product: ${updateError.message}`);
        return;
      }

      // Use the updated result directly if available
      if (updateResult && updateResult.length > 0) {
        toast.success("Product updated successfully!");
        onUpdate(updateResult[0]);
        onClose();
        return;
      }

      // Fallback: fetch the updated product if update didn't return data
      const { data: updatedProduct, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .single();

      if (fetchError || !updatedProduct) {
        // If fetch fails, use local data
        const localUpdatedProduct = {
          ...product,
          ...updateData,
        };
        toast.success("Product updated successfully!");
        onUpdate(localUpdatedProduct);
        onClose();
        return;
      }

      toast.success("Product updated successfully!");
      onUpdate(updatedProduct);
      onClose();
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(`Failed to update product: ${error?.message || "Unknown error"}`);
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
            >
              <option value="">Select category</option>
              <option value="Tote">Tote</option>
              <option value="Clutch">Clutch</option>
              <option value="Potli">Potli</option>
              <option value="Sling">Sling</option>
              <option value="Handbag">Handbag</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
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
