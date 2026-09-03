"use client";

import React, { useEffect, useState } from "react";
import { Settings, Copy, Check, Save } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { getUserProfile } from "@/lib/auth";
import QRCode from "qrcode";

export default function EmployerSettingsPage() {
  const [orgName, setOrgName] = useState("Precision Manufacturing Pvt Ltd");
  const [orgAddress, setOrgAddress] = useState("Plot 42, Industrial Area Phase II, Gurugram, Haryana");
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [dailyHours, setDailyHours] = useState(8);
  const [otMultiplier, setOtMultiplier] = useState(1.5);
  const [workDays, setWorkDays] = useState(26);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganization() {
      const profile = await getUserProfile();
      if (!profile.orgId) {
        throw new Error("Unable to determine the current organization.");
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("join_code")
        .eq("id", profile.orgId)
        .single();

      if (error) {
        throw error;
      }

      setOrgId(profile.orgId);
      setJoinCode(data.join_code.trim().toUpperCase());
      setQrCodeUrl(await QRCode.toDataURL(`wageeasy://check-in?org_id=${profile.orgId}`));
    }

    loadOrganization().catch((error) => {
      console.error("Error loading organization join code:", error);
    });
  }, []);

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Factory & Wage Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure organization identity, employee onboarding join codes, and overtime calculation rules
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Join Code Card */}
        <Card
          title="Factory Join Code"
          subtitle="Share this unique 6-character code with new workers to allow them to register and join your organization."
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Active Join Code
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-950 tracking-widest mt-0.5">
                {joinCode || "Loading..."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Code"}</span>
            </button>
          </div>
          {qrCodeUrl && (
            <div className="mt-4 text-center">
              <img src={qrCodeUrl} alt="Factory attendance QR code" className="mx-auto w-48 h-48" />
              <p className="text-xs text-slate-500 mt-2">Workers scan this code to check in.</p>
            </div>
          )}
        </Card>

        {/* General Details Card */}
        <Card title="Organization Profile" subtitle="General company information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Organization / Factory Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Factory Address
              </label>
              <textarea
                rows={3}
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Wage Rules Card */}
        <Card
          title="Attendance & Overtime Rules"
          subtitle="Standard rules applied during automated payroll processing"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Standard Daily Hours
              </label>
              <input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                min={1}
                max={24}
                required
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">Hours before OT kicks in</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Overtime Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                value={otMultiplier}
                onChange={(e) => setOtMultiplier(Number(e.target.value))}
                min={1}
                max={3}
                required
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">e.g. 1.5x hourly rate</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Monthly Work Days
              </label>
              <input
                type="number"
                value={workDays}
                onChange={(e) => setWorkDays(Number(e.target.value))}
                min={1}
                max={31}
                required
                className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">Days per standard month</p>
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
          {saved && (
            <span className="text-sm font-bold text-emerald-600 animate-fade-in flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
