"use client";

import React, { useEffect, useRef, useState } from "react";
import { QrCode, Clock, CheckCircle2, ArrowRight, ShieldCheck, Sun } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusPill } from "@/components/StatusPill";
import { getUserProfile } from "@/lib/auth";

export default function WorkerHomePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [liveHours] = useState("0h 00m");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    getUserProfile().then(async (profile) => {
      if (!profile.employeeId || !profile.orgId) return;
      setEmployeeId(profile.employeeId);
      setOrgId(profile.orgId);
      const response = await fetch(
        `/api/attendance?org_id=${encodeURIComponent(profile.orgId)}&date=${new Date().toISOString().split("T")[0]}`
      );
      if (!response.ok) throw new Error("Unable to load today's attendance.");
      const result = await response.json();
      setIsCheckedIn(
        result.data?.some(
          (record: { employee_id: string; check_in_time: string | null }) =>
            record.employee_id === profile.employeeId && record.check_in_time
        ) || false
      );
    }).catch((error) => setMessage(error.message));

    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const scanQrCode = async () => {
    if (!employeeId || !orgId) {
      setMessage("Your employee profile is not ready yet.");
      return;
    }
    const BarcodeDetectorClass = (
      window as Window & {
        BarcodeDetector?: new (options?: { formats: string[] }) => {
          detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
        };
      }
    ).BarcodeDetector;
    if (!BarcodeDetectorClass) {
      setMessage("QR scanning is not supported by this browser.");
      return;
    }

    setMessage(null);
    setScanning(true);
    scanningRef.current = true;
    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
    }

    const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });
    const scan = async () => {
      if (!videoRef.current || !scanningRef.current) return;
      const codes = await detector.detect(videoRef.current);
      if (codes[0]?.rawValue === `wageeasy://check-in?org_id=${orgId}`) {
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: employeeId, org_id: orgId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to record attendance.");
        setIsCheckedIn(true);
        setMessage("Check-in recorded successfully.");
        setScanning(false);
        scanningRef.current = false;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        return;
      }
      window.setTimeout(scan, 250);
    };
    scan().catch((error) => {
      setScanning(false);
      scanningRef.current = false;
      setMessage(error.message);
      streamRef.current?.getTracks().forEach((track) => track.stop());
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
        {scanning && <video ref={videoRef} className="mx-auto w-full max-w-sm rounded-xl" />}
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
