import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// Helper to verify if user is superadmin
async function verifySuperadmin(request: Request): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "superadmin") return null;

  return payload.id;
}

// PATCH - Update admin role, status, or password (superadmin only)
export async function PATCH(request: Request) {
  const adminId = await verifySuperadmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, role, is_active, password } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: any = {};

    if (role !== undefined) {
      if (!["admin", "superadmin"].includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be 'admin' or 'superadmin'" },
          { status: 400 }
        );
      }
      updates.role = role;
    }

    if (is_active !== undefined) {
      updates.is_active = is_active;
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      updates.hashed_password = await hashPassword(password);
    }

    // Update admin
    const { data, error } = await supabaseAdmin
      .from("admins")
      .update(updates)
      .eq("id", id)
      .select("id, email, name, role, is_active")
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Admin updated successfully",
      admin: data,
    });
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update admin" },
      { status: 500 }
    );
  }
}
