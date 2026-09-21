/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updateCOA } from "@/services/coa";
import { useFormik } from "formik";
import { COASchema } from "@/validation";




import { toast } from "react-hot-toast";
import { Loader2, Edit3, Save, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateCOAProps {
  coa: {
    code: string;
    name: string;
    normal_balance: string;
    order: number;
    report_role: string;
    is_active: boolean;
    reference: string;
  };
  rolePrefix?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function UpdateCOA({
  coa,
  rolePrefix = "finance",
  onSuccess,
  onClose,
  className,
}: UpdateCOAProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const formik = useFormik({
    initialValues: {
      code: coa.code,
      name: coa.name,
      normal_balance: coa.normal_balance,
      order: coa.order,
      report_role: coa.report_role,
      is_active: coa.is_active,
    },
    enableReinitialize: true,
    validationSchema: COASchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateCOA(coa.reference, values, header);
        toast.success("Account updated successfully");
        queryClient.invalidateQueries({ queryKey: ["coas"] });
        queryClient.invalidateQueries({ queryKey: ["coa", coa.reference] });
        if (onSuccess) onSuccess();
        router.refresh();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to update account",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const reportRoles = [
    "ASSET",
    "LIABILITY",
    "EQUITY",
    "REVENUE",
    "EXPENSE",
    "COGS",
    "OTHER_INCOME",
    "NON_OPERATING_EXPENSE",
    "CAPITAL_EXPENDITURE",
    "NONE",
  ];

  return (
    <div
      className={`mx-auto w-full border-black/5 shadow-2xl rounded overflow-hidden bg-white/80 backdrop-blur-xl ${className}`}
    >
      <div
        className="p-4 sm:p-5 border-b border-black/5"
        style={{ backgroundColor: `${primaryColor}0D` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-white shadow-md"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 6px -1px ${primaryColor}4D`,
              }}
            >
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black tracking-tight">
                Update Account
              </h2>
              <p className="text-black/50 font-semibold uppercase text-[10px] tracking-widest">
                Refine Classification
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-red-50 hover:text-red-500 rounded p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="opacity-60 grayscale-[0.5]">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1">
                Account Code (Fixed)
              </label>
              <div className="border border-slate-200 bg-slate-100 w-full h-9 sm:h-10 rounded flex items-center px-3 font-medium text-xs sm:text-sm text-black/60 cursor-not-allowed">
                {coa.code}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="order"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
              >
                Display Order
              </label>
              <input
                id="order"
                name="order"
                type="number"
                placeholder="e.g. 10"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-9 sm:h-10 rounded focus:bg-slate-50 transition-all font-medium px-3 text-xs sm:text-sm text-slate-900"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.order}
                style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
              />
              {formik.touched.order && formik.errors.order && (
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                  {formik.errors.order}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
            >
              Account Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Cash in Bank"
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-9 sm:h-10 rounded focus:bg-slate-50 transition-all font-medium px-3 text-xs sm:text-sm text-slate-900"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                {formik.errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="normal_balance"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
              >
                Normal Balance
              </label>
              <select
                id="normal_balance"
                name="normal_balance"
                className="focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex h-9 sm:h-10 w-full rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 ring-offset-white transition-all appearance-none cursor-pointer"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.normal_balance}
                style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
              >
                <option value="DEBIT">DEBIT</option>
                <option value="CREDIT">CREDIT</option>
              </select>
              {formik.touched.normal_balance && formik.errors.normal_balance && (
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                  {formik.errors.normal_balance}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="report_role"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
              >
                Report Role
              </label>
              <select
                id="report_role"
                name="report_role"
                className="focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex h-9 sm:h-10 w-full rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 ring-offset-white transition-all appearance-none cursor-pointer"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.report_role}
                style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
              >
                {reportRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {formik.touched.report_role && formik.errors.report_role && (
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                  {formik.errors.report_role}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 p-2.5 bg-black/5 rounded border border-black/5 hover:bg-black/10 transition-colors cursor-pointer group">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                className="w-4 h-4 rounded border-black/5 transition-colors cursor-pointer"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                checked={formik.values.is_active}
                style={{ accentColor: primaryColor }}
              />
              <label
                htmlFor="is_active"
                className="text-xs font-semibold text-black cursor-pointer group-hover:text-opacity-70 transition-opacity"
              >
                Active Account
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-9 sm:h-10 text-white rounded font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] group flex items-center justify-center gap-2"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 10px -2px ${primaryColor}4D`,
              }}
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
