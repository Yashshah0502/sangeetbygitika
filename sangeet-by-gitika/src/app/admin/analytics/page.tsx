"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Eye, Package } from "lucide-react";
import Link from "next/link";
import AuthCheck from "../components/AuthCheck";

type AnalyticsData = {
  dailyViews: { date: string; views: number }[];
  topProducts: { name: string; views: number }[];
  categoryStats: { category: string; count: number }[];
  totalViews: number;
  avgViewsPerProduct: number;
};

const COLORS = ["#D4AF37", "#C4961A", "#FFD700", "#B8860B", "#DAA520"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyViews: [],
    topProducts: [],
    categoryStats: [],
    totalViews: 0,
    avgViewsPerProduct: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (products) {
        // Generate mock daily views data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            views: Math.floor(Math.random() * 100) + 50, // Mock data
          };
        });

        // Top 5 viewed products (using random views for now)
        const topProducts = products
          .slice(0, 5)
          .map((p) => ({
            name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
            views: Math.floor(Math.random() * 200) + 50, // Mock data
          }))
          .sort((a, b) => b.views - a.views);

        // Category-wise product count
        const categoryCount: { [key: string]: number } = {};
        products.forEach((p) => {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });

        const categoryStats = Object.entries(categoryCount).map(
          ([category, count]) => ({
            category,
            count,
          })
        );

        const totalViews = topProducts.reduce((sum, p) => sum + p.views, 0);
        const avgViewsPerProduct = Math.floor(totalViews / products.length);

        setAnalytics({
          dailyViews: last7Days,
          topProducts,
          categoryStats,
          totalViews,
          avgViewsPerProduct,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  function exportToCSV() {
    // Prepare CSV content
    let csv = "Analytics Report\n\n";

    csv += "Daily Views (Last 7 Days)\n";
    csv += "Date,Views\n";
    analytics.dailyViews.forEach((day) => {
      csv += `${day.date},${day.views}\n`;
    });

    csv += "\nTop Products\n";
    csv += "Product Name,Views\n";
    analytics.topProducts.forEach((product) => {
      csv += `${product.name},${product.views}\n`;
    });

    csv += "\nCategory Distribution\n";
    csv += "Category,Product Count\n";
    analytics.categoryStats.forEach((cat) => {
      csv += `${cat.category},${cat.count}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-linear-to-br from-brand-bg to-white p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-display text-brand-primary mb-6 md:mb-8">
              Loading Analytics...
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
              Analytics Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Insights into your store performance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-brand-primary text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all font-medium text-sm md:text-base"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 transition-all font-medium text-sm md:text-base"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Views</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {analytics.totalViews}
                </h3>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-blue-100">
                <Eye className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Avg Views/Product</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {analytics.avgViewsPerProduct}
                </h3>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-green-100">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Products</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {analytics.categoryStats.reduce((sum, cat) => sum + cat.count, 0)}
                </h3>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-purple-100">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Daily Views Line Chart */}
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-display text-gray-800 mb-4 md:mb-6">
              Daily Views (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={250} minWidth="100%">
              <LineChart data={analytics.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ fill: "#D4AF37", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Bar Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-display text-gray-800 mb-6">
              Top 5 Viewed Products
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  style={{ fontSize: "11px" }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="#D4AF37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-display text-gray-800 mb-6">
            Category-wise Product Distribution
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={350} className="max-w-md">
              <PieChart>
                <Pie
                  data={analytics.categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.categoryStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-3">
              {analytics.categoryStats.map((cat, index) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">
                    {cat.category}: <strong>{cat.count}</strong> products
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Note about mock data */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            📊 <strong>Note:</strong> Currently showing simulated analytics data.
            To track real views, implement view tracking in your product pages
            and store view counts in Supabase.
          </p>
        </div>
      </div>
    </div>
    </AuthCheck>
  );
}
