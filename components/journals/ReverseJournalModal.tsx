"use client";

import { useState, useEffect } from "react";
import {
  RotateCcw,
  X,
  AlertTriangle,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReverseJournalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  originalCode: string;
  originalDate: string;
  amount?: string | number;
  description?: string;
  onConfirm: (data: { reversal_date: string; reason: string }) => Promise<void>;
  isLoading?: boolean;
}

export default function ReverseJournalModal({
  open,
  onClose,
  title,
  originalCode,
  originalDate,
  amount,
  description,
  onConfirm,
  isLoading = false,
}: ReverseJournalModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [reversalDate, setReversalDate] = useState(today);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReversalDate(today);
      setReason("");
      setError(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open, today]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for the reversal.");
      return;
    }
    if (!reversalDate) {
      setError("Please select a reversal date.");
      return;
    }
    setError(null);
    try {
      await onConfirm({ reversal_date: reversalDate, reason: reason.trim() });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to process reversal.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">{title}</h3>
              <p className="text-[10px] text-slate-400 font-mono">Target Record: {originalCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Explanatory Warning Banner */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 leading-relaxed">
              <strong>Audit Notice:</strong> This action voids the transaction by posting an exact offsetting entry to the General Ledger. The record will be locked and marked as <strong>REVERSED</strong>.
            </div>
          </div>

          {/* Record Summary */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Original Date:</span>
              <span className="font-semibold text-slate-900">{originalDate}</span>
            </div>
            {amount !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold font-mono text-slate-900">KES {Number(amount).toLocaleString()}</span>
              </div>
            )}
            {description && (
              <div className="flex justify-between">
                <span className="text-slate-500">Description:</span>
                <span className="font-medium text-slate-700 truncate max-w-[240px]">{description}</span>
              </div>
            )}
          </div>

          {/* Reversal Date Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Reversal Posting Date *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReversalDate(today)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-semibold transition-all border",
                    reversalDate === today
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  Today
                </button>
                {originalDate && (
                  <button
                    type="button"
                    onClick={() => setReversalDate(originalDate)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-semibold transition-all border",
                      reversalDate === originalDate
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Original Date
                  </button>
                )}
              </div>
            </div>
            <input
              type="date"
              value={reversalDate}
              onChange={(e) => setReversalDate(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
            />
            <p className="text-[10px] text-slate-400">
              Note: The date must fall in an active/open financial month.
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Reason for Reversal *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={2}
              placeholder="e.g. Duplicate transaction logged, wrong amount, or incorrect ledger account..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 h-9 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-rose-600/20 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm & Reverse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
