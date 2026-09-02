"use client";

import React, { useState } from "react";
import { QrCode, Clock, CheckCircle2, ArrowRight, ShieldCheck, Sun } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";

export default function WorkerHomePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [liveHours] = useState("0h 00m");

  const toggleScanPlaceholder = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  return (
    <div className="space-y-6">
      {/* Worker Greeting & Date Header */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wide">
            <Sun className="w-4 h-4" />
            <span>Good Morning</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Ramesh Kumar
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Daily Wage: <strong className="text-slate-800 font-bold">₹ 700</strong>
          </p>
        </div>

        <div className="text-right">
          <StatusPill status={isCheckedIn ? "present" : "incomplete"} size="lg" />
        </div>
      </div>

      {/* Main High-Contrast QR Action Area */}
      <Card className="border-2 border-emerald-600/30 bg-emerald-50/50 p-6 text-center rounded-3xl">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Current Status
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {isCheckedIn ? "Checked In at Factory" : "Not Checked In Today"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isCheckedIn
              ? "Shift started at 08:00 AM"
              : "Point camera at factory entrance QR code to check in"}
          </p>
        </div>

        {/* Large Primary Action Button */}
        <div className="my-6">
          <Button
            variant="worker-large"
            onClick={toggleScanPlaceholder}
            className={
              isCheckedIn
                ? "bg-amber-600 hover:bg-amber-700 border-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700 border-emerald-700"
            }
          >
            <QrCode className="w-8 h-8" />
            <span className="text-xl">
              {isCheckedIn ? "Scan QR to Check Out" : "Scan QR to Check In"}
            </span>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified GPS & QR Factory Scanner</span>
        </div>
      </Card>

      {/* Today's Working Hours Card */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-2 border-slate-200 text-center rounded-2xl">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl w-fit mx-auto mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today&apos;s Hours
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {isCheckedIn ? "5h 15m" : "0h 00m"}
          </p>
        </Card>

        <Card className="p-4 border-2 border-slate-200 text-center rounded-2xl">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl w-fit mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overtime
          </p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            0h 00m
          </p>
        </Card>
      </div>
    </div>
  );
}
