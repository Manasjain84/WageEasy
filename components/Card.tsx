import React, { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 transition-all",
          className
        )
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-2 border-b border-slate-100">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-bold text-slate-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
