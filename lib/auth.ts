import { UserRole, Employee } from "./supabase";

export const ROLE_COOKIE_NAME = "factory_user_role";
export const ORG_ID_COOKIE_NAME = "factory_org_id";
export const EMPLOYEE_ID_COOKIE_NAME = "factory_employee_id";

export interface AuthSession {
  userId: string;
  role: UserRole;
  orgId: string;
  employeeId?: string;
  name?: string;
  phone?: string;
}

/**
 * Checks if a given path is an employer-only route
 */
export function isEmployerPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/payroll") ||
    pathname.startsWith("/settings")
  );
}

/**
 * Checks if a given path is a worker-only route
 */
export function isWorkerPath(pathname: string): boolean {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/profile")
  );
}

/**
 * Checks if a given path is a public auth route
 */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  );
}
