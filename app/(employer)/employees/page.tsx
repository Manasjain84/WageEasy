"use client";

import React, { useState } from "react";
import { Users, UserPlus, Check, X, Edit3, Search } from "lucide-react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/Button";

export default function EmployerEmployeesPage() {
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [search, setSearch] = useState("");

  const pendingRequests = [
    {
      id: "p1",
      name: "Suresh Patil",
      phone: "+91 98765 11111",
      joinedAt: "Today, 10:30 AM",
      requestedRate: "₹ 650 / day",
    },
    {
      id: "p2",
      name: "Manoj Yadav",
      phone: "+91 98765 22222",
      joinedAt: "Yesterday, 4:15 PM",
      requestedRate: "₹ 600 / day",
    },
  ];

  const activeEmployees = [
    {
      id: "e1",
      name: "Ramesh Kumar",
      phone: "+91 98765 43210",
      wageRate: "₹ 700 / day",
      status: "active",
      joinedAt: "12 Jan 2026",
    },
    {
      id: "e2",
      name: "Sunil Verma",
      phone: "+91 98765 43211",
      wageRate: "₹ 750 / day",
      status: "active",
      joinedAt: "05 Nov 2025",
    },
    {
      id: "e3",
      name: "Amit Patel",
      phone: "+91 98765 43212",
      wageRate: "₹ 650 / day",
      status: "active",
      joinedAt: "19 Feb 2026",
    },
    {
      id: "e4",
      name: "Pooja Devi",
      phone: "+91 98765 43213",
      wageRate: "₹ 680 / day",
      status: "active",
      joinedAt: "01 Dec 2025",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Employee Directory & Join Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage worker records, approve join requests, and configure daily wage rates
          </p>
        </div>

        <Button variant="primary" className="flex items-center gap-2 text-sm">
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 ${
            activeTab === "active"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Employees (48)</span>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 ${
            activeTab === "pending"
              ? "border-amber-600 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Pending Approvals</span>
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
            2
          </span>
        </button>
      </div>

      {/* Tab 1: Active Employees */}
      {activeTab === "active" && (
        <Card
          title="Registered Workers"
          subtitle="Click edit to update worker wage rates or deactivate accounts"
          action={
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search worker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          }
        >
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Daily Wage Rate</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {emp.phone}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {emp.wageRate}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {emp.joinedAt}
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={emp.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Pending Join Requests */}
      {activeTab === "pending" && (
        <Card
          title="Pending Join Requests"
          subtitle="Workers who used the factory join code and are awaiting approval"
        >
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{req.name}</h4>
                    <StatusPill status="pending" size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Phone: <span className="font-mono text-slate-700 font-medium">{req.phone}</span> • Requested: {req.joinedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <label className="text-xs font-semibold text-slate-600">Assign Wage:</label>
                    <input
                      type="text"
                      defaultValue="₹ 650 / day"
                      className="w-28 px-2 py-1 text-xs border border-slate-300 rounded-md font-bold text-slate-900"
                    />
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
