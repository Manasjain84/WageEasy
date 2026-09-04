"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Factory, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { supabase } from "@/lib/supabase";
import { getUserProfile, setAuthCookies } from "@/lib/auth";
import { useTranslation } from "@/components/I18nProvider";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg(t("common.validEmail"));
      return;
    }

    if (!password) {
      setErrorMsg(t("common.passwordRequired"));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Query user's role and organization status
        const profile = await getUserProfile(data.user.id);
        profile.email = cleanEmail;
        setAuthCookies(profile);

        if (profile.role === "employer") {
          router.push("/dashboard");
          return;
        }

        if (profile.role === "worker") {
          if (profile.status === "active") {
            router.push("/home");
          } else {
            // Worker is pending approval or inactive
            router.push("/signup");
          }
          return;
        }

        // New user without an organization or employee profile
        router.push("/signup");
      }
    } catch (err: any) {
      const message =
        err.message === "Invalid login credentials"
          ? t("common.invalidCredentials")
          : err.message || t("common.signInFailed");
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-sm mb-3">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t("login.welcome")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("login.subtitle")}
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md">
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t("common.email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder={t("common.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t("common.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-300 rounded-xl text-base text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <span>{t("common.login")}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              {t("login.newUser")}{" "}
              <Link
                href="/signup"
                className="font-bold text-emerald-600 hover:underline"
              >
                {t("common.signup")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
