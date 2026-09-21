"use client";

import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, ShieldCheck, X, FileText, Landmark, ScrollText, AlertCircle } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { updateQuotation, sendQuotation } from "@/services/quotations";
import { useFetchTermsAndConditions } from "@/hooks/termsandconditions/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface FinalizeQuotationProps {
  quotationReference: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function FinalizeQuotation({
  quotationReference,
  isOpen,
  onOpenChange,
  onSuccess
}: FinalizeQuotationProps) {
  const header = useAxiosAuth();
  const [mounted, setMounted] = useState(false);
  const { data: terms } = useFetchTermsAndConditions();
  const { data: accounts } = useFetchPaymentAccounts();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const formik = useFormik({
    initialValues: {
      terms_and_conditions: "",
      payment_account: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (!values.terms_and_conditions || !values.payment_account) {
        toast.error("Please select both Terms and Payment Account");
        setSubmitting(false);
        return;
      }

      try {
        await updateQuotation(quotationReference, values, header);
        await sendQuotation(quotationReference, header);
        toast.success("Quotation sent successfully to customer");
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } catch (error: any) {
        const message = error?.response?.data?.error || error?.response?.data?.message || "Failed to finalize quotation";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => onOpenChange(false)} 
      />
      <div 
        className="relative w-full max-w-xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[1000] animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 p-4 sm:p-5 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Finalize <span className="text-blue-400">Proposal</span>
              </h2>
              <p className="text-white/50 font-semibold uppercase text-[9px] tracking-wider mt-0.5">
                Commitment and Structural Finalization
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-amber-800 leading-relaxed font-medium">
              Once finalized, the quotation becomes a binding proposal. Please ensure the <span className="font-semibold underline">Terms of Engagement</span> and <span className="font-semibold underline">Settlement Account</span> are accurate.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Terms Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ScrollText className="w-3.5 h-3.5" />
                  Select Legal Framework (Terms & Conditions)
                </label>
                <select
                  name="terms_and_conditions"
                  className="w-full h-9 sm:h-10 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-3 text-xs sm:text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.terms_and_conditions}
                >
                  <option value="">Select Framework...</option>
                  {terms?.map((t: any) => (
                    <option key={t.reference} value={t.reference}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Account Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" />
                  Select Settlement Infrastructure (Payment Account)
                </label>
                <select
                  name="payment_account"
                  className="w-full h-9 sm:h-10 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-3 text-xs sm:text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.payment_account}
                >
                  <option value="">Select Account...</option>
                  {accounts?.map((a: any) => (
                    <option key={a.reference} value={a.reference}>{a.name} ({a.bank_name})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-9 sm:h-10 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Commit & Finalize Issuance
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return mounted && isOpen ? createPortal(modalContent, document.body) : null;
}
