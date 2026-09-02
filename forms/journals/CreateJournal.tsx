/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createJournal } from "@/services/journals";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Book, Plus, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useQueryClient } from "@tanstack/react-query";
import SearchableSelect from "@/components/portal/SearchableSelect";
import { formatBackendError } from "@/lib/error-handler";

interface CreateJournalProps {
  initialJournalType?: string;
  fiscalYear?: string;
  rolePrefix?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  refetch: (options?: any) => Promise<any>;
}

export default function CreateJournal({
  initialJournalType,
  fiscalYear,
  rolePrefix = "finance",
  onSuccess,
  onClose,
  className,
  refetch,
}: CreateJournalProps) {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const { data: journalTypes, isLoading: isLoadingTypes } =
    useFetchJournalTypes();

  const formik = useFormik({
    initialValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      journal_type: initialJournalType || "",
      currency: "KES",
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await createJournal(values, header);
        toast.success("Journal batch created successfully");
        queryClient.invalidateQueries({ queryKey: ["journals"] });
        refetch();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(
          formatBackendError(error, "Failed to create journal batch")
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const categoryOptions = journalTypes?.map((t) => ({
    value: t.name,
    label: t.name,
    secondaryLabel: t.code,
  })) || [];

  return (
    <div
      className={cn(
        "mx-auto w-full border border-slate-200 shadow-2xl rounded overflow-hidden bg-white",
        className
      )}
    >
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center text-white shadow-lg flex-shrink-0"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 16px -4px ${primaryColor}80`,
              }}
            >
              <Book className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Initialize Journal Batch
              </h2>
              <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-widest mt-0.5">
                Header Reconciliation Unit
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-red-50 hover:text-red-500 rounded text-slate-300 p-2 transition-all active:scale-95 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 pb-8 overflow-y-auto">
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1"
              >
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 w-full h-14 rounded focus:bg-white focus:border-emerald-600 transition-all font-semibold px-5 text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.date}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-medium ml-1">
                The system will automatically link this to the correct Financial Year & Month.
              </p>
            </div>

            <SearchableSelect
              label="Journal Category"
              options={categoryOptions}
              value={formik.values.journal_type}
              onChange={(val) => formik.setFieldValue("journal_type", val)}
              placeholder="Select Category..."
              required
              disabled={isLoadingTypes}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1"
            >
              Batch Narrative <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              placeholder="Provide a clear description of this journal batch (e.g., 'Jan 2026 Admin Expenses')"
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 w-full min-h-[120px] rounded focus:bg-white focus:border-emerald-600 transition-all font-semibold p-5 text-sm resize-none"
              onChange={formik.handleChange}
              value={formik.values.description}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label
                htmlFor="currency"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1"
              >
                Base Currency <span className="text-red-500">*</span>
              </label>
              <select
                name="currency"
                required
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 w-full h-14 rounded focus:bg-white focus:border-emerald-600 transition-all font-semibold px-5 text-sm appearance-none"
                onChange={formik.handleChange}
                value={formik.values.currency}
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-14 text-white rounded font-bold text-sm transition-all shadow-lg active:scale-[0.98] group flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 20px -5px ${primaryColor}60`,
              }}
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>INITIALIZE BATCH</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
