"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Factory, Phone, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    // Placeholder login flow - will hook into Supabase auth and role redirection
    setTimeout(() => {
      setLoading(false);
      alert("Phone OTP login placeholder. Hook with Supabase auth in follow-up.");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-sm mb-3">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome to WageEasy
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Sign in with your mobile phone number
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3.5 text-base flex items-center justify-center gap-2"
              >
                <span>Send OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-xs text-slate-500">
                  Enter 6-digit OTP code sent to{" "}
                  <strong className="text-slate-800">{phone}</strong>
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

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline font-medium pt-2"
              >
                Change phone number
              </button>
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
