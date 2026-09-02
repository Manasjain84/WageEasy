import { AttendanceRecord, WageRules, Payslip } from "./supabase";

/**
 * Calculates hours worked and overtime hours from check-in and check-out dates
 */
export function calculateDailyHours(
  checkIn: Date | string,
  checkOut: Date | string,
  standardDailyHours: number = 8
): { hoursWorked: number; otHours: number } {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return { hoursWorked: 0, otHours: 0 };
  }

  const durationHours = (end - start) / (1000 * 60 * 60);
  const roundedHours = Math.round(durationHours * 100) / 100;

  const otHours = Math.max(0, roundedHours - standardDailyHours);
  const regularHours = Math.min(roundedHours, standardDailyHours);

  return {
    hoursWorked: regularHours,
    otHours: Math.round(otHours * 100) / 100,
  };
}

/**
 * Calculates individual payslip summary for an employee given their attendance records, wage rate, and org rules
 */
export function calculateEmployeePayslip({
  employeeId,
  payrollCycleId,
  wageRate,
  wageRules,
  attendanceRecords,
  deductions = 0,
}: {
  employeeId: string;
  payrollCycleId: string;
  wageRate: number;
  wageRules: WageRules;
  attendanceRecords: AttendanceRecord[];
  deductions?: number;
}): Omit<Payslip, "id" | "generated_at"> {
  let daysPresent = 0;
  let totalHours = 0;
  let totalOtHours = 0;

  for (const record of attendanceRecords) {
    if (record.status === "present" || (record.hours_worked && record.hours_worked > 0)) {
      daysPresent += 1;
      totalHours += Number(record.hours_worked || 0);
      totalOtHours += Number(record.ot_hours || 0);
    }
  }

  // Assuming wageRate is daily wage or hourly wage
  // Base daily rate calculation
  const hourlyRate = wageRate / (wageRules.standard_daily_hours || 8);
  const basePay = Math.round((totalHours * hourlyRate) * 100) / 100;
  
  const otMultiplier = wageRules.ot_rate_multiplier || 1.5;
  const otPay = Math.round((totalOtHours * hourlyRate * otMultiplier) * 100) / 100;

  const finalAmount = Math.max(0, Math.round((basePay + otPay - deductions) * 100) / 100);

  return {
    payroll_cycle_id: payrollCycleId,
    employee_id: employeeId,
    days_present: daysPresent,
    total_hours: Math.round(totalHours * 100) / 100,
    ot_hours: Math.round(totalOtHours * 100) / 100,
    base_pay: basePay,
    ot_pay: otPay,
    deductions: deductions,
    final_amount: finalAmount,
  };
}
