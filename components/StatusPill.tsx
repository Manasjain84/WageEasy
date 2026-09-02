import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type StatusType =
  | "present"
  | "absent"
  | "incomplete"
  | "pending"
  | "active"
  | "inactive"
  | "draft"
  | "approved"
  | "paid";

interface StatusPillProps {
  status: StatusType | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  className,
  size = "md",
}) => {
  const normalized = status.toLowerCase();

  const statusStyles: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-800 border-emerald-300",
    active: "bg-emerald-100 text-emerald-800 border-emerald-300",
    paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
    approved: "bg-blue-100 text-blue-800 border-blue-300",
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    incomplete: "bg-amber-100 text-amber-800 border-amber-300",
    draft: "bg-slate-100 text-slate-800 border-slate-300",
    absent: "bg-red-100 text-red-800 border-red-300",
    inactive: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded",
    md: "px-2.5 py-1 text-xs md:text-sm font-semibold rounded-full",
    lg: "px-3.5 py-1.5 text-sm md:text-base font-bold rounded-full",
  };

  const currentStyle =
    statusStyles[normalized] || "bg-slate-100 text-slate-800 border-slate-300";

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 border capitalize tracking-wide",
          currentStyle,
          sizeStyles[size],
          className
        )
      )}
    >
      <span
        className={clsx("h-2 w-2 rounded-full", {
          "bg-emerald-500": ["present", "active", "paid"].includes(normalized),
          "bg-blue-500": ["approved"].includes(normalized),
          "bg-amber-500": ["pending", "incomplete"].includes(normalized),
          "bg-red-500": ["absent"].includes(normalized),
          "bg-slate-400": !["present", "active", "paid", "approved", "pending", "incomplete", "absent"].includes(normalized),
        })}
      />
      {status}
    </span>
  );
};
