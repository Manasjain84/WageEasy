import React from "react";
import Link from "next/link";
import { User, Phone, Building2, CreditCard, LogOut, CheckCircle } from "lucide-react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";

export default function WorkerProfilePage() {
  const profile = {
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    factory: "Precision Manufacturing Pvt Ltd",
    joinCode: "WAG8X2",
    status: "active",
    wageRate: "₹ 700 / day",
    joinedDate: "12 Jan 2026",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Profile & Factory Details
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Personal identification, registered factory affiliation, and wage information
        </p>
      </div>

      <Card className="p-5 border-2 border-slate-200 rounded-2xl bg-white space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-xl border-2 border-emerald-300">
            RK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
              <StatusPill status={profile.status} size="sm" />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{profile.phone}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Factory Affiliation
              </p>
              <p className="font-bold text-slate-900 mt-0.5">{profile.factory}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Join Code: {profile.joinCode}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Agreed Wage Rate
              </p>
              <p className="text-base font-black text-emerald-700 mt-0.5">
                {profile.wageRate}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard 8-Hour Daily Shift
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
