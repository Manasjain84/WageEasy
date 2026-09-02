import React, { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "worker-large";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 rounded-lg px-4 py-2.5 text-sm md:text-base font-semibold shadow-sm",
    secondary:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 rounded-lg px-4 py-2.5 text-sm md:text-base font-semibold",
    outline:
      "border-2 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-slate-400 rounded-lg px-4 py-2 text-sm md:text-base font-semibold",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 rounded-lg px-4 py-2.5 text-sm md:text-base font-semibold",
    "worker-large":
      "w-full py-5 px-6 rounded-2xl text-xl font-bold tracking-wide shadow-md bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-4 focus:ring-emerald-300 border-2 border-emerald-700 flex items-center justify-center gap-3",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
