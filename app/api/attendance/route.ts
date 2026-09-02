import { NextRequest, NextResponse } from "next/server";
import { calculateDailyHours } from "@/lib/payroll";

// GET /api/attendance?org_id=...&date=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("org_id");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Placeholder response - hook up with Supabase database query in future prompts
    return NextResponse.json({
      success: true,
      data: [],
      meta: { orgId, date },
      message: "Attendance records endpoint scaffolded successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST /api/attendance/check-in or check-out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, org_id, check_in_time, check_out_time } = body;

    if (!employee_id || !org_id) {
      return NextResponse.json(
        { success: false, error: "employee_id and org_id are required" },
        { status: 400 }
      );
    }

    let hoursWorked = 0;
    let otHours = 0;

    if (check_in_time && check_out_time) {
      const calc = calculateDailyHours(check_in_time, check_out_time);
      hoursWorked = calc.hoursWorked;
      otHours = calc.otHours;
    }

    // Placeholder response
    return NextResponse.json({
      success: true,
      data: {
        employee_id,
        org_id,
        check_in_time,
        check_out_time,
        hours_worked: hoursWorked,
        ot_hours: otHours,
        status: check_out_time ? "present" : "incomplete",
      },
      message: "Attendance recorded successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record attendance" },
      { status: 500 }
    );
  }
}
