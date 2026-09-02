"use client";

import { createFinance } from "@/services/accounts";
import { useFormik } from "formik";
import { CreateMemberSchema } from "@/validation";
import { toast } from "react-hot-toast";
import { Loader2, Users, Shield, Plus, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface CreateFinanceProps {
  trigger?: React.ReactNode;
}

export default function CreateFinance({ trigger }: CreateFinanceProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
    validationSchema: CreateMemberSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createFinance(values);
        toast.success("Finance member established successfully");
        queryClient.invalidateQueries({ queryKey: ["finance"] });
        resetForm();
        setOpen(false);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Failed to establish finance member";
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
          <button className="h-14 px-8 bg-slate-900 hover:bg-corporate-primary text-white rounded font-semibold text-sm tracking-tight transition-all shadow-xl hover:shadow-corporate-primary/20 active:scale-[0.98] flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Establish Finance Member
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-corporate-primary/10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight italic">
                    Establish <span className="text-corporate-primary">Finance</span>
                  </h2>
                  <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-widest mt-1">
                    System Access Provisioning
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => setOpen(false)} className="absolute top-8 right-8 p-2 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="first_name"
                      className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block"
                    >
                      First Name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="e.g. John"
                      className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-slate-50 focus:border-corporate-primary/30 focus:ring-0 transition-all font-semibold px-6 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-corporate-primary/20"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.first_name}
                    />
                    {formik.touched.first_name && formik.errors.first_name && (
                      <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1 mt-1">
                        {formik.errors.first_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="last_name"
                      className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block"
                    >
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="e.g. Doe"
                      className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-slate-50 focus:border-corporate-primary/30 focus:ring-0 transition-all font-semibold px-6 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-corporate-primary/20"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.last_name}
                    />
                    {formik.touched.last_name && formik.errors.last_name && (
                      <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1 mt-1">
                        {formik.errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-slate-50 focus:border-corporate-primary/30 focus:ring-0 transition-all font-semibold px-6 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-corporate-primary/20"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1 mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full h-16 bg-slate-900 hover:bg-corporate-primary text-white rounded font-semibold text-base transition-all shadow-xl hover:shadow-corporate-primary/20 active:scale-[0.98] group relative overflow-hidden flex items-center justify-center"
                  >
                    {formik.isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Establish Member
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
