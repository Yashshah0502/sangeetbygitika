"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Pencil, Trash2, X, Check, Upload, Eye, EyeOff, GripVertical, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  image_url: string;
  category_slug: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function HeroSlidesManagement() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<HeroSlide>>({});
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    category_slug: "",
    display_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchSlides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSlides(data || []);
    } catch (error: any) {
      console.error("Error fetching slides:", error);
      toast.error("Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
    fetchCategories();
  }, [fetchSlides, fetchCategories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("hero-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("hero-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleAddSlide = async () => {
    if (!newSlide.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      // Upload image first
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setUploading(false);
        return;
      }

      // Create slide record
      const { error } = await supabase.from("hero_slides").insert([
        {
          title: newSlide.title,
          subtitle: newSlide.subtitle || null,
          button_text: newSlide.button_text || null,
          image_url: imageUrl,
          category_slug: newSlide.category_slug || null,
          display_order: newSlide.display_order,
          is_active: newSlide.is_active,
        },
      ]);

      if (error) throw error;

      toast.success("Hero slide added successfully!");
      setNewSlide({
        title: "",
        subtitle: "",
        button_text: "",
        category_slug: "",
        display_order: 0,
        is_active: true,
      });
      setImageFile(null);
      setImagePreview(null);
      fetchSlides();
    } catch (error: any) {
      console.error("Error adding slide:", error);
      toast.error(`Failed to add slide: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSlide = async (id: string) => {
    if (!editForm.title?.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({
          title: editForm.title,
          subtitle: editForm.subtitle || null,
          button_text: editForm.button_text || null,
          category_slug: editForm.category_slug || null,
          display_order: editForm.display_order,
          is_active: editForm.is_active,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Slide updated successfully!");
      setEditingId(null);
      setEditForm({});
      fetchSlides();
    } catch (error: any) {
      console.error("Error updating slide:", error);
      toast.error(`Failed to update slide: ${error.message}`);
    }
  };

  const handleDeleteSlide = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("hero_slides")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Try to delete image from storage (optional - won't fail if image doesn't exist)
      try {
        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("hero-images").remove([fileName]);
        }
      } catch (storageError) {
        console.log("Could not delete image from storage:", storageError);
      }

      toast.success("Slide deleted successfully!");
      fetchSlides();
    } catch (error: any) {
      console.error("Error deleting slide:", error);
      toast.error(`Failed to delete slide: ${error.message}`);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .update({ is_active: !currentActive })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error toggling active:", error);
        toast.error(`Failed to update slide status: ${error.message || "Unknown error"}`);
        return;
      }

      toast.success(`Slide ${!currentActive ? "activated" : "deactivated"}`);
      fetchSlides();
    } catch (error: any) {
      console.error("Error toggling active:", error);
      toast.error(`Failed to update slide status: ${error.message || "Unknown error"}`);
    }
  };

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setEditForm(slide);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
        {/* <h1 className="text-3xl font-bold">Hero Slides Management</h1> */}
      </div>

      {/* Add New Slide Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Photos for the Slide</h2>
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slide Image *
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-accent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB. Recommended: 1920x1080px (16:9 aspect ratio).
                </p>
              </div>
              {imagePreview && (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={newSlide.title}
              onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
              placeholder="e.g., Statement Pieces"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle / Tagline
            </label>
            <input
              type="text"
              value={newSlide.subtitle}
              onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
              placeholder="e.g., Stunning clutches to complete your look"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          {/* Button Text & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={newSlide.button_text}
                onChange={(e) =>
                  setNewSlide({ ...newSlide, button_text: e.target.value })
                }
                placeholder="e.g., Explore Now"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linked Category
              </label>
              <select
                value={newSlide.category_slug}
                onChange={(e) =>
                  setNewSlide({ ...newSlide, category_slug: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="">No category (link to homepage)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={newSlide.display_order}
                onChange={(e) =>
                  setNewSlide({ ...newSlide, display_order: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSlide.is_active}
                  onChange={(e) =>
                    setNewSlide({ ...newSlide, is_active: e.target.checked })
                  }
                  className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (visible on homepage)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddSlide}
            disabled={uploading}
            className="w-full bg-brand-primary text-white py-3 px-6 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Add Hero Slide
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Existing Slides List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Existing Slides ({slides.length})
        </h2>

        {slides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hero slides yet. Add your first slide above!
          </p>
        ) : (
          <div className="space-y-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={`border rounded-lg p-4 ${
                  slide.is_active
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {editingId === slide.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title *</label>
                      <input
                        type="text"
                        value={editForm.title || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={editForm.subtitle || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={editForm.button_text || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, button_text: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category
                        </label>
                        <select
                          value={editForm.category_slug || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category_slug: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">No category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={editForm.display_order || 0}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              display_order: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.is_active || false}
                            onChange={(e) =>
                              setEditForm({ ...editForm, is_active: e.target.checked })
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateSlide(slide.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="hidden sm:flex items-center text-gray-400">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="relative w-full sm:w-32 h-32 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={slide.image_url}
                        alt={slide.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-semibold text-base sm:text-lg">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-gray-600 text-sm">{slide.subtitle}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {slide.button_text && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Button: {slide.button_text}
                          </span>
                        )}
                        {slide.category_slug && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Category: {slide.category_slug}
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Order: {slide.display_order}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => toggleActive(slide.id, slide.is_active)}
                        className={`flex-1 sm:flex-none p-2 rounded hover:bg-gray-200 ${
                          slide.is_active ? "text-green-600" : "text-gray-400"
                        }`}
                        title={slide.is_active ? "Deactivate" : "Activate"}
                      >
                        {slide.is_active ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(slide)}
                        className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.image_url)}
                        className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
