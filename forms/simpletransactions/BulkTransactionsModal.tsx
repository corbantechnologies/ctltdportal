"use client";

import { useState } from "react";
import { Grid, FileSpreadsheet, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import BulkCreateSimpleTransaction from "./BulkCreateSimpleTransaction";
import BulkImportSimpleTransaction from "./BulkImportSimpleTransaction";

interface BulkTransactionsModalProps {
  initialTab?: "grid" | "csv";
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function BulkTransactionsModal({
  initialTab = "grid",
  onSuccess,
  onClose,
}: BulkTransactionsModalProps) {
  const [activeTab, setActiveTab] = useState<"grid" | "csv">(initialTab);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Unified Top Studio Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex-shrink-0 text-white shadow-md">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Batch Transactions Studio
                <span className="text-[10px] font-normal text-slate-400 hidden md:inline">
                  (Auto-generates double-entry journals)
                </span>
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTab === "grid"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <Grid className="w-3.5 h-3.5 text-slate-700" />
              <span>Interactive Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTab === "csv"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
              <span>CSV Import</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500 text-slate-300 hover:text-white transition-all text-xs font-semibold active:scale-95"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Body taking remaining full viewport height */}
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
        {activeTab === "grid" ? (
          <BulkCreateSimpleTransaction onSuccess={onSuccess} onClose={onClose} />
        ) : (
          <BulkImportSimpleTransaction onSuccess={onSuccess} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
