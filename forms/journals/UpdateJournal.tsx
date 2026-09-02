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
        "mx-auto border border-slate-200 shadow-2xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-xl",
        className
      )}
    >
      <div className="bg-slate-50/50 p-4 sm:p-6 border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-lg shadow-black/20 ring-2 ring-black/5 flex-shrink-0">
            <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Update Journal Batch
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Refine Transaction Batch
            </p>
          </div>
          {onClose && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 p-2 transition-colors group active:scale-95"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto">
        {/* Static info - ALWAYS STACKED */}
        <div className="space-y-4 mb-8">
          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-1.5 shadow-sm group hover:border-slate-200 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-0.5">
              Batch Reference
            </p>
            <p className="font-bold text-slate-800 break-all text-sm leading-relaxed">
              {journal.reference}
            </p>
          </div>
          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-1.5 shadow-sm group hover:border-slate-200 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-0.5">
              Journal Category
            </p>
            <p className="font-bold text-slate-800 text-sm">
              {journal.journal_type}
            </p>
          </div>
        </div>

        {/* Editable fields */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label
              htmlFor="date"
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1.5"
            >
              Transaction Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 w-full h-14 rounded-2xl focus:bg-white focus:border-emerald-600 focus:shadow-sm transition-all font-bold px-6 text-sm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
            />
          </div>

          <div className="space-y-2.5">
            <label
              htmlFor="description"
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1.5"
            >
              Batch Description
            </label>
            <textarea
              id="description"
              name="description"
              className="border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 w-full min-h-[140px] rounded-2xl focus:bg-white focus:border-emerald-600 focus:shadow-sm transition-all font-bold p-6 text-sm resize-none leading-relaxed"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              placeholder="Describe the transaction batch..."
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1.5">
              Base Currency
            </label>
            <div className="relative">
              <select
                name="currency"
                className="focus:outline-none focus:ring-4 focus:ring-emerald-600/10 flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 text-sm font-bold focus:bg-white focus:border-emerald-600 transition-all appearance-none"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.currency}
              >
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-black hover:to-slate-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-[0_8px_16px_-6px_rgba(5,150,105,0.4)] active:scale-[0.98] active:shadow-inner group flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin text-white/80" />
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Update Batch Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
