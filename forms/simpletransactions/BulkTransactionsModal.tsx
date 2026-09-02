"use client";

import { useState } from "react";
import { Grid, FileSpreadsheet, X } from "lucide-react";
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
    <div className="mx-auto w-full max-w-6xl">
      {/* Modal Tab Switcher */}
      <div className="flex items-center justify-between bg-slate-900 px-6 py-2.5 rounded-t-lg border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("grid")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === "grid"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Grid className="w-3.5 h-3.5" />
            Batch Grid Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === "csv"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV File Import
          </button>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Body */}
      {activeTab === "grid" ? (
        <BulkCreateSimpleTransaction onSuccess={onSuccess} onClose={onClose} />
      ) : (
        <BulkImportSimpleTransaction onSuccess={onSuccess} onClose={onClose} />
      )}
    </div>
  );
}
