"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Factory, Mail, KeyRound, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { supabase } from "@/lib/supabase";
import { getUserProfile, setAuthCookies } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
      });

      if (error) {
        throw error;
      }

      setSuccessMsg(`Verification code sent to ${cleanEmail}`);
      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification code. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otp || otp.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: otp.trim(),
        type: "email",
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Query user's role and organization status
        const profile = await getUserProfile(data.user.id);
        profile.email = cleanEmail;
        setAuthCookies(profile);

        if (profile.role === "employer") {
          router.push("/dashboard");
          return;
        }

        if (profile.role === "worker") {
          if (profile.status === "active") {
            router.push("/home");
          } else {
            // Worker is pending approval or inactive
            router.push("/signup");
          }
          return;
        }

        // New user without an organization or employee profile
        router.push("/signup");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
      });

      if (error) throw error;
      setSuccessMsg(`New code sent to ${cleanEmail}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code. Please wait a moment and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-sm mb-3">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome to WageEasy
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Factory Attendance & Automated Payroll
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md">
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
              <Factory className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Work or Personal Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com or personal@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We will send a 6-digit one-time password (OTP) to your email.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3.5 text-base flex items-center justify-center gap-2"
              >
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-xs text-slate-600">
                  Enter 6-digit verification code sent to{" "}
                  <strong className="text-slate-900 font-bold">{email}</strong>
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 text-center tracking-widest text-xl font-bold bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3.5 text-base"
              >
                Verify & Sign In
              </Button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Change email address
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New here?{" "}
              <Link
                href="/signup"
                className="font-bold text-emerald-600 hover:underline"
              >
                Create organization or join with code
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
