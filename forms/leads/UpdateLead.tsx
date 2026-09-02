"use client";

import { updateLead, convertLeadToPartner, Lead } from "@/services/leads";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Shield, X, Activity, CheckCircle2, AlertCircle, Building2, Mail, Phone, Globe, Tag } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";

interface UpdateLeadProps {
  lead: Lead;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateLead({ lead, trigger, isOpen, onOpenChange }: UpdateLeadProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use external state if provided, otherwise fallback to internal
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const { data: divisions } = useFetchDivisions();
  const { data: partnerTypes } = useFetchPartnerTypes();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const statusOptions = [
    { value: "NEW", label: "New Lead" },
    { value: "CONTACTED", label: "Contacted" },
    { value: "QUALIFIED", label: "Qualified (Lead to Partner)" },
    { value: "PROPOSAL_SENT", label: "Proposal Sent" },
    { value: "WON", label: "Deal Won" },
    { value: "LOST", label: "Deal Lost" },
  ];

  const formik = useFormik({
    initialValues: {
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email || "",
      phone: lead.phone || "",
      country: lead.country || "",
      company_name: lead.company_name || "",
      division: lead.division || "",
      tax_pin: lead.tax_pin || "",
      status: lead.status,
      partner_type: "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (values.status === "QUALIFIED" && lead.status !== "QUALIFIED") {
            if (!values.partner_type) {
                toast.error("Please select a Partner Category to convert");
                setSubmitting(false);
                return;
            }
            await convertLeadToPartner(lead.reference, values.partner_type, header);
            toast.success("Lead qualified and converted to Partner");
        } else {
            await updateLead(lead.reference, values as any, header);
            toast.success("Lead updated successfully");
        }
        
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["partners"] });
        router.refresh();
        setOpen(false);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to update lead";
        toast.error(errorMessage);
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
        className="relative w-full max-w-2xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[1000] animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight uppercase italic">
                Lead <span className="text-blue-500">Infrastructure</span>
              </h2>
              <p className="text-black font-semibold uppercase text-[9px] tracking-widest mt-0.5">
                Modifying: {lead.reference}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 p-2 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-4 text-sm text-slate-900 outline-none"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.first_name}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-4 text-sm text-slate-900 outline-none"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.last_name}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-10 pr-4 text-sm text-slate-900 outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                        Phone Number
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                        id="phone"
                        name="phone"
                        type="text"
                        className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-10 pr-4 text-sm text-slate-900 outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.phone}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="company_name" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                        Company Name
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                        id="company_name"
                        name="company_name"
                        type="text"
                        className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-10 pr-4 text-sm text-slate-900 outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.company_name}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="country" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                        Country
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                        id="country"
                        name="country"
                        type="text"
                        className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-10 pr-4 text-sm text-slate-900 outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.country}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="division" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                        Division Assignment
                    </label>
                    <select
                        id="division"
                        name="division"
                        className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-4 text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.division}
                    >
                        <option value="">Select Division</option>
                        {divisions?.map((d: any) => (
                            <option key={d.reference} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="tax_pin" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                        Tax PIN (Optional)
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                        id="tax_pin"
                        name="tax_pin"
                        type="text"
                        className="w-full h-11 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-10 pr-4 text-sm text-slate-900 outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.tax_pin}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-6">
                <label htmlFor="status" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                  Pipeline State Transition
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((option) => {
                        const isSelected = formik.values.status === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => formik.setFieldValue("status", option.value)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded border transition-all text-left",
                                    isSelected 
                                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                                        : "bg-white border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <span className={cn("text-[11px] font-bold uppercase tracking-tighter", isSelected ? "text-blue-700" : "text-slate-600")}>
                                    {option.label}
                                </span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                            </button>
                        );
                    })}
                </div>
              </div>

            {formik.values.status === "QUALIFIED" && lead.status !== "QUALIFIED" && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded">
                        <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                            Set status to <span className="font-bold underline">QUALIFIED</span> to initiate automatic <span className="font-bold">Partner</span> conversion. Please select a classification below.
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="partner_type" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                            Partner Category Classification
                        </label>
                        <select
                            id="partner_type"
                            name="partner_type"
                            className="w-full h-11 rounded border border-emerald-100 bg-emerald-50/30 focus:bg-white focus:border-emerald-500 transition-all font-semibold px-4 text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.partner_type}
                        >
                            <option value="">Select Category</option>
                            {partnerTypes?.map((t: any) => (
                                <option key={t.reference} value={t.reference}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-sm transition-all shadow-xl active:scale-[0.98] group flex items-center justify-center gap-3"
              >
                {formik.isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Commit Structural Changes
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
          <button className="text-blue-600 hover:underline font-semibold text-xs">
            Edit Lead
          </button>
        )}
      </div>

      {open && mounted && createPortal(modalContent, document.body)}
    </>
  );
}