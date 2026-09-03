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
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
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

  // Form Mode & Inputs
  const [roleMode, setRoleMode] = useState<"choose" | "employer" | "worker">("choose");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Employer state
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");
  const [employerConfirmPassword, setEmployerConfirmPassword] = useState("");

  // Worker state
  const [workerName, setWorkerName] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [workerConfirmPassword, setWorkerConfirmPassword] = useState("");

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

  // Employer Creation Handler
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = (currentUser?.email || employerEmail).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!currentUser) {
      if (employerPassword.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }

      if (employerPassword !== employerConfirmPassword) {
        setErrorMsg("Passwords do not match. Please re-enter.");
        return;
      }
    }

    if (!orgName.trim()) {
      setErrorMsg("Organization name is required.");
      return;
    }

    setLoading(true);

    try {
      let authUserId = currentUser?.id;

      // 1. Sign up user in Supabase Auth if not already authenticated
      if (!authUserId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: employerPassword,
        });

        if (authError) {
          throw authError;
        }

        if (!authData?.user) {
          throw new Error("Unable to create user account. Please try again.");
        }

        authUserId = authData.user.id;
        setCurrentUser(authData.user);
      }

      const generatedCode = generateJoinCode();

      // DEBUG: Log the exact code being stored so employer-side mismatches are easy to spot
      console.log("[CreateOrg] Generated join_code:", JSON.stringify(generatedCode), "length:", generatedCode.length);

      // 2. Insert into organizations table
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          owner_id: authUserId,
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

      // 3. Insert owner as active employer in employees table
      const { error: empError } = await supabase.from("employees").insert({
        org_id: orgData.id,
        auth_user_id: authUserId,
        name: employerName.trim() || `${orgName.trim()} Admin`,
        email: cleanEmail,
        role: "employer",
        status: "active",
        wage_rate: 0,
      });

      if (empError) {
        console.warn("Notice during employee record creation:", empError.message);
      }

      // 4. Set auth cookies and redirect to dashboard
      setAuthCookies({
        userId: authUserId,
        role: "employer",
        status: "active",
        orgId: orgData.id,
        email: cleanEmail,
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

    const cleanEmail = (currentUser?.email || workerEmail).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!currentUser) {
      if (workerPassword.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }

      if (workerPassword !== workerConfirmPassword) {
        setErrorMsg("Passwords do not match. Please re-enter.");
        return;
      }
    }

    const cleanCodePreview = joinCode.trim().toUpperCase().replace(/\s/g, "");
    if (!cleanCodePreview || !/^[A-Z0-9]{6}$/.test(cleanCodePreview)) {
      setErrorMsg(
        "Please enter a valid 6-character factory join code (letters and numbers only, e.g. WAG8X2)."
      );
      return;
    }

    if (!workerName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      // cleanCodePreview is already validated as 6-char uppercase alphanumeric above
      const cleanCode = cleanCodePreview;

      // DEBUG: Log the exact code being searched for
      console.log("[JoinOrg] Looking up join_code:", JSON.stringify(cleanCode), "length:", cleanCode.length);

      // STEP 1: Look up the organization by join code FIRST (before auth).
      // The anon RLS policy on organizations allows this unauthenticated read.
      const { data: orgData, error: lookupError } = await supabase
        .from("organizations")
        .select("id, name, join_code")
        .eq("join_code", cleanCode)
        .maybeSingle();

      // DEBUG: Log what the DB returned so mismatches are visible in the console
      console.log("[JoinOrg] Supabase lookup result:", { orgData, lookupError });

      if (lookupError) {
        console.error("[JoinOrg] DB error during lookup:", lookupError);
        throw new Error(
          `Database error while looking up join code. Please try again. (${lookupError.message})`
        );
      }

      if (!orgData) {
        console.warn(
          "[JoinOrg] No org found for code:",
          cleanCode,
          "— possible causes: RLS blocking anon read (apply schema migration), wrong code, or code not yet in DB."
        );
        throw new Error(
          `No organization found for join code "${cleanCode}". Please double-check the code with your supervisor.`
        );
      }

      // DEBUG: Confirm what was stored in DB vs what worker entered
      console.log(
        "[JoinOrg] ✅ Org found:",
        orgData.name,
        "| stored join_code:",
        JSON.stringify(orgData.join_code),
        "| entered:",
        JSON.stringify(cleanCode)
      );

      let authUserId = currentUser?.id;

      // STEP 2: Sign up (or use existing session) — AFTER org lookup so auth state doesn't affect RLS on lookup
      if (!authUserId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: workerPassword,
        });

        if (authError) {
          throw authError;
        }

        if (!authData?.user) {
          throw new Error("Unable to create user account. Please try again.");
        }

        authUserId = authData.user.id;
        setCurrentUser(authData.user);
      }

      // STEP 3: Insert employee request with status 'pending'
      const { error: insertError } = await supabase.from("employees").insert({
        org_id: orgData.id,
        auth_user_id: authUserId,
        name: workerName.trim(),
        email: cleanEmail,
        phone: workerPhone.trim() || null,
        role: "worker",
        status: "pending",
        wage_rate: 0,
      });

      if (insertError) {
        // If already submitted (duplicate auth_user_id)
        if (insertError.message?.includes("unique") || insertError.code === "23505") {
          setIsPendingWorker(true);
          setPendingOrgName(orgData.name);
          return;
        }
        throw insertError;
      }

      // 4. Set cookies and show waiting for approval screen
      setAuthCookies({
        userId: authUserId,
        role: "worker",
        status: "pending",
        orgId: orgData.id,
        email: cleanEmail,
      });

      setPendingOrgName(orgData.name);
      setIsPendingWorker(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit join request.");
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {roleMode === "choose"
              ? "Get Started with WageEasy"
              : roleMode === "employer"
              ? "Create Organization"
              : "Join Organization"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {currentUser
              ? `Logged in as ${currentUser.email}`
              : "Sign up with email and password"}
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
                    Create an Organization (Employer)
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
                    Join an Organization (Worker)
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

              {!currentUser && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="owner@company.com"
                        value={employerEmail}
                        onChange={(e) => setEmployerEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Password * (min. 6 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={employerPassword}
                        onChange={(e) => setEmployerPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={employerConfirmPassword}
                        onChange={(e) => setEmployerConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

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
                  Factory Join Code * (6 characters)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. WAG8X2"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  }
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none uppercase font-mono font-bold tracking-widest text-center text-lg"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  6-character code (letters &amp; numbers). Ask your factory owner or supervisor.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              {!currentUser && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="worker@gmail.com"
                        value={workerEmail}
                        onChange={(e) => setWorkerEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Password * (min. 6 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={workerPassword}
                        onChange={(e) => setWorkerPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={workerConfirmPassword}
                        onChange={(e) => setWorkerConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

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
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Sign Out
              </button>
            ) : (
              <span className="text-xs text-slate-500">Already registered?</span>
            )}
            <Link href="/login" className="text-xs font-bold text-emerald-600 hover:underline">
              Log in to existing account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
