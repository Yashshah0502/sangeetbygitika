"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function AuthCheck({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  function checkAuth() {
    if (typeof window === "undefined") return;

    const isAuth = localStorage.getItem("admin_authenticated");
    const authTime = localStorage.getItem("admin_auth_time");

    if (isAuth === "true" && authTime) {
      // Check if session is still valid (24 hours)
      const authTimeMs = parseInt(authTime);
      const now = new Date().getTime();
      const hoursSinceAuth = (now - authTimeMs) / (1000 * 60 * 60);

      if (hoursSinceAuth < 24) {
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        // Session expired
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_auth_time");
        router.push("/admin/login");
      }
    } else {
      // Not authenticated
      router.push("/admin/login");
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_auth_time");
    router.push("/admin/login");
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-brand-bg to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Admin Header with Logout */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-lg text-brand-primary">
              SanGeet by Gitika Admin
            </h2>
            <div className="flex gap-2 text-sm">
              <a
                href="/admin/dashboard"
                className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/admin/products"
                className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Products
              </a>
              <a
                href="/admin/categories"
                className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Categories
              </a>
              <a
                href="/admin/hero-slides"
                className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Hero Slides
              </a>
              <a
                href="/admin/analytics"
                className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Analytics
              </a>
              <a
                href="/admin"
                className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                Add Product
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-brand-primary transition-colors"
            >
              View Store →
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </>
  );
}
