"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Key, Shield, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import AuthCheck from "../components/AuthCheck";

interface Admin {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "admin",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const res = await fetch("/api/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        toast.error("Failed to load admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Admin added successfully!");
        setForm({ email: "", name: "", password: "", role: "admin" });
        setShowAddForm(false);
        fetchAdmins();
      } else {
        toast.error(data.error || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAdmin(id: string, email: string) {
    if (!confirm(`Are you sure you want to delete admin: ${email}?`)) return;

    try {
      const res = await fetch("/api/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Admin deleted successfully!");
        fetchAdmins();
      } else {
        toast.error(data.error || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      const res = await fetch("/api/admins/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Admin ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
        fetchAdmins();
      } else {
        toast.error(data.error || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Failed to update admin status");
    }
  }

  async function handleChangeRole(id: string, newRole: string) {
    if (!confirm(`Change admin role to ${newRole}?`)) return;

    try {
      const res = await fetch("/api/admins/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Role updated successfully!");
        fetchAdmins();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  }

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gradient-to-br from-brand-bg to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admins...</p>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header - Responsive */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Admins</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Add, remove, and manage admin users
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-lg hover:opacity-90 transition-all font-medium whitespace-nowrap"
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-sm md:text-base">Add New Admin</span>
            </button>
          </div>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border-2 border-brand-primary">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
              Add New Admin
            </h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@sangeet.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Admin Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password * (min 8 characters)
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="admin">Admin (Editor)</option>
                    <option value="superadmin">Superadmin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base"
                >
                  {submitting ? "Adding..." : "Add Admin"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setForm({ email: "", name: "", password: "", role: "admin" });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 bg-gradient-to-r from-brand-primary to-brand-accent">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              All Admins ({admins.length})
            </h2>
          </div>

          {admins.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <Shield className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No admins found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on Mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Last Login
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {admin.name || "—"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <select
                            value={admin.role}
                            onChange={(e) =>
                              handleChangeRole(admin.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${
                              admin.role === "superadmin"
                                ? "border-purple-300 bg-purple-50 text-purple-800"
                                : "border-blue-300 bg-blue-50 text-blue-800"
                            }`}
                          >
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleToggleStatus(admin.id, admin.is_active)
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              admin.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {admin.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {admin.last_login_at
                            ? new Date(admin.last_login_at).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                            title="Delete admin"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible only on Mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {admin.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500 break-all">
                          {admin.email}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Delete admin"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Role</label>
                        <select
                          value={admin.role}
                          onChange={(e) =>
                            handleChangeRole(admin.id, e.target.value)
                          }
                          className={`w-full px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
                            admin.role === "superadmin"
                              ? "border-purple-300 bg-purple-50 text-purple-800"
                              : "border-blue-300 bg-blue-50 text-blue-800"
                          }`}
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Status</label>
                        <button
                          onClick={() =>
                            handleToggleStatus(admin.id, admin.is_active)
                          }
                          className={`w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                            admin.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(admin.created_at).toLocaleDateString()}</span>
                      <span>
                        Last login:{" "}
                        {admin.last_login_at
                          ? new Date(admin.last_login_at).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Admin Role Permissions:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>
                  <strong>Admin:</strong> Can manage products, categories, and
                  content
                </li>
                <li>
                  <strong>Superadmin:</strong> Full access including admin
                  management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
