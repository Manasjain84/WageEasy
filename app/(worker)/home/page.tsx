"use client";

import React, { useEffect, useRef, useState } from "react";
import { QrCode, Clock, CheckCircle2, ArrowRight, ShieldCheck, Sun } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";
import { getUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Html5Qrcode } from "html5-qrcode";

export default function WorkerHomePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<{
    check_in_time: string | null;
    check_out_time: string | null;
    hours_worked: number | null;
  } | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [wageRate, setWageRate] = useState<number | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingScanRef = useRef(false);
  const todayDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const loadTodayAttendance = async (currentEmployeeId: string) => {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("id, check_in_time, check_out_time, hours_worked, status")
      .eq("employee_id", currentEmployeeId)
      .eq("date", todayDate())
      .maybeSingle();
    if (error) throw error;
    setTodayRecord(data);
    setIsCheckedIn(Boolean(data?.check_in_time && !data?.check_out_time));
    return data;
  };

  useEffect(() => {
    getUserProfile().then(async (profile) => {
      if (!profile.employeeId || !profile.orgId) return;
      setEmployeeId(profile.employeeId);
      setOrgId(profile.orgId);
      setWorkerName(profile.name || "");
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("wage_rate")
        .eq("auth_user_id", profile.userId)
        .single();
      if (employeeError) throw employeeError;
      setWageRate(employee?.wage_rate ?? null);
      await loadTodayAttendance(profile.employeeId);
    }).catch((error) => setMessage(error.message));

    return () => {
      scannerRef.current?.stop().catch((error) => console.error("Error stopping QR scanner:", error));
      scannerRef.current?.clear();
    };
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (employeeId) {
        loadTodayAttendance(employeeId).catch((error) =>
          console.error("Error refreshing today's attendance:", error)
        );
      }
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [employeeId]);

  const scanQrCode = async () => {
    if (!employeeId || !orgId) {
      setMessage("Your employee profile is not ready yet.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("[QR] Camera API unavailable", {
        secureContext: window.isSecureContext,
        userAgent: navigator.userAgent,
      });
      setMessage("Camera access requires HTTPS and a supported mobile browser.");
      return;
    }

    const freshRecord = await loadTodayAttendance(employeeId);
    if (freshRecord?.check_in_time && freshRecord.check_out_time) {
      setMessage("आज की उपस्थिति पूरी हो गई है / Today's attendance is already complete");
      return;
    }

    setMessage(null);
    setScanning(true);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    const scanner = new Html5Qrcode("wageeasy-qr-reader");
    scannerRef.current = scanner;
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (processingScanRef.current) return;
        console.log("[QR] Success callback triggered:", decodedText);
        let scannedOrgId: string | null = null;
        try {
          scannedOrgId = new URL(decodedText).searchParams.get("org_id");
        } catch {
          console.warn("[QR] Ignoring invalid QR payload:", decodedText);
        }
        if (scannedOrgId !== orgId) {
          console.warn("[QR] Organization mismatch:", { scannedOrgId, workerOrgId: orgId });
          return;
        }

        processingScanRef.current = true;
        try {
          const freshRecord = await loadTodayAttendance(employeeId);
          if (freshRecord?.check_in_time && freshRecord.check_out_time) {
            setMessage("आज की उपस्थिति पूरी हो गई है / Today's attendance is already complete");
            setScanning(false);
            await scanner.stop();
            scanner.clear();
            scannerRef.current = null;
            return;
          }
          const checkOutTime = freshRecord?.check_in_time ? new Date().toISOString() : undefined;
          const response = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employee_id: employeeId,
              org_id: orgId,
              check_out_time: checkOutTime,
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to record attendance.");
          console.log("[QR] Attendance write completed:", result.data);
          const eventTime = checkOutTime || result.data?.check_in_time;
          await loadTodayAttendance(employeeId);
          setMessage(
            checkOutTime
              ? `Checked out at ${new Date(eventTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`
              : `Checked in at ${new Date(eventTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`
          );
          setScanning(false);
          await scanner.stop();
          scanner.clear();
          scannerRef.current = null;
        } catch (error) {
          console.error("[QR] Attendance write failed:", error);
          setMessage(error instanceof Error ? error.message : "Unable to record attendance.");
          processingScanRef.current = false;
        }
      },
      (errorMessage) => {
        console.debug("[QR] Scan frame error:", errorMessage);
      }
    ).catch((error) => {
      console.error("[QR] Scanner failed to start:", error);
      setScanning(false);
      setMessage(`Unable to open camera: ${error.message || error}`);
      scanner.clear();
      scannerRef.current = null;
    });
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
            {workerName || "Loading employee..."}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Daily Wage: <strong className="text-slate-800 font-bold">
              {wageRate === null ? "Loading..." : `₹ ${wageRate}`}
            </strong>
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
            {todayRecord?.check_out_time
              ? `Day complete — worked ${Number(todayRecord.hours_worked || 0).toFixed(2)} hours`
              : isCheckedIn
              ? `Checked In at ${new Date(todayRecord?.check_in_time || "").toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
              : "Not Checked In Today"}
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
            onClick={scanQrCode}
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
        {scanning && <div id="wageeasy-qr-reader" className="mx-auto w-full max-w-sm overflow-hidden rounded-xl" />}
        {message && <p className="text-sm font-semibold text-slate-700">{message}</p>}

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
            {Number(todayRecord?.hours_worked || 0).toFixed(2)} hrs
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
