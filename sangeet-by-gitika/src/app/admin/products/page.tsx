"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Edit,
  Trash2,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
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
  special_price?: number | null;
  special_price_message?: string | null;
  stock_quantity: number;
  image_url: string;
  image_urls?: string[];
  description: string;
  created_at: string;
  is_available: boolean;
};

type ProductPayload = {
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  is_available: boolean;
  special_price?: number | null;
  special_price_message?: string | null;
  image_urls?: string[];
  description?: string;
};

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "price">("newest");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const itemsPerPage = 10;
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products");
      const result = (await response.json()) as {
        products?: Product[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch products");
      }

      setProducts(Array.isArray(result.products) ? result.products : []);
    } catch (error: unknown) {
      console.error("Error fetching products:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch products";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered];
    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "price") {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [products, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = useMemo(
    () => filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
  );
  const resultsRangeStart =
    filteredProducts.length === 0 ? 0 : startIndex + 1;
  const resultsRangeEnd =
    filteredProducts.length === 0
      ? 0
      : Math.min(endIndex, filteredProducts.length);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete product");
      }

      // Update local state
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      toast.success("Product deleted successfully!");
    } catch (error: unknown) {
      console.error("Error deleting product:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete product: ${message}`);
    }
  }

  async function handleDuplicate(product: Product) {
    try {
      const insertData: ProductPayload = {
        name: `${product.name} (Copy)`,
        category: product.category,
        price: product.price,
        stock_quantity: product.stock_quantity || 0,
        image_url: product.image_url,
        is_available: product.is_available,
      };

      // Include optional fields if they exist
      if (product.special_price != null) {
        insertData.special_price = product.special_price;
        insertData.special_price_message =
          product.special_price_message ?? null;
      }
      if (product.image_urls) {
        insertData.image_urls = product.image_urls;
      }
      if (product.description) {
        insertData.description = product.description;
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(insertData),
      });

      const result = (await response.json()) as {
        product: Product;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Failed to duplicate product");
      }

      // Add to local state
      setProducts((prev) => [result.product, ...prev]);
      toast.success("Product duplicated successfully!");
    } catch (error: unknown) {
      console.error("Error duplicating product:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to duplicate product: ${message}`);
    }
  }

  // Pagination
  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-display text-brand-primary mb-8">
              Loading Products...
            </h1>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-brand-primary mb-2">
              Product Management
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage your inventory and product catalog
            </p>
          </div>
          <Link
            href="/admin"
            className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 transition-all font-medium text-sm md:text-base whitespace-nowrap"
          >
            + Add New Product
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
              <button
                onClick={() => setSortBy("newest")}
                className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  sortBy === "newest"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("price")}
                className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
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
          <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
            Showing {resultsRangeStart}-{resultsRangeEnd} of {filteredProducts.length} products
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">
                    Image
                  </th>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Date Added
                  </th>
                  <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">
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
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover w-12 h-12 md:w-15 md:h-15"
                      />
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      <div className="font-medium text-gray-800 text-sm">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {product.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r from-brand-hover-from to-brand-hover-to text-brand-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-brand-accent">
                          ₹
                          {product.special_price != null &&
                          product.special_price < product.price
                            ? product.special_price
                            : product.price}
                        </span>
                        {product.special_price != null &&
                          product.special_price < product.price && (
                            <>
                              <span className="text-xs text-gray-500 line-through">
                                ₹{product.price}
                              </span>
                              <span className="text-[10px] uppercase tracking-wide text-brand-primary">
                                {product.special_price_message?.trim() ||
                                  "Limited time only"}
                              </span>
                            </>
                          )}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                          (product.stock_quantity || 0) < 5
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {product.stock_quantity || 0}
                      </span>
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600 hidden lg:table-cell">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 md:p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-1.5 md:p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-1.5 md:p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
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

          {/* Mobile Card View - Visible only on Mobile */}
          <div className="md:hidden divide-y divide-gray-200">
            {currentProducts.map((product) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3 mb-3">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover w-20 h-20 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      ID: {product.id.slice(0, 8)}...
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-brand-hover-from to-brand-hover-to text-brand-primary">
                        {product.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (product.stock_quantity || 0) < 5
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        Stock: {product.stock_quantity || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-brand-accent text-lg">
                      ₹
                      {product.special_price != null &&
                      product.special_price < product.price
                        ? product.special_price
                        : product.price}
                    </span>
                    {product.special_price != null &&
                      product.special_price < product.price && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.price}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-brand-primary mt-1">
                            {product.special_price_message?.trim() ||
                              "Limited time only"}
                          </span>
                        </>
                      )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-3 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition-all ${
                        currentPage === page
                          ? "bg-brand-primary text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full">
              <h3 className="text-lg md:text-xl font-display text-gray-800 mb-3 md:mb-4">
                Confirm Delete
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all text-sm md:text-base"
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
