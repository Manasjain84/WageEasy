import React from "react";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";

export default function WorkerHistoryPage() {
  const historyRecords = [
    {
      date: "Today, 02 Sep 2026",
      checkIn: "08:00 AM",
      checkOut: "04:30 PM",
      totalHours: "8.5 hrs",
      otHours: "0.5 hrs",
      status: "present",
      earnedToday: "₹ 743.75",
    },
    {
      date: "Yesterday, 01 Sep 2026",
      checkIn: "08:05 AM",
      checkOut: "04:00 PM",
      totalHours: "8.0 hrs",
      otHours: "0.0 hrs",
      status: "present",
      earnedToday: "₹ 700.00",
    },
    {
      date: "Sat, 30 Aug 2026",
      checkIn: "08:00 AM",
      checkOut: "06:00 PM",
      totalHours: "10.0 hrs",
      otHours: "2.0 hrs",
      status: "present",
      earnedToday: "₹ 875.00",
    },
    {
      date: "Fri, 29 Aug 2026",
      checkIn: "--",
      checkOut: "--",
      totalHours: "0.0 hrs",
      otHours: "0.0 hrs",
      status: "absent",
      earnedToday: "₹ 0.00",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Attendance & Work History
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Review your past daily check-ins, recorded hours, and daily calculated earnings
        </p>
      </div>

      <div className="space-y-3">
        {historyRecords.map((rec, idx) => (
          <Card
            key={idx}
            className="p-4 border-2 border-slate-200 rounded-2xl bg-white space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  {rec.date}
                </span>
              </div>
              <StatusPill status={rec.status} size="sm" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Check In
                </p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {rec.checkIn}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Check Out
                </p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {rec.checkOut}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Total Hours
                </p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {rec.totalHours}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-slate-500 font-medium">
                Overtime: <strong className="text-purple-700 font-bold">{rec.otHours}</strong>
              </span>
              <span className="text-slate-900 font-bold">
                Est. Pay: <span className="text-emerald-600 font-black">{rec.earnedToday}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
