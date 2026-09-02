/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updatePartner } from "@/services/partners";
import { useFormik } from "formik";
import { PartnerSchema } from "@/validation";
import { toast } from "react-hot-toast";
import { Loader2, Edit3, Save, X, Activity } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface UpdatePartnerProps {
  partner: any;
  rolePrefix?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdatePartner({
  partner,
  rolePrefix = "finance",
  onSuccess,
  onClose,
  className,
  trigger,
  isOpen,
  onOpenChange
}: UpdatePartnerProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use external state if provided, otherwise fallback to internal
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const { data: partnerTypes, isLoading: isLoadingTypes } = useFetchPartnerTypes();
  const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const formik = useFormik({
    initialValues: {
      name: partner.name,
      phone: partner.phone,
      email: partner.email,
      tax_pin: partner.tax_pin,
      currency: partner.currency,
      wht_rate: partner.wht_rate,
      payment_terms: partner.payment_terms || "",
      is_active: partner.is_active,
      partner_type: partner.partner_type,
      division: partner.division || "",
    },
    enableReinitialize: true,
    validationSchema: PartnerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updatePartner(
          partner.reference,
          {
            ...values,
            wht_rate: values.wht_rate,
          },
          header,
        );
        toast.success("Partner updated successfully");
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        queryClient.invalidateQueries({
          queryKey: ["partner", partner.reference],
        });
        router.refresh();
        setOpen(false);
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to update partner",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => setOpen(false)} 
      />
      <div 
        className="relative w-full max-w-3xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[1000] animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      >
        <div
          className="p-8 border-b border-black/5 relative overflow-hidden"
          style={{ backgroundColor: `${primaryColor}0D` }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: primaryColor }} />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-white shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 15px -3px ${primaryColor}4D`,
                }}
              >
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase italic">
                  Partner <span style={{ color: primaryColor }}>Infrastructure</span>
                </h2>
                <p className="text-black font-semibold uppercase text-[9px] tracking-widest mt-0.5">
                  Refining Profile: {partner.reference}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setOpen(false)}
              className="p-2 rounded bg-white/5 hover:bg-black/5 text-slate-400 hover:text-slate-900 transition-all border border-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Partner Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 w-full h-12 rounded focus:bg-white transition-all font-semibold px-5 text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                    {formik.errors.name as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 w-full h-12 rounded focus:bg-white transition-all font-semibold px-5 text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                    {formik.errors.email as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 w-full h-12 rounded focus:bg-white transition-all font-semibold px-5 text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="partner_type"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Partner Category
                </label>
                <select
                  id="partner_type"
                  name="partner_type"
                  disabled={isLoadingTypes}
                  className="focus:outline-none focus:ring-2 flex h-12 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold transition-all appearance-none text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.partner_type}
                >
                  {partnerTypes?.map((type) => (
                    <option key={type.reference} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="division"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Assigned Division
                </label>
                <select
                  id="division"
                  name="division"
                  disabled={isLoadingDivisions}
                  className="focus:outline-none focus:ring-2 flex h-12 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold transition-all appearance-none text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.division}
                >
                  <option value="">Global / None</option>
                  {divisions?.map((div) => (
                    <option key={div.reference} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-black/5" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="tax_pin"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Tax PIN (KRA)
                </label>
                <input
                  id="tax_pin"
                  name="tax_pin"
                  className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 w-full h-12 rounded focus:bg-white transition-all font-semibold px-5 text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tax_pin}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="currency"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  Preferred Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="focus:outline-none focus:ring-2 flex h-12 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold transition-all appearance-none text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.currency}
                >
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="wht_rate"
                  className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
                >
                  WHT Rate (%)
                </label>
                <input
                  id="wht_rate"
                  name="wht_rate"
                  type="number"
                  step="0.01"
                  className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 w-full h-12 rounded focus:bg-white transition-all font-semibold px-5 text-slate-900"
                  style={{"--tw-ring-color": primaryColor + "33"} as any}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.wht_rate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payment_terms"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Payment Terms / Notes
              </label>
              <input
                id="payment_terms"
                name="payment_terms"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 w-full h-12 rounded focus:bg-white transition-all font-semibold px-5 text-slate-900"
                style={{"--tw-ring-color": primaryColor + "33"} as any}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.payment_terms}
              />
            </div>

            <div
              className="flex items-center gap-3 p-4 rounded border border-black/5 transition-colors bg-slate-50/50"
            >
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                className="w-5 h-5 rounded border-black/5 focus:ring-0 cursor-pointer"
                style={{
                  accentColor: primaryColor,
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                checked={formik.values.is_active}
              />
              <label
                htmlFor="is_active"
                className="text-sm font-bold text-slate-700 cursor-pointer"
              >
                Keep Partner Active
              </label>
            </div>

            <div className="pt-4 pb-2">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full h-14 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] group flex items-center justify-center gap-3"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 20px -5px ${primaryColor}4D`,
                }}
              >
                {formik.isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Commit Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents cursor-pointer">
        {trigger || (
          <button className="flex items-center justify-center gap-2 h-12 px-4 bg-white hover:bg-black/5 text-black border border-black/5 rounded font-semibold text-xs uppercase tracking-widest shadow-sm transition-colors">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {open && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
