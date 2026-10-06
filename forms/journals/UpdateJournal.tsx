/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updateJournal } from "@/services/journals";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Edit3, Save, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { formatBackendError } from "@/lib/error-handler";
import { cn } from "@/lib/utils";

interface UpdateJournalProps {
  journal: {
    reference: string;
    date: string;
    description: string;
    currency: string;
    journal_type: string;
  };
  onClose?: () => void;
  className?: string;
}

/* -------------------------------------------------------------
   NO VALIDATION SCHEMA – form always submits when the button is
   pressed (you can add server-side checks in the API if you need)
   ------------------------------------------------------------- */
export default function UpdateJournal({
  journal,
  onClose,
  className,
}: UpdateJournalProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      date: new Date(journal.date).toISOString().split("T")[0],
      description: journal.description,
      currency: journal.currency,
    },
    enableReinitialize: true,
    // ----> NO validationSchema <----
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateJournal(
          journal.reference,
          values,
          header,
        );
        toast.success("Journal batch updated successfully");
        queryClient.invalidateQueries({ queryKey: ["journals"] });
        queryClient.invalidateQueries({
          queryKey: ["journal", journal.reference],
        });
        router.refresh();
        onClose?.();
      } catch (error: any) {
        toast.error(
          formatBackendError(error, "Failed to update journal batch")
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className={cn(
        "mx-auto border border-slate-200 rounded overflow-hidden bg-white flex flex-col",
        className
      )}
    >
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white flex-shrink-0">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Edit Journal Batch Details
            </h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase">
              Ref: {journal.reference}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3.5 overflow-y-auto">
        {/* Static batch info */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Category</span>
            <span className="font-semibold text-slate-800">{journal.journal_type}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Reference</span>
            <span className="font-mono text-slate-800 truncate block">{journal.reference}</span>
          </div>
        </div>

        {/* Editable fields */}
        <form id="update-journal-form" onSubmit={formik.handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="date"
              className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5"
            >
              Transaction Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="border border-slate-300 bg-white focus:outline-none focus:border-slate-800 w-full h-8 rounded px-2.5 text-xs font-medium text-slate-900 transition-colors"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5"
            >
              Batch Narrative / Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="border border-slate-300 bg-white focus:outline-none focus:border-slate-800 w-full rounded p-2 text-xs font-medium text-slate-900 resize-none transition-colors"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              placeholder="Describe the transaction batch..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">
              Currency
            </label>
            <select
              name="currency"
              className="border border-slate-300 bg-white focus:outline-none focus:border-slate-800 w-full h-8 rounded px-2 text-xs font-medium text-slate-900 transition-colors"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.currency}
            >
              <option value="KES">KES (Kenyan Shilling)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
        </form>
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          form="update-journal-form"
          disabled={formik.isSubmitting}
          className="h-8 px-4 bg-slate-900 hover:bg-black text-white rounded text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {formik.isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
