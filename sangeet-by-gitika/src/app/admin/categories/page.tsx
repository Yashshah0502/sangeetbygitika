"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      setCategories(result.categories || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
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

    try {
      const slug = generateSlug(newCategoryName);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), slug }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add category");
      }

      toast.success("Category added successfully");
      setNewCategoryName("");
      setIsAdding(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    }
  }

  async function handleUpdateCategory(id: string) {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const slug = generateSlug(editName);
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName.trim(), slug }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update category");
      }

      toast.success("Category updated successfully");
      setEditingId(null);
      setEditName("");
      fetchCategories();
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category");
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category. It may be in use by products.");
    }
  }

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-display text-brand-primary mb-8">
              Loading Categories...
            </h1>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-display text-brand-primary mb-2">
              Manage Categories
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Add, edit, or remove product categories
            </p>
          </div>

          {/* Add New Category */}
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
            {isAdding ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-4 py-2.5 md:py-3 text-sm md:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:border-brand-primary transition"
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
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-all font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategoryName("");
                  }}
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Add New Category
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-display text-gray-800">
                All Categories ({categories.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                >
                  {editingId === category.id ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-4 py-2 text-sm md:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:border-brand-primary transition"
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
                        className="px-3 md:px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                        }}
                        className="px-3 md:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 break-all">
                          Slug: {category.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(category.id);
                            setEditName(category.name);
                          }}
                          className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                          className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
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
