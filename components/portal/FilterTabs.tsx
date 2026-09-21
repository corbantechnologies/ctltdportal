"use client";

import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
}

export default function FilterTabs({
  tabs,
  activeTab,
  onChange,
  size = "md",
}: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
              size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-xs",
              isActive
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
