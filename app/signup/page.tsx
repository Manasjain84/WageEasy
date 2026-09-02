"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  LogOut,
  Phone,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { supabase } from "@/lib/supabase";
import { getUserProfile, setAuthCookies, clearAuthCookies } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  // Auth & Profile State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pendingOrgName, setPendingOrgName] = useState<string | null>(null);
  const [isPendingWorker, setIsPendingWorker] = useState(false);

  // Unauthenticated phone OTP fallback state (if visited directly without login)
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Form Mode & Inputs
  const [roleMode, setRoleMode] = useState<"choose" | "employer" | "worker">("choose");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Employer state
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [employerName, setEmployerName] = useState("");

  // Worker state
  const [workerName, setWorkerName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Check auth session on load
  useEffect(() => {
    async function checkSession() {
      setCheckingAuth(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setCurrentUser(user);
          const profile = await getUserProfile(user.id);

          if (profile.role === "employer") {
            setAuthCookies(profile);
            router.push("/dashboard");
            return;
          }

          if (profile.role === "worker") {
            setAuthCookies(profile);
            if (profile.status === "active") {
              router.push("/home");
              return;
            } else if (profile.status === "pending") {
              setIsPendingWorker(true);
              setPendingOrgName(profile.orgName || "Factory Organization");
            }
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkSession();
  }, [router]);

  // Helper: Generate a 6-character uppercase alphanumeric join code
  const generateJoinCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes ambiguous 0/O, 1/I
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Helper: Format phone
  const formatPhoneNumber = (input: string): string => {
    const trimmed = input.trim().replace(/[\s-]/g, "");
    if (trimmed.startsWith("+")) return trimmed;
    if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
    return `+${trimmed}`;
  };

  // Direct Phone OTP handlers for unauthenticated users on signup
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!authPhone || authPhone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    const formatted = formatPhoneNumber(authPhone);
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) throw error;
      setSuccessMsg(`OTP sent to ${formatted}`);
      setAuthStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!authOtp || authOtp.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit OTP.");
      return;
    }
    const formatted = formatPhoneNumber(authPhone);
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: authOtp.trim(),
        type: "sms",
      });
      if (error) throw error;
      if (data?.user) {
        setCurrentUser(data.user);
        const profile = await getUserProfile(data.user.id);
        if (profile.role === "employer") {
          setAuthCookies(profile);
          router.push("/dashboard");
        } else if (profile.role === "worker") {
          setAuthCookies(profile);
          if (profile.status === "active") {
            router.push("/home");
          } else {
            setIsPendingWorker(true);
            setPendingOrgName(profile.orgName || "Factory Organization");
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Employer Creation Handler
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentUser?.id) {
      setErrorMsg("Please verify your phone number before creating an organization.");
      return;
    }

    if (!orgName.trim()) {
      setErrorMsg("Organization name is required.");
      return;
    }

    setLoading(true);

    try {
      const generatedCode = generateJoinCode();
      const userPhone = currentUser.phone || authPhone;

      // 1. Insert into organizations table
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          owner_id: currentUser.id,
          name: orgName.trim(),
          address: orgAddress.trim() || null,
          join_code: generatedCode,
          wage_rules: {
            standard_daily_hours: 8,
            ot_rate_multiplier: 1.5,
            work_days_per_month: 26,
            currency: "INR",
          },
        })
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      // 2. Insert owner as active employer in employees table
      const { error: empError } = await supabase.from("employees").insert({
        org_id: orgData.id,
        auth_user_id: currentUser.id,
        name: employerName.trim() || `${orgName.trim()} Admin`,
        phone: userPhone,
        role: "employer",
        status: "active",
        wage_rate: 0,
      });

      if (empError) {
        console.warn("Notice during employee record creation:", empError.message);
      }

      // 3. Set auth cookies and redirect to dashboard
      setAuthCookies({
        userId: currentUser.id,
        role: "employer",
        status: "active",
        orgId: orgData.id,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Worker Join Handler
  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentUser?.id) {
      setErrorMsg("Please verify your phone number before submitting a join request.");
      return;
    }

    if (!joinCode.trim() || joinCode.trim().length < 4) {
      setErrorMsg("Please enter a valid 6-character factory join code.");
      return;
    }

    if (!workerName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const cleanCode = joinCode.trim().toUpperCase();

      // 1. Lookup organization by join_code
      const { data: orgData, error: lookupError } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("join_code", cleanCode)
        .maybeSingle();

      if (lookupError || !orgData) {
        throw new Error(
          `Invalid factory join code "${cleanCode}". Please verify with your factory owner/supervisor.`
        );
      }

      const userPhone = currentUser.phone || authPhone;

      // 2. Insert employee request with status 'pending'
      const { error: insertError } = await supabase.from("employees").insert({
        org_id: orgData.id,
        auth_user_id: currentUser.id,
        name: workerName.trim(),
        phone: userPhone,
        role: "worker",
        status: "pending",
        wage_rate: 0,
      });

      if (insertError) {
        // If already submitted
        if (insertError.message.includes("unique") || insertError.code === "23505") {
          setIsPendingWorker(true);
          setPendingOrgName(orgData.name);
          return;
        }
        throw insertError;
      }

      // 3. Set cookies and show waiting for approval screen
      setAuthCookies({
        userId: currentUser.id,
        role: "worker",
        status: "pending",
        orgId: orgData.id,
      });

      setPendingOrgName(orgData.name);
      setIsPendingWorker(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to join organization.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuthCookies();
    setCurrentUser(null);
    setIsPendingWorker(false);
    setRoleMode("choose");
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
          <span>Loading account status...</span>
        </div>
      </div>
    );
  }

  // State A: Pending Worker Approval Screen
  if (isPendingWorker) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md">
          <Card className="border-2 border-amber-300 bg-white shadow-lg p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <div className="inline-block mb-2">
                <StatusPill status="pending" size="md" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                Waiting for Employer Approval
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Your request to join{" "}
                <strong className="text-slate-900 font-bold">
                  {pendingOrgName || "the factory"}
                </strong>{" "}
                has been submitted.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600 space-y-2">
              <p className="flex items-center gap-1.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What happens next?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Your supervisor will verify your details and assign your daily wage rate.</li>
                <li>Once approved, you can immediately start scanning QR codes to log attendance.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => router.refresh()}
                className="w-full text-sm font-bold"
              >
                Check Approval Status
              </Button>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold py-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // State B: Unauthenticated User - Prompt Phone OTP first
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Join or Create Factory
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Verify your mobile number to get started
            </p>
          </div>

          <Card className="border border-slate-200 shadow-md">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {authStep === "phone" ? (
              <form onSubmit={handleSendSignupOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={authLoading}
                  className="w-full py-3.5 text-base flex items-center justify-center gap-2"
                >
                  <span>Continue with Phone OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifySignupOtp} className="space-y-4">
                <p className="text-xs text-slate-600 text-center">
                  Enter 6-digit OTP code sent to <strong>{authPhone}</strong>
                </p>
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 text-center tracking-widest text-xl font-bold bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={authLoading}
                  className="w-full py-3.5 text-base"
                >
                  Verify & Continue
                </Button>

                <button
                  type="button"
                  onClick={() => setAuthStep("phone")}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Change phone number
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already registered?{" "}
                <Link href="/login" className="font-bold text-emerald-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // State C: Authenticated User - Choose Role & Complete Registration
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Set Up Your Account
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Verified as <strong className="text-slate-900">{currentUser.phone}</strong>
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {roleMode === "choose" ? (
            <div className="space-y-4">
              {/* Employer Option */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setRoleMode("employer");
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-start gap-4 group"
              >
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700">
                    Create an Organization
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For factory owners & managers to track daily shifts, wage rates, and payroll.
                  </p>
                </div>
              </button>

              {/* Worker Option */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setRoleMode("worker");
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-start gap-4 group"
              >
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                    Join an Organization
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For factory workers to scan QR attendance and view hours & payslips.
                  </p>
                </div>
              </button>
            </div>
          ) : roleMode === "employer" ? (
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setRoleMode("choose");
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to options
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Organization / Factory Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metro Garments Pvt Ltd"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Factory Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 18, Industrial Area"
                  value={orgAddress}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                A 6-character unique join code will be generated automatically for your workers.
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3.5 text-base flex items-center justify-center gap-2 font-bold"
              >
                <span>Create & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleJoinOrganization} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setRoleMode("choose");
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to options
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Factory 6-Digit Join Code *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. WAG8X2"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none uppercase font-mono font-bold tracking-widest text-center text-lg"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ask your factory owner or supervisor for this code.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3.5 text-base flex items-center justify-center gap-2 font-bold"
              >
                <span>Submit Join Request</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleSignOut}
              className="text-xs text-red-500 hover:text-red-700 font-semibold"
            >
              Sign Out
            </button>
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-800">
              Switch Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
