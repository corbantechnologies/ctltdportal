"use client";

import { createLead } from "@/services/leads";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Users, Shield, Plus, X, Building2, Mail, Phone, Globe, Tag, UserPlus } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchDivisions } from "@/hooks/divisions/actions";

interface CreateLeadProps {
  trigger?: React.ReactNode;
}

export default function CreateLead({ trigger }: CreateLeadProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: divisions } = useFetchDivisions();

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      country: "",
      company_name: "",
      division: "",
      tax_pin: "",
      status: "NEW",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createLead(values, header);
        toast.success("Lead captured successfully");
        await queryClient.invalidateQueries({ queryKey: ["leads"] });
        await queryClient.refetchQueries({ queryKey: ["leads"] });
        router.refresh();
        resetForm();
        setOpen(false);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Failed to capture lead";
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger || (
          <button className="h-14 px-8 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-sm tracking-tight transition-all shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Capture New Lead
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight italic">
                    Capture <span className="text-blue-500">New Lead</span>
                  </h2>
                  <p className="text-black font-semibold uppercase text-[10px] tracking-widest mt-1">
                    Prospect Intake & Pipeline Entry
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => setOpen(false)} className="absolute top-8 right-8 p-2 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10">
                <X className="w-5 h-5" />
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
                      className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-6 text-sm text-slate-900 outline-none"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.first_name}
                    />
                    {formik.touched.first_name && formik.errors.first_name && (
                      <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-6 text-sm text-slate-900 outline-none"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.last_name}
                    />
                    {formik.touched.last_name && formik.errors.last_name && (
                      <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                            id="email"
                            name="email"
                            type="email"
                            className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            />
                        </div>
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.email}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                            id="phone"
                            name="phone"
                            type="text"
                            className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.phone}
                            />
                        </div>
                        {formik.touched.phone && formik.errors.phone && (
                            <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.phone}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="company_name" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                            Company Name
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                            id="company_name"
                            name="company_name"
                            type="text"
                            className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.company_name}
                            />
                        </div>
                        {formik.touched.company_name && formik.errors.company_name && (
                            <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.company_name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="country" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                            Country
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                            id="country"
                            name="country"
                            type="text"
                            className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.country}
                            />
                        </div>
                        {formik.touched.country && formik.errors.country && (
                            <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.country}</p>
                        )}
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
                            className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-6 text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.division}
                        >
                            <option value="">Select Division</option>
                            {divisions?.map((d: any) => (
                                <option key={d.reference} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                        {formik.touched.division && formik.errors.division && (
                            <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">{formik.errors.division}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="tax_pin" className="text-[10px] font-semibold uppercase tracking-widest text-black ml-1 block">
                            Tax PIN (Optional)
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                            id="tax_pin"
                            name="tax_pin"
                            type="text"
                            className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.tax_pin}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full h-16 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-base transition-all shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] group relative overflow-hidden flex items-center justify-center"
                  >
                    {formik.isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Capture Lead
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}