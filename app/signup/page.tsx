"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, UserCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function SignupPage() {
  const [roleMode, setRoleMode] = useState<"choose" | "employer" | "worker">(
    "choose"
  );
  const [loading, setLoading] = useState(false);

  // Employer state
  const [orgName, setOrgName] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");

  // Worker state
  const [workerName, setWorkerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        `Registered as ${roleMode} placeholder. Database insertion will be wired in follow-up.`
      );
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Get Started with WageEasy
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Choose how you want to use the application
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md">
          {roleMode === "choose" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setRoleMode("employer")}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-start gap-4 group"
              >
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700">
                    Create Organization (Employer)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For factory owners & managers to track attendance, wage rates, and payroll.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRoleMode("worker")}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-start gap-4 group"
              >
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                    Join with Code (Worker)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For factory workers to scan QR attendance and view hours & payslips.
                  </p>
                </div>
              </button>
            </div>
          ) : roleMode === "employer" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <button
                type="button"
                onClick={() => setRoleMode("choose")}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to role selection
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Organization / Factory Name
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
                  Owner Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={employerPhone}
                  onChange={(e) => setEmployerPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3 text-base flex items-center justify-center gap-2"
              >
                <span>Create Organization</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <button
                type="button"
                onClick={() => setRoleMode("choose")}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to role selection
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Factory Join Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. FACT-8821"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none uppercase font-mono font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-3 text-base flex items-center justify-center gap-2"
              >
                <span>Submit Join Request</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-600 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
