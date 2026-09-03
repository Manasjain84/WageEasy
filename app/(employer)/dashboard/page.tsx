"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter,
  Download,
} from "lucide-react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/Button";
import { getUserProfile } from "@/lib/auth";

type AttendanceRow = {
  id: string;
  check_in_time: string | null;
  check_out_time: string | null;
  hours_worked: number;
  ot_hours: number;
  status: "present" | "absent" | "incomplete";
  employee: { name: string; phone?: string | null } | null;
};

export default function EmployerDashboardPage() {
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    let active = true;
    const fetchAttendance = async () => {
      const profile = await getUserProfile();
      if (!profile.orgId) return;
      const response = await fetch(
        `/api/attendance?org_id=${encodeURIComponent(profile.orgId)}&date=${new Date().toISOString().split("T")[0]}`
      );
      if (!response.ok) throw new Error("Unable to load attendance.");
      const result = await response.json();
      if (active) setRecentAttendance(result.data || []);
    };

    fetchAttendance().catch((error) => console.error("Error loading dashboard attendance:", error));
    const intervalId = window.setInterval(
      () => fetchAttendance().catch((error) => console.error("Error refreshing dashboard attendance:", error)),
      5000
    );
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const stats = [
    { label: "Total Active Workers", value: String(recentAttendance.length), icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Present Today", value: String(recentAttendance.filter((row) => row.check_in_time).length), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Approval", value: "—", icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
    { label: "Total OT Hours Today", value: `${recentAttendance.reduce((sum, row) => sum + Number(row.ot_hours || 0), 0)} hrs`, icon: Clock, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Factory Attendance Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time daily attendance and shift metrics for today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Link href="/payroll">
            <Button variant="primary" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span>Run Payroll</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Attendance Status Data Table */}
      <Card
        title="Today's Shift Attendance"
        subtitle="Live worker check-ins, recorded hours, and overtime"
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Worker Name</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Check In</th>
                <th className="py-3 px-4 font-semibold">Check Out</th>
                <th className="py-3 px-4 font-semibold">Hours</th>
                <th className="py-3 px-4 font-semibold">OT Hours</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAttendance.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                   {row.employee?.name || "--"}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                   {row.employee?.phone || "--"}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                   {row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                   {row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                   {row.hours_worked} hrs
                  </td>
                  <td className="py-3 px-4 text-purple-700 font-semibold">
                   {row.ot_hours} hrs
                  </td>
                  <td className="py-3 px-4">
                    <StatusPill status={row.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
