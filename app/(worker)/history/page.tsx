"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { getUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/components/I18nProvider";

type HistoryRecord = {
  id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  hours_worked: number | null;
  ot_hours: number | null;
  status: "present" | "absent" | "incomplete";
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (timestamp: string | null) =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

export default function WorkerHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError(null);

      const profile = await getUserProfile();
      if (!profile.employeeId) {
        throw new Error("Unable to determine the logged-in employee.");
      }

      const { data, error: queryError } = await supabase
        .from("attendance_records")
        .select("id, date, check_in_time, check_out_time, hours_worked, ot_hours, status")
        .eq("employee_id", profile.employeeId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;
      setRecords((data || []) as HistoryRecord[]);
      setLoading(false);
    }

    loadHistory().catch((requestError) => {
      console.error("Error loading attendance history:", requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load attendance history."
      );
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t("worker.historyTitle")}
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {t("worker.historySubtitle")}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          {t("worker.loadingHistory")}
        </Card>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="font-bold text-slate-700">{t("worker.noRecords")}</p>
          <p className="mt-1">{t("worker.noRecordsHint")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card
              key={record.id}
              className="p-4 border-2 border-slate-200 rounded-2xl bg-white space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">
                    {formatDate(record.date)}
                  </span>
                </div>
                <StatusPill status={record.status} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{t("worker.checkIn")}</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {formatTime(record.check_in_time)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{t("worker.checkOut")}</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {formatTime(record.check_out_time)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{t("worker.hoursWorked")}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {Number(record.hours_worked || 0).toFixed(2)} hrs
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium px-1">
                {t("worker.overtime")}:{" "}
                <strong className="text-purple-700 font-bold">
                  {Number(record.ot_hours || 0).toFixed(2)} hrs
                </strong>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
