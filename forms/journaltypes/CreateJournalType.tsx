"use client";

import { createJournalType } from "@/services/journaltypes";
import { useFormik } from "formik";
import { JournalTypeSchema } from "@/validation";
import { toast } from "react-hot-toast";
import { Loader2, Settings2, Plus, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CreateJournalTypeProps {
  rolePrefix?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function CreateJournalType({
  rolePrefix = "finance",
  onSuccess,
  onClose,
  className,
}: CreateJournalTypeProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const primaryColorClass = rolePrefix === "director" ? "bg-corporate-primary" : "bg-emerald-600";
  const primaryTextClass = rolePrefix === "director" ? "text-corporate-primary" : "text-emerald-600";
  const primaryShadowClass = rolePrefix === "director" ? "shadow-corporate-primary/20" : "shadow-emerald-600/20";

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      is_active: true,
    },
    validationSchema: JournalTypeSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createJournalType(values, header);
        toast.success("Transaction type defined successfully");
        queryClient.invalidateQueries({ queryKey: ["journal_types"] });
        resetForm();
        router.refresh();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to define transaction type",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className={cn("w-full bg-white rounded shadow overflow-hidden", className)}>
      <div className="bg-slate-900 p-4 text-white relative">
        <div className={cn("absolute top-0 right-0 w-32 h-32 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20", rolePrefix === "director" ? "bg-corporate-primary" : "bg-emerald-600")} />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded flex items-center justify-center text-white border border-white/10 backdrop-blur-md shadow-lg", primaryColorClass)}>
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl">
                Define <span className={primaryTextClass}>Journal Type</span>
              </h2>
              <p className="text-slate-400 text-[10px] mt-1">
                Ledger Classification Logic
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm ml-1 block"
              >
                Nomenclature <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Accrual, Fixed Asset, Disbursement"
                className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-slate-50 focus:border-emerald-600/30 focus:ring-0 transition-all font-semibold px-6 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-transparent"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1 mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm ml-1 block"
              >
                Functional Definition <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                placeholder="Provide a comprehensive operational definition for this journal type..."
                className="w-full min-h-[140px] rounded border border-slate-200 bg-slate-50 focus:bg-slate-50 focus:border-emerald-600/30 focus:ring-0 transition-all font-semibold p-6 text-sm text-slate-900 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-transparent"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
              />
            </div>
          </div>

          <div
            className="flex items-center gap-4 p-4 bg-slate-50 rounded border border-slate-100 hover:border-slate-200 transition-colors group cursor-pointer"
            onClick={() => formik.setFieldValue("is_active", !formik.values.is_active)}
          >
            <div className={cn(
              "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
              formik.values.is_active ? cn(primaryColorClass, "border-transparent shadow-lg", primaryShadowClass) : "bg-white border-slate-200"
            )}>
              {formik.values.is_active && <Plus className="w-4 h-4 text-white rotate-45" />}
            </div>
            <div>
              <span className="text-sm block cursor-pointer">
                Enable for Operations
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Authorized for live transactional ledger use
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={cn(
                "w-full h-10 text-white rounded text-base transition-all shadow-xl active:scale-[0.98] group relative overflow-hidden",
                primaryColorClass,
                primaryShadowClass,
                "hover:brightness-110"
              )}
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Define Transaction Type
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
