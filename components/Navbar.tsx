"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Factory,
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Home,
  Clock,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { UserRole } from "@/lib/supabase";

interface NavbarProps {
  role?: UserRole;
  orgName?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  role = "employer",
  orgName = "Factory App",
  userName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const employerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/payroll", label: "Payroll", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const workerLinks = [
    { href: "/home", label: "Attendance", icon: Home },
    { href: "/history", label: "My History", icon: Clock },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const links = role === "employer" ? employerLinks : workerLinks;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href={role === "employer" ? "/dashboard" : "/home"}
              className="flex items-center gap-2 font-bold text-lg md:text-xl tracking-tight text-white hover:text-emerald-400 transition-colors"
            >
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <Factory className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span>WageEasy</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {orgName}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {userName && (
              <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                {userName} ({role})
              </span>
            )}
            <Link
              href="/login"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium",
                  isActive
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
            {userName && (
              <span className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{userName}</strong>
              </span>
            )}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1 text-sm text-red-400 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
