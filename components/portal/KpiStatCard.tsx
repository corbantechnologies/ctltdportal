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
    bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    glow: "group-hover:shadow-emerald-500/10",
    accentText: "text-emerald-600",
  },
  blue: {
    bg: "from-blue-500/10 via-blue-500/5 to-transparent",
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconBg: "bg-blue-50 text-blue-600 border-blue-200",
    glow: "group-hover:shadow-blue-500/10",
    accentText: "text-blue-600",
  },
  purple: {
    bg: "from-purple-500/10 via-purple-500/5 to-transparent",
    border: "border-purple-500/20 hover:border-purple-500/40",
    iconBg: "bg-purple-50 text-purple-600 border-purple-200",
    glow: "group-hover:shadow-purple-500/10",
    accentText: "text-purple-600",
  },
  amber: {
    bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    border: "border-amber-500/20 hover:border-amber-500/40",
    iconBg: "bg-amber-50 text-amber-600 border-amber-200",
    glow: "group-hover:shadow-amber-500/10",
    accentText: "text-amber-600",
  },
  rose: {
    bg: "from-rose-500/10 via-rose-500/5 to-transparent",
    border: "border-rose-500/20 hover:border-rose-500/40",
    iconBg: "bg-rose-50 text-rose-600 border-rose-200",
    glow: "group-hover:shadow-rose-500/10",
    accentText: "text-rose-600",
  },
  slate: {
    bg: "from-slate-500/10 via-slate-500/5 to-transparent",
    border: "border-slate-200 hover:border-slate-300",
    iconBg: "bg-slate-100 text-slate-700 border-slate-200",
    glow: "group-hover:shadow-slate-500/10",
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
        "group relative overflow-hidden rounded-xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        style.border,
        style.glow
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none",
          style.bg
        )}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div
            className={cn(
              "w-9 h-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
              style.iconBg
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold tracking-tight text-slate-900">
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
                    "inline-flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded",
                    trend.isPositive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
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
