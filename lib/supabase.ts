import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

// Types matching the Postgres schema
export type EmployeeStatus = "pending" | "active" | "inactive";
export type AttendanceStatus = "present" | "absent" | "incomplete";
export type PayrollCycleStatus = "draft" | "approved" | "paid";
export type UserRole = "employer" | "worker";

export interface WageRules {
  standard_daily_hours: number;
  ot_rate_multiplier: number;
  work_days_per_month: number;
  currency: string;
}

export interface Organization {
  id: string;
  owner_id?: string | null;
  name: string;
  address?: string | null;
  join_code: string;
  wage_rules: WageRules;
  created_at: string;
}

export interface Employee {
  id: string;
  org_id: string;
  auth_user_id?: string | null;
  name: string;
  phone: string;
  photo_url?: string | null;
  wage_rate: number;
  role: UserRole;
  status: EmployeeStatus;
  joined_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  org_id: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  hours_worked: number;
  ot_hours: number;
  status: AttendanceStatus;
  is_manual_edit: boolean;
  edited_by?: string | null;
  date: string;
  created_at: string;
}

export interface PayrollCycle {
  id: string;
  org_id: string;
  period_start: string;
  period_end: string;
  status: PayrollCycleStatus;
  created_at: string;
}

export interface Payslip {
  id: string;
  payroll_cycle_id: string;
  employee_id: string;
  days_present: number;
  total_hours: number;
  ot_hours: number;
  base_pay: number;
  ot_pay: number;
  deductions: number;
  final_amount: number;
  generated_at: string;
}

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Browser client using @supabase/ssr for client components
export function createBrowserClient() {
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Global browser client singleton
export const supabase = createBrowserClient();

// Server-side service client factory
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
