"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, Download, Play, CheckCircle2, Calendar } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";
import { getUserProfile } from "@/lib/auth";

type Payslip = {
  id: string;
  employee_id: string;
  employee_name: string;
  days_present: number;
  total_hours: number;
  ot_hours: number;
  base_pay: number;
  ot_pay: number;
  deductions: number;
  final_amount: number;
};

type PayrollResult = {
  cycle: { period_start: string; period_end: string; status: "draft" | "approved" | "paid" };
  payslips: Payslip[];
};

const formatMoney = (value: number) =>
  `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function EmployerPayrollPage() {
  const today = new Date();
  const [periodStart, setPeriodStart] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [result, setResult] = useState<PayrollResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateCycle = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getUserProfile();
      if (!profile.orgId) throw new Error("Unable to determine the current organization.");
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: profile.orgId,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to calculate payroll.");
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to calculate payroll.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateCycle();
  }, []);

  const totals = useMemo(
    () =>
      (result?.payslips || []).reduce(
        (summary, payslip) => ({
          employees: summary.employees + 1,
          hours: summary.hours + Number(payslip.total_hours),
          otHours: summary.otHours + Number(payslip.ot_hours),
          basePay: summary.basePay + Number(payslip.base_pay),
          otPay: summary.otPay + Number(payslip.ot_pay),
          deductions: summary.deductions + Number(payslip.deductions),
          finalAmount: summary.finalAmount + Number(payslip.final_amount),
        }),
        { employees: 0, hours: 0, otHours: 0, basePay: 0, otPay: 0, deductions: 0, finalAmount: 0 }
      ),
    [result]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Payroll Processing & Cycle Review
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculated from active employees and attendance records
          </p>
        </div>
        <Button onClick={calculateCycle} disabled={loading} variant="primary" className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Play className="w-4 h-4" />
          <span>{loading ? "Calculating..." : "Calculate Cycle"}</span>
        </Button>
      </div>

      <Card title="Payroll Period" subtitle="Choose the attendance dates included in this cycle">
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="text-sm font-semibold text-slate-700">
            Start date
            <input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className="block mt-1 px-3 py-2 border rounded-lg" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            End date
            <input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className="block mt-1 px-3 py-2 border rounded-lg" />
          </label>
        </div>
      </Card>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 font-semibold">{error}</div>}

      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">Current Payroll Cycle</span>
              <StatusPill status={result?.cycle.status || "draft"} size="sm" className="bg-slate-700 text-white border-slate-600" />
            </div>
            <h2 className="text-2xl font-black">{periodStart} – {periodEnd}</h2>
            <p className="text-xs text-slate-300">Total Eligible Workers: <strong>{totals.employees} Active</strong></p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
            <div><p className="text-[11px] text-slate-400 uppercase font-semibold">Base Pay</p><p className="text-lg font-bold">{formatMoney(totals.basePay)}</p></div>
            <div><p className="text-[11px] text-slate-400 uppercase font-semibold">OT Pay</p><p className="text-lg font-bold text-emerald-400">{formatMoney(totals.otPay)}</p></div>
            <div><p className="text-[11px] text-slate-400 uppercase font-semibold">Deductions</p><p className="text-lg font-bold text-red-400">{formatMoney(totals.deductions)}</p></div>
            <div><p className="text-[11px] text-slate-400 uppercase font-semibold">Total Payout</p><p className="text-xl font-black">{formatMoney(totals.finalAmount)}</p></div>
          </div>
        </div>
      </Card>

      <Card title="Worker Payslip Breakdown" subtitle="Real attendance totals and calculated pay for active employees" action={<Button variant="secondary" className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Draft Saved</span></Button>}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-y border-slate-200">
              <tr><th className="py-3 px-4">Worker</th><th className="py-3 px-4">Days</th><th className="py-3 px-4">Total Hours</th><th className="py-3 px-4">OT Hours</th><th className="py-3 px-4">Base Pay</th><th className="py-3 px-4">OT Pay</th><th className="py-3 px-4">Deductions</th><th className="py-3 px-4">Net Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result?.payslips.map((slip) => (
                <tr key={slip.id}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{slip.employee_name}</td>
                  <td className="py-3 px-4">{slip.days_present}</td>
                  <td className="py-3 px-4">{slip.total_hours} hrs</td>
                  <td className="py-3 px-4 font-semibold text-purple-700">{slip.ot_hours} hrs</td>
                  <td className="py-3 px-4">{formatMoney(slip.base_pay)}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{formatMoney(slip.ot_pay)}</td>
                  <td className="py-3 px-4 text-red-600">{formatMoney(slip.deductions)}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{formatMoney(slip.final_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && result?.payslips.length === 0 && <p className="text-center py-10 text-slate-500">No active employees found.</p>}
        </div>
      </Card>
    </div>
  );
}
