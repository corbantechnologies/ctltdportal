/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createBook } from "@/services/books";
import { useFormik, FormikHelpers } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, BookOpen, Plus, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useFetchCOAs } from "@/hooks/coa/actions";
import { useQueryClient } from "@tanstack/react-query";
import { formatBackendError } from "@/lib/error-handler";

interface CreateBookProps {
  rolePrefix?: string;
  initialCOA?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  refetch: () => void;
}

export default function CreateBook({
  rolePrefix = "finance",
  initialCOA,
  onSuccess,
  onClose,
  className,
  refetch,
}: CreateBookProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: coas, isLoading: isLoadingCOAs } = useFetchCOAs();

  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      account_type: initialCOA || "",
      is_active: true,
      is_bank: false,
      is_tax: false,
      is_cash: false,
      is_current: true,
      is_ar: false,
      is_ap: false,
      description: "",
    },
    enableReinitialize: true,
    onSubmit: async (
      values,
      { setSubmitting, resetForm, setErrors }: FormikHelpers<any>
    ) => {
      try {
        await createBook(values, header);
        toast.success("Account Book created successfully");
        refetch();
        // reload
        queryClient.invalidateQueries({ queryKey: ["books"] });
        queryClient.invalidateQueries({ queryKey: ["coas"] }); // Refresh COA list as books are nested
        router.refresh();
        if (initialCOA) {
          // If we have an initial COA (likely from detail page), invalidate specific COA query
          // We'd need the reference for this, assuming initialCOA passed is the name or we can find it.
          // Ideally initialCOA passed here is the NAME as per the form usage below, but for invalidation we might need reference.
          // However, refreshing "coas" list will often be enough or we can try to find the reference from the list.
          const coa = coas?.find((c) => c.name === values.account_type);
          if (coa) {
            queryClient.invalidateQueries({ queryKey: ["coa", coa.reference] });
          }
        }

        resetForm();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        console.log("Creation Error:", error);
        const errorMessage = formatBackendError(error, "Failed to create book");
        toast.error(errorMessage);

        if (error.response?.data) {
          setErrors(error.response.data);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className={`w-full border-black/5 shadow-2xl rounded overflow-hidden bg-white/80 backdrop-blur-xl ${className}`}
    >
      <div
        className="p-8 border-b border-black/5"
        style={{ backgroundColor: `${primaryColor}0D` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded flex items-center justify-center text-white shadow-lg"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 15px -3px ${primaryColor}4D`,
              }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black tracking-tight">
                Create Account Book
              </h2>
              <p className="text-black/50 font-semibold uppercase text-[10px] tracking-widest mt-1">
                General Ledger Infrastructure
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}

              className="hover:bg-red-50 hover:text-red-500 rounded p-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
              >
                Book Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="e.g. BK-100"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-slate-50 transition-all font-semibold px-5"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.code}
                style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
              />
              {formik.errors.code && (
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                  {formik.errors.code as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
              >
                Book Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Main Cash Book"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-slate-50 transition-all font-semibold px-5"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
              />
              {formik.errors.name && (
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                  {formik.errors.name as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="account_type"
              className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
            >
              Account Type (COA)
            </label>
            <select
              id="account_type"
              name="account_type"
              disabled={isLoadingCOAs || !!initialCOA}
              className="focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex h-14 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold ring-offset-white transition-all appearance-none cursor-pointer disabled:opacity-50"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.account_type}
              style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
            >
              <option value="">Select an account type...</option>
              {coas?.map((coa) => (
                <option key={coa.reference} value={coa.name}>
                  {coa.code} - {coa.name}
                </option>
              ))}
            </select>
            {formik.errors.account_type && (
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                {formik.errors.account_type as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_active ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_active", !formik.values.is_active)
              }
              style={{
                borderColor: formik.values.is_active ? primaryColor : undefined,
                ["--group-hover-border" as any]: primaryColor,
              }}
            >
              <input
                type="checkbox"
                name="is_active"
                checked={formik.values.is_active}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black">
                Active
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_bank ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_bank", !formik.values.is_bank)
              }
              style={{
                borderColor: formik.values.is_bank ? primaryColor : undefined,
              }}
            >
              <input
                type="checkbox"
                name="is_bank"
                checked={formik.values.is_bank}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black">
                Bank
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_tax ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_tax", !formik.values.is_tax)
              }
              style={{
                borderColor: formik.values.is_tax ? primaryColor : undefined,
              }}
            >
              <input
                type="checkbox"
                name="is_tax"
                checked={formik.values.is_tax}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black">
                Tax
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_cash ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_cash", !formik.values.is_cash)
              }
              style={{
                borderColor: formik.values.is_cash ? primaryColor : undefined,
              }}
            >
              <input
                type="checkbox"
                name="is_cash"
                checked={formik.values.is_cash}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black text-center leading-tight">
                Cash
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_current ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_current", !formik.values.is_current)
              }
              style={{
                borderColor: formik.values.is_current ? primaryColor : undefined,
              }}
            >
              <input
                type="checkbox"
                name="is_current"
                checked={formik.values.is_current}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black text-center leading-tight">
                Current
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_ar ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_ar", !formik.values.is_ar)
              }
              style={{
                borderColor: formik.values.is_ar ? primaryColor : undefined,
              }}
            >
              <input
                type="checkbox"
                name="is_ar"
                checked={formik.values.is_ar}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black text-center leading-tight">
                Receivable
              </span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-4 rounded border border-black/5 transition-all gap-2 group cursor-pointer ${formik.values.is_ap ? "bg-black/5" : "bg-white"}`}
              onClick={() =>
                formik.setFieldValue("is_ap", !formik.values.is_ap)
              }
              style={{
                borderColor: formik.values.is_ap ? primaryColor : undefined,
              }}
            >
              <input
                type="checkbox"
                name="is_ap"
                checked={formik.values.is_ap}
                onChange={formik.handleChange}
                className="w-5 h-5 rounded transition-colors cursor-pointer"
                style={{ accentColor: primaryColor }}
              />
              <span className="text-[10px] font-semibold uppercase text-black/60 group-hover:text-black text-center leading-tight">
                Payable
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Provide a brief description of this book..."
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full min-h-[120px] rounded focus:bg-slate-50 transition-all font-semibold p-5"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              style={{ ["--tw-ring-color" as any]: `${primaryColor}33` }}
            />
            {formik.errors.description && (
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                {formik.errors.description as string}
              </p>
            )}
          </div>

          <div className="pt-4">
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
                  Initialize Account Book
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
