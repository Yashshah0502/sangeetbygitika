"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Package, Eye, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import Link from "next/link";
import AuthCheck from "../components/AuthCheck";

type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  totalViews: number;
  mostViewedProduct: string | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    totalViews: 0,
    mostViewedProduct: null,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Fetch all products
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (products) {
        const totalProducts = products.length;
        const activeProducts = products.filter((p) => p.is_available).length;
        const lowStock = products.filter((p) => (p.stock_quantity || 0) < 5).length;

        setStats({
          totalProducts,
          activeProducts,
          lowStock,
          totalViews: 0,
          mostViewedProduct: null,
        });

        setRecentProducts(products.slice(0, 5));
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    href,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    href?: string;
  }) => {
    const content = (
      <div
        className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 ${color}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          </div>
          <div className={`p-3 rounded-full bg-linear-to-br ${color.replace("border", "from")}-100 to-brand-hover-to`}>
            <Icon className="w-6 h-6 text-brand-primary" />
          </div>
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-display text-brand-primary mb-8">
              Loading Dashboard...
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your store overview
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-brand-primary text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 transition-all font-medium"
            >
              + Add New Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="border-blue-500"
            href="/admin/products"
          />
          <StatCard
            title="Active Products"
            value={stats.activeProducts}
            icon={TrendingUp}
            color="border-green-500"
          />
          <StatCard
            title="Low Stock Alert"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="border-orange-500"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={Eye}
            color="border-purple-500"
            href="/admin/analytics"
          />
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display text-gray-800">
              Recent Products
            </h2>
            <Link
              href="/admin/products"
              className="text-brand-primary hover:text-brand-accent text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-accent">₹{product.price}</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (product.stock_quantity || 0) < 5
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      Stock: {product.stock_quantity || 0}
                    </span>
                    <p className="text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AuthCheck>
  );
}
