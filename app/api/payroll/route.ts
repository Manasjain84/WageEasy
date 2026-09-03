import { NextRequest, NextResponse } from "next/server";
import { calculateEmployeePayslip } from "@/lib/payroll";
import { createServiceClient } from "@/lib/supabase";

// POST /api/payroll/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, period_start, period_end } = body;

    if (!org_id || !period_start || !period_end) {
      return NextResponse.json(
        {
          success: false,
          error: "org_id, period_start, and period_end are required",
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("wage_rules")
      .eq("id", org_id)
      .single();
    if (organizationError) throw organizationError;

    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, name, wage_rate, role, status")
      .eq("org_id", org_id)
      .eq("role", "worker")
      .eq("status", "active")
      .order("name");
    if (employeesError) throw employeesError;

    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("org_id", org_id)
      .gte("date", period_start)
      .lte("date", period_end);
    if (attendanceError) throw attendanceError;

    const { data: cycle, error: cycleError } = await supabase
      .from("payroll_cycles")
      .upsert(
        { org_id, period_start, period_end, status: "draft" },
        { onConflict: "org_id,period_start,period_end" }
      )
      .select()
      .single();
    if (cycleError) throw cycleError;

    const wageRules = organization.wage_rules;
    const payslips = (employees || []).map((employee) =>
      calculateEmployeePayslip({
        employeeId: employee.id,
        payrollCycleId: cycle.id,
        wageRate: Number(employee.wage_rate),
        wageRules,
        attendanceRecords: (attendance || []).filter(
          (record) => record.employee_id === employee.id
        ),
      })
    );

    const { data: savedPayslips, error: payslipsError } = await supabase
      .from("payslips")
      .upsert(payslips, { onConflict: "payroll_cycle_id,employee_id" })
      .select();
    if (payslipsError) throw payslipsError;

    const employeeNames = new Map((employees || []).map((employee) => [employee.id, employee.name]));
    return NextResponse.json({
      success: true,
      cycle,
      payslips: (savedPayslips || []).map((payslip) => ({
        ...payslip,
        employee_name: employeeNames.get(payslip.employee_id) || "Unknown employee",
      })),
      message: "Payroll cycle calculated and saved as draft.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payroll" },
      { status: 500 }
    );
  }
}
