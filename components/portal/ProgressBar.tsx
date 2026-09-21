"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // percentage from 0 to 100
  max?: number;
  label?: string;
  subLabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "emerald" | "blue" | "amber" | "rose" | "purple";
  showPercent?: boolean;
}

const colorMap = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  purple: "bg-purple-500",
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  subLabel,
  size = "md",
  color = "emerald",
  showPercent = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercent || subLabel) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-600 truncate">{label}</span>}
          <div className="flex items-center gap-2 ml-auto">
            {subLabel && <span className="text-slate-400 font-mono text-[11px]">{subLabel}</span>}
            {showPercent && (
              <span className="font-mono text-slate-700 font-bold text-[11px]">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
