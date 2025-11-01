"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function AuthCheck({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminName, setAdminName] = useState<string>("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check admin role from cookie
    async function checkRole() {
      try {
        // The middleware already verifies the token
        // We just need to check the role for UI purposes
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsSuperadmin(data.role === 'superadmin');
          setAdminName(data.name || data.email);
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    }

    // The middleware already handles authentication
    // If we're here, we're authenticated
    setIsAuthenticated(true);
    setIsChecking(false);
    checkRole();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect to login even if API call fails
      router.push("/admin/login");
      router.refresh();
    }
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
              {isSuperadmin && (
                <a
                  href="/admin/manage-admins"
                  className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors border-l-2 border-brand-primary"
                >
                  Manage Admins
                </a>
              )}
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </>
  );
}
