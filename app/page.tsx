import Link from "next/link";
import { Factory, ShieldCheck, QrCode, Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto text-center">
      <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl mb-6 shadow-sm">
        <Factory className="w-16 h-16" />
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
        WageEasy
      </h1>
      <p className="mt-3 text-lg sm:text-xl text-slate-600 max-w-xl">
        High-contrast, mobile-first factory attendance, QR check-in, and automated payroll system.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10 w-full text-left">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <QrCode className="w-8 h-8 text-emerald-600 mb-2" />
          <h2 className="font-bold text-slate-900">QR Scan Attendance</h2>
          <p className="text-sm text-slate-600 mt-1">
            One-tap check-in and check-out built for simplicity and clarity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <Calculator className="w-8 h-8 text-emerald-600 mb-2" />
          <h2 className="font-bold text-slate-900">Automated Payroll</h2>
          <p className="text-sm text-slate-600 mt-1">
            Overtime calculations, wage rate rules, and instant payslip exports.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
          <h2 className="font-bold text-slate-900">Role-Based Access</h2>
          <p className="text-sm text-slate-600 mt-1">
            Clean views tailored for workers and employers with secure email auth.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link href="/login" className="flex-1">
          <Button variant="primary" className="w-full py-3.5 text-base flex items-center gap-2">
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/signup" className="flex-1">
          <Button variant="outline" className="w-full py-3.5 text-base">
            <span>Register / Join Org</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
