"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import AuthCheck from "../components/AuthCheck";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const slug = generateSlug(newCategoryName);
    const { error } = await supabase
      .from("categories")
      .insert([{ name: newCategoryName.trim(), slug }]);

    if (error) {
      console.error("Error adding category:", error);
      if (error.code === "23505") {
        toast.error("Category already exists");
      } else if (error.code === "42501" || error.message?.includes("permission")) {
        toast.error("Permission denied. Please check RLS policies or authentication.");
      } else {
        toast.error(`Failed to add category: ${error.message || 'Unknown error'}`);
      }
    } else {
      toast.success("Category added successfully");
      setNewCategoryName("");
      setIsAdding(false);
      fetchCategories();
    }
  }

  async function handleUpdateCategory(id: string) {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const slug = generateSlug(editName);
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim(), slug })
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      if (error.code === "23505") {
        toast.error("Category name already exists");
      } else {
        toast.error("Failed to update category");
      }
    } else {
      toast.success("Category updated successfully");
      setEditingId(null);
      setEditName("");
      fetchCategories();
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. It may be in use by products.");
    } else {
      toast.success("Category deleted successfully");
      fetchCategories();
    }
  }

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-display text-brand-primary mb-8">
              Loading Categories...
            </h1>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display text-brand-primary mb-2">
              Manage Categories
            </h1>
            <p className="text-gray-600">
              Add, edit, or remove product categories
            </p>
          </div>

          {/* Add New Category */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {isAdding ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-brand-primary transition"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCategory();
                    if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewCategoryName("");
                    }
                  }}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-all font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategoryName("");
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Category
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-display text-gray-800">
                All Categories ({categories.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  {editingId === category.id ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-brand-primary transition"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateCategory(category.id);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditName("");
                          }
                        }}
                      />
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Slug: {category.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(category.id);
                            setEditName(category.name);
                          }}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
