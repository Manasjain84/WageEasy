import React from "react";
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

export default function EmployerDashboardPage() {
  // Placeholder mock data for dashboard view
  const stats = [
    { label: "Total Active Workers", value: "48", icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Present Today", value: "42", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Approval", value: "3", icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
    { label: "Total OT Hours Today", value: "14.5 hrs", icon: Clock, color: "text-purple-600 bg-purple-50" },
  ];

  const recentAttendance = [
    {
      id: "1",
      name: "Ramesh Kumar",
      phone: "+91 98765 43210",
      checkIn: "08:02 AM",
      checkOut: "--",
      hours: "5.5 hrs",
      ot: "0.0 hrs",
      status: "present",
    },
    {
      id: "2",
      name: "Sunil Verma",
      phone: "+91 98765 43211",
      checkIn: "07:55 AM",
      checkOut: "04:30 PM",
      hours: "8.0 hrs",
      ot: "0.5 hrs",
      status: "present",
    },
    {
      id: "3",
      name: "Amit Patel",
      phone: "+91 98765 43212",
      checkIn: "--",
      checkOut: "--",
      hours: "0.0 hrs",
      ot: "0.0 hrs",
      status: "absent",
    },
    {
      id: "4",
      name: "Pooja Devi",
      phone: "+91 98765 43213",
      checkIn: "08:15 AM",
      checkOut: "--",
      hours: "5.2 hrs",
      ot: "0.0 hrs",
      status: "present",
    },
    {
      id: "5",
      name: "Deepak Sharma",
      phone: "+91 98765 43214",
      checkIn: "08:00 AM",
      checkOut: "01:00 PM",
      hours: "5.0 hrs",
      ot: "0.0 hrs",
      status: "incomplete",
    },
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
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {row.phone}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {row.checkIn}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {row.checkOut}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {row.hours}
                  </td>
                  <td className="py-3 px-4 text-purple-700 font-semibold">
                    {row.ot}
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
