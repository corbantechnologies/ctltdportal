/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, CalendarRange, Plus, X } from "lucide-react";
import { useCreateFinancialYear } from "@/hooks/financialyears/actions";

interface CreateFiscalYearProps {
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function CreateFiscalYear({
  onSuccess,
  onClose,
  className,
}: CreateFiscalYearProps) {
  const createMutation = useCreateFinancialYear();

  const primaryColor = "#D0402B"; // Director's Theme Color

  const formik = useFormik({
    initialValues: {
      code: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      estimated_profit: 0,
      is_active: true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await createMutation.mutateAsync(values);
        toast.success("Fiscal Year initialized successfully");
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to initialize fiscal year",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className={`mx-auto w-full border-black/5 shadow-2xl rounded overflow-hidden bg-white/80 backdrop-blur-xl flex flex-col ${className}`}
    >
      <div className="p-8 border-b border-black/5 bg-gradient-to-r from-white to-gray-50/50 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded flex items-center justify-center text-white shadow-lg"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 15px -3px ${primaryColor}4D`,
              }}
            >
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black tracking-tight">
                Initialize Fiscal Year
              </h2>
              <p className="text-black/50 font-medium text-sm mt-1">
                New Accounting Cycle
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-red-50 hover:text-red-500 rounded text-black/40 p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-8 overflow-y-auto max-h-[min(80vh,600px)]">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-semibold uppercase tracking-widest text-black/40 ml-1 flex items-center gap-1"
              >
                Fiscal Code{" "}
                <span className="text-red-500 text-xs font-semibold">*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                placeholder="e.g., FY2025/2026"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full h-14 rounded focus:bg-slate-50 transition-all font-medium px-5 text-black"
                onChange={formik.handleChange}
                value={formik.values.code}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="estimated_profit"
                className="text-sm font-semibold uppercase tracking-widest text-black/40 ml-1 flex items-center gap-1"
              >
                Estimated Profit (Baseline)
              </label>
              <input
                id="estimated_profit"
                name="estimated_profit"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full h-14 rounded focus:bg-slate-50 transition-all font-medium px-5 text-black"
                onChange={formik.handleChange}
                value={formik.values.estimated_profit}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="start_date"
                className="text-sm font-semibold uppercase tracking-widest text-black/40 ml-1 flex items-center gap-1"
              >
                Cycle Start Date{" "}
                <span className="text-red-500 text-xs font-semibold">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full h-14 rounded focus:bg-slate-50 transition-all font-medium px-5 text-black"
                onChange={formik.handleChange}
                value={formik.values.start_date}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="end_date"
                className="text-sm font-semibold uppercase tracking-widest text-black/40 ml-1 flex items-center gap-1"
              >
                Cycle End Date{" "}
                <span className="text-red-500 text-xs font-semibold">*</span>
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                required
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full h-14 rounded focus:bg-slate-50 transition-all font-medium px-5 text-black"
                onChange={formik.handleChange}
                value={formik.values.end_date}
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-16 text-white rounded font-semibold text-lg transition-all shadow-xl active:scale-[0.98] group flex items-center justify-center"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 20px -5px ${primaryColor}4D`,
              }}
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Initialize Fiscal Cycle
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
