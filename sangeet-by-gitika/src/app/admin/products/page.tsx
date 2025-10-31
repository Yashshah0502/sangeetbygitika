"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Package,
  Edit,
  Trash2,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import EditProductModal from "../components/EditProductModal";
import AuthCheck from "../components/AuthCheck";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  image_urls?: string[];
  description: string;
  created_at: string;
  is_available: boolean;
};

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "price">("newest");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, sortBy]);

  async function fetchProducts() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  }

  function filterAndSortProducts() {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "price") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter/sort change
  }

  async function handleDelete(id: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        toast.error(`Failed to delete product: ${error.message}`);
        return;
      }

      // Update local state
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      toast.success("Product deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(`Failed to delete product: ${error?.message || "Unknown error"}`);
    }
  }

  async function handleDuplicate(product: Product) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const insertData: any = {
        name: `${product.name} (Copy)`,
        category: product.category,
        price: product.price,
        stock_quantity: product.stock_quantity || 0,
        image_url: product.image_url,
        is_available: product.is_available,
      };

      // Include optional fields if they exist
      if (product.image_urls) {
        insertData.image_urls = product.image_urls;
      }
      if (product.description) {
        insertData.description = product.description;
      }

      const { data, error } = await supabase
        .from("products")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        toast.error(`Failed to duplicate product: ${error.message}`);
        return;
      }

      // Add to local state
      setProducts((prev) => [data, ...prev]);
      toast.success("Product duplicated successfully!");
    } catch (error: any) {
      console.error("Error duplicating product:", error);
      toast.error(`Failed to duplicate product: ${error?.message || "Unknown error"}`);
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-display text-brand-primary mb-8">
              Loading Products...
            </h1>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display text-brand-primary mb-2">
              Product Management
            </h1>
            <p className="text-gray-600">
              Manage your inventory and product catalog
            </p>
          </div>
          <Link
            href="/admin"
            className="px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 transition-all font-medium"
          >
            + Add New Product
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "newest"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("price")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "price"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Price
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Image
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Date Added
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover w-15 h-15"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {product.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r from-brand-hover-from to-brand-hover-to text-brand-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-brand-accent">
                      ₹{product.price}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (product.stock_quantity || 0) < 5
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {product.stock_quantity || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? "bg-brand-primary text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-display text-gray-800 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onUpdate={(updatedProduct) => {
              setProducts((prev) =>
                prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
              );
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
    </AuthCheck>
  );
}
