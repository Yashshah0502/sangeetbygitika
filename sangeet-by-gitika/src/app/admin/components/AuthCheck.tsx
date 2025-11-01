"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, Home, Package, FolderOpen, Image as ImageIcon, BarChart3, UserPlus, Users, Store } from "lucide-react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function AuthCheck({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminName, setAdminName] = useState<string>("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const menuItems = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/categories", icon: FolderOpen, label: "Categories" },
    { href: "/admin/hero-slides", icon: ImageIcon, label: "Hero Slides" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin", icon: UserPlus, label: "Add Product" },
  ];

  if (isSuperadmin) {
    menuItems.push({ href: "/admin/manage-admins", icon: Users, label: "Manage Admins" });
  }

  return (
    <>
      {/* Responsive Admin Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable */}
            <Link
              href="/admin/dashboard"
              className="font-display text-lg md:text-xl text-brand-primary hover:text-brand-accent transition-colors"
            >
              SanGeet by Gitika <span className="text-sm text-gray-500">Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-brand-primary transition-colors text-sm"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-primary transition-colors"
              >
                <Store className="w-4 h-4" />
                <span>View Store</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-brand-primary transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-brand-primary transition-colors"
                >
                  <Store className="w-5 h-5" />
                  <span className="font-medium">View Store</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-brand-bg to-white">
        {children}
      </main>
    </>
  );
}
