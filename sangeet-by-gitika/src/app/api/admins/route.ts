import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Helper to verify if user is superadmin
async function verifySuperadmin(request: Request): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "superadmin") return null;

  return payload.id;
}

// GET - List all admins (superadmin only)
export async function GET(request: Request) {
  const adminId = await verifySuperadmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("admins")
      .select("id, email, name, role, is_active, created_at, last_login_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

// POST - Create new admin (superadmin only)
export async function POST(request: Request) {
  const adminId = await verifySuperadmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { email, name, password, role } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!["admin", "superadmin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'superadmin'" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const { data, error } = await supabaseAdmin
      .from("admins")
      .insert([
        {
          email: email.toLowerCase(),
          name: name || null,
          hashed_password: hashedPassword,
          role: role,
          is_active: true,
        },
      ])
      .select("id, email, name, role, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Admin created successfully",
      admin: data,
    });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin" },
      { status: 500 }
    );
  }
}

// DELETE - Remove admin (superadmin only)
export async function DELETE(request: Request) {
  const adminId = await verifySuperadmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (id === adminId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("id, email")
      .eq("id", id)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Delete admin
    const { error } = await supabaseAdmin
      .from("admins")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      message: "Admin deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete admin" },
      { status: 500 }
    );
  }
}
