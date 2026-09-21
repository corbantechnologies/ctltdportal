"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: "emerald" | "blue" | "purple" | "amber" | "rose" | "slate";
  badge?: ReactNode;
}

const colorStyles = {
  emerald: {
    bg: "bg-emerald-50/40",
    border: "border-emerald-200/80 hover:border-emerald-300",
    iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentText: "text-emerald-700",
  },
  blue: {
    bg: "bg-blue-50/40",
    border: "border-blue-200/80 hover:border-blue-300",
    iconBg: "bg-blue-50 text-blue-700 border-blue-200",
    accentText: "text-blue-700",
  },
  purple: {
    bg: "bg-purple-50/40",
    border: "border-purple-200/80 hover:border-purple-300",
    iconBg: "bg-purple-50 text-purple-700 border-purple-200",
    accentText: "text-purple-700",
  },
  amber: {
    bg: "bg-amber-50/40",
    border: "border-amber-200/80 hover:border-amber-300",
    iconBg: "bg-amber-50 text-amber-700 border-amber-200",
    accentText: "text-amber-700",
  },
  rose: {
    bg: "bg-rose-50/40",
    border: "border-rose-200/80 hover:border-rose-300",
    iconBg: "bg-rose-50 text-rose-700 border-rose-200",
    accentText: "text-rose-700",
  },
  slate: {
    bg: "bg-slate-50/40",
    border: "border-slate-200 hover:border-slate-300",
    iconBg: "bg-slate-100 text-slate-700 border-slate-200",
    accentText: "text-slate-700",
  },
};

export default function KpiStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "slate",
  badge,
}: KpiStatCardProps) {
  const style = colorStyles[accentColor];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white p-4 sm:p-5 transition-all duration-200 hover:shadow-sm",
        style.border
      )}
    >
      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div
            className={cn(
              "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-none",
              style.iconBg
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </div>
          {(subtitle || trend || badge) && (
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              {subtitle && (
                <span className="text-slate-500 font-medium truncate text-[11px]">
                  {subtitle}
                </span>
              )}
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded border tabular-nums",
                    trend.isPositive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
              )}
              {badge && <div>{badge}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
