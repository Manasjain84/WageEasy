import React from "react";
import { CreditCard, Download, Play, CheckCircle2, Calendar } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";

export default function EmployerPayrollPage() {
  const currentCycle = {
    period: "Feb 01, 2026 – Feb 28, 2026",
    status: "draft",
    totalEmployees: 48,
    totalGross: "₹ 8,42,500",
    totalOT: "₹ 74,200",
    totalDeductions: "₹ 12,000",
    netPayout: "₹ 9,04,700",
  };

  const samplePayslips = [
    {
      id: "p-1",
      name: "Ramesh Kumar",
      daysPresent: 26,
      totalHours: "208 hrs",
      otHours: "16 hrs",
      basePay: "₹ 18,200",
      otPay: "₹ 2,100",
      deductions: "₹ 500",
      netPay: "₹ 19,800",
    },
    {
      id: "p-2",
      name: "Sunil Verma",
      daysPresent: 25,
      totalHours: "200 hrs",
      otHours: "24 hrs",
      basePay: "₹ 18,750",
      otPay: "₹ 3,375",
      deductions: "₹ 0",
      netPay: "₹ 22,125",
    },
    {
      id: "p-3",
      name: "Pooja Devi",
      daysPresent: 24,
      totalHours: "192 hrs",
      otHours: "8 hrs",
      basePay: "₹ 16,320",
      otPay: "₹ 1,020",
      deductions: "₹ 200",
      netPay: "₹ 17,140",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Payroll Processing & Cycle Review
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculate salaries, overtime wages, generate payslips, and export bank reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Download className="w-4 h-4" />
            <span>Export Bank CSV</span>
          </Button>
          <Button variant="primary" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Play className="w-4 h-4" />
            <span>Calculate Cycle</span>
          </Button>
        </div>
      </div>

      {/* Current Cycle Summary Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                Current Active Cycle
              </span>
              <StatusPill status={currentCycle.status} size="sm" className="bg-slate-700 text-white border-slate-600" />
            </div>
            <h2 className="text-2xl font-black">{currentCycle.period}</h2>
            <p className="text-xs text-slate-300">
              Total Eligible Workers: <strong>{currentCycle.totalEmployees} Active</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Base Pay</p>
              <p className="text-lg font-bold text-white mt-0.5">{currentCycle.totalGross}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">OT Pay</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{currentCycle.totalOT}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Deductions</p>
              <p className="text-lg font-bold text-red-400 mt-0.5">{currentCycle.totalDeductions}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Payout</p>
              <p className="text-xl font-black text-white mt-0.5">{currentCycle.netPayout}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Individual Payslips Review Table */}
      <Card
        title="Worker Payslip Breakdown"
        subtitle="Review computed attendance days, hours, and net amounts before final disbursement"
        action={
          <Button variant="secondary" className="flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approve & Lock Cycle</span>
          </Button>
        }
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Worker</th>
                <th className="py-3 px-4 font-semibold">Days</th>
                <th className="py-3 px-4 font-semibold">Total Hours</th>
                <th className="py-3 px-4 font-semibold">OT Hours</th>
                <th className="py-3 px-4 font-semibold">Base Pay</th>
                <th className="py-3 px-4 font-semibold">OT Pay</th>
                <th className="py-3 px-4 font-semibold">Deductions</th>
                <th className="py-3 px-4 font-bold text-slate-900">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {samplePayslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-slate-900">{slip.name}</td>
                  <td className="py-3 px-4">{slip.daysPresent}</td>
                  <td className="py-3 px-4">{slip.totalHours}</td>
                  <td className="py-3 px-4 font-semibold text-purple-700">{slip.otHours}</td>
                  <td className="py-3 px-4">{slip.basePay}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{slip.otPay}</td>
                  <td className="py-3 px-4 text-red-600">{slip.deductions}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{slip.netPay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
