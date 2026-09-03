import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/organizations - Create new organization (Employer registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, wage_rules } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Generate random 6-character uppercase alphanumeric join code (same format as signup page)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const generatedCode = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("").trim().toUpperCase();

    return NextResponse.json({
      success: true,
      data: {
        id: "placeholder-org-uuid",
        name,
        address: address || null,
        join_code: generatedCode,
        wage_rules: wage_rules || {
          standard_daily_hours: 8,
          ot_rate_multiplier: 1.5,
          work_days_per_month: 26,
          currency: "INR",
        },
      },
      message: "Organization created successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create organization",
      },
      { status: 500 }
    );
  }
}

// GET /api/organizations?join_code=... - Look up org by join code (Worker join request)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const joinCode = searchParams.get("join_code")?.trim().toUpperCase();

    if (!joinCode) {
      return NextResponse.json(
        { success: false, error: "join_code parameter is required" },
        { status: 400 }
      );
    }

    const { data: organization, error } = await createServiceClient()
      .from("organizations")
      .select("id, name, join_code")
      .eq("join_code", joinCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "No organization found for this join code" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
      message: "Organization found.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to find organization" },
      { status: 500 }
    );
  }
}
