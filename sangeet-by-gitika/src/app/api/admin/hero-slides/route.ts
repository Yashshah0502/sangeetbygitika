import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Fetch all hero slides
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ slides: data });
  } catch (error: any) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// POST - Create new hero slide
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ slide: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create hero slide" },
      { status: 500 }
    );
  }
}

// PUT - Update hero slide
export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ slide: data });
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

// DELETE - Delete hero slide
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("hero_slides")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
