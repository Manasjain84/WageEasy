import { supabase, UserRole, EmployeeStatus, Organization, Employee } from "./supabase";

export const ROLE_COOKIE_NAME = "factory_user_role";
export const ORG_ID_COOKIE_NAME = "factory_org_id";
export const EMPLOYEE_ID_COOKIE_NAME = "factory_employee_id";

export interface UserProfile {
  userId: string;
  role: UserRole | null;
  status: EmployeeStatus | null;
  orgId: string | null;
  orgName?: string | null;
  employeeId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
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

/**
 * Sets auth cookies in the browser for role-based routing and fast SSR
 */
export function setAuthCookies(profile: Partial<UserProfile>) {
  if (typeof document === "undefined") return;

  const maxAge = 60 * 60 * 24 * 30; // 30 days
  if (profile.role) {
    document.cookie = `${ROLE_COOKIE_NAME}=${profile.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  if (profile.orgId) {
    document.cookie = `${ORG_ID_COOKIE_NAME}=${profile.orgId}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  if (profile.employeeId) {
    document.cookie = `${EMPLOYEE_ID_COOKIE_NAME}=${profile.employeeId}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

/**
 * Clears auth cookies upon signout
 */
export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${ORG_ID_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${EMPLOYEE_ID_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Queries Supabase to fetch user's full profile, role, organization, and employment status
 */
export async function getUserProfile(userId?: string): Promise<UserProfile> {
  let targetUserId = userId;
  let authUserEmail: string | undefined = undefined;

  if (!targetUserId) {
    const { data: authData } = await supabase.auth.getUser();
    targetUserId = authData.user?.id;
    authUserEmail = authData.user?.email;
  } else {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user?.id === targetUserId) {
      authUserEmail = authData.user?.email;
    }
  }

  if (!targetUserId) {
    return {
      userId: "",
      role: null,
      status: null,
      orgId: null,
    };
  }

  // 1. Check if user is an organization owner (Employer)
  const { data: orgData } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", targetUserId)
    .maybeSingle();

  if (orgData) {
    return {
      userId: targetUserId,
      role: "employer",
      status: "active",
      orgId: orgData.id,
      orgName: orgData.name,
      email: authUserEmail,
    };
  }

  // 2. Check if user is an employee (Worker or Supervisor)
  const { data: empData } = await supabase
    .from("employees")
    .select("id, org_id, name, email, phone, role, status")
    .eq("auth_user_id", targetUserId)
    .maybeSingle();

  if (empData) {
    return {
      userId: targetUserId,
      role: empData.role as UserRole,
      status: empData.status as EmployeeStatus,
      orgId: empData.org_id,
      employeeId: empData.id,
      name: empData.name,
      email: empData.email || authUserEmail,
      phone: empData.phone,
    };
  }

  // 3. User is authenticated with Supabase email OTP, but not in any org yet
  return {
    userId: targetUserId,
    role: null,
    status: null,
    orgId: null,
    email: authUserEmail,
  };
}

/**
 * Helper to get current user role
 */
export async function getCurrentUserRole(userId?: string): Promise<UserRole | null> {
  const profile = await getUserProfile(userId);
  return profile.role;
}

/**
 * Helper to get current user organization ID
 */
export async function getCurrentOrgId(userId?: string): Promise<string | null> {
  const profile = await getUserProfile(userId);
  return profile.orgId;
}
