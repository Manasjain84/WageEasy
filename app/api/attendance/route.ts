import { NextRequest, NextResponse } from "next/server";
import { calculateDailyHours } from "@/lib/payroll";
import { createServiceClient } from "@/lib/supabase";

// GET /api/attendance?org_id=...&date=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("org_id");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "org_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await createServiceClient()
      .from("attendance_records")
      .select("*, employee:employees(name, email, phone)")
      .eq("org_id", orgId)
      .eq("date", date)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: { orgId, date },
      message: "Attendance records fetched successfully.",
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

    const supabase = createServiceClient();
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, org_id, status")
      .eq("id", employee_id)
      .eq("org_id", org_id)
      .single();

    if (employeeError) throw employeeError;
    if (employee.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Only active employees can record attendance" },
        { status: 403 }
      );
    }

    const date = new Date().toISOString().split("T")[0];
    const { data: existing, error: existingError } = await supabase
      .from("attendance_records")
      .select("id, check_in_time")
      .eq("employee_id", employee_id)
      .eq("date", date)
      .maybeSingle();

    if (existingError) throw existingError;

    const checkIn = existing?.check_in_time || check_in_time || new Date().toISOString();
    const checkOut = check_out_time || null;
    let hoursWorked = 0;
    let otHours = 0;

    if (checkOut) {
      const calc = calculateDailyHours(checkIn, checkOut);
      hoursWorked = calc.hoursWorked;
      otHours = calc.otHours;
    }

    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance_records")
      .upsert(
        {
          ...(existing?.id ? { id: existing.id } : {}),
          employee_id,
          org_id,
          check_in_time: checkIn,
          check_out_time: checkOut,
          hours_worked: hoursWorked,
          ot_hours: otHours,
          status: checkOut ? "present" : "incomplete",
          date,
        },
        { onConflict: "employee_id,date" }
      )
      .select("*, employee:employees(name, email, phone)")
      .single();

    if (attendanceError) throw attendanceError;

    return NextResponse.json({
      success: true,
      data: attendance,
      message: "Attendance recorded successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record attendance" },
      { status: 500 }
    );
  }
}
