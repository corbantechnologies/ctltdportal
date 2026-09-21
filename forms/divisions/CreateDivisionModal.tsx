/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createDivision } from "@/services/divisions";
import { useFormik } from "formik";
import { DivisionSchema } from "@/validation";
import { toast } from "react-hot-toast";
import { Loader2, Database, Shield, Plus, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  trigger?: React.ReactNode;
}

export default function CreateDivisionModal({ trigger }: Props) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      is_active: true,
      is_public: true,
    },
    validationSchema: DivisionSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createDivision(values, header);
        toast.success("Division established successfully");
        queryClient.invalidateQueries({ queryKey: ["divisions"] });
        router.refresh();
        resetForm();
        setOpen(false);
      } catch (error) {
        const errorMessage =
          (error as any)?.response?.data?.message ||
          "Failed to establish division";
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
          <button className="h-9 sm:h-10 px-4 sm:px-5 bg-slate-900 hover:bg-corporate-primary text-white rounded font-semibold text-xs sm:text-sm tracking-tight transition-all shadow-md active:scale-[0.98] flex items-center gap-2 group">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Establish New Division
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-200">
            <div className="bg-slate-900 p-4 sm:p-5 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-corporate-primary/10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-9 h-9 rounded bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                    Establish <span className="text-corporate-primary">Division</span>
                  </h2>
                  <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider mt-0.5">
                    Corporate Infrastructure Unit
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-1 block"
                  >
                    Division Nomenclature
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Strategic Operations, Digital Assets"
                    className="w-full h-9 sm:h-10 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-corporate-primary/30 focus:ring-0 transition-all font-semibold px-3 sm:px-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-transparent"
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

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100 hover:border-slate-200 transition-colors group cursor-pointer" onClick={() => formik.setFieldValue('is_active', !formik.values.is_active)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formik.values.is_active ? 'bg-corporate-primary border-corporate-primary shadow-sm shadow-orange-500/20' : 'bg-white border-slate-200'}`}>
                    {formik.values.is_active && <Plus className="w-3.5 h-3.5 text-white rotate-45" />}
                  </div>
                  <div>
                    <label
                      htmlFor="is_active"
                      className="text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer block"
                    >
                      Active Status
                    </label>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      Enable immediate unit operations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100 hover:border-slate-200 transition-colors group cursor-pointer" onClick={() => formik.setFieldValue('is_public', !formik.values.is_public)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formik.values.is_public ? 'bg-corporate-primary border-corporate-primary shadow-sm shadow-orange-500/20' : 'bg-white border-slate-200'}`}>
                    {formik.values.is_public && <Plus className="w-3.5 h-3.5 text-white rotate-45" />}
                  </div>
                  <div>
                    <label
                      htmlFor="is_public"
                      className="text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer block"
                    >
                      Public Status
                    </label>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      Enable public visibility
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full h-9 sm:h-10 bg-slate-900 hover:bg-corporate-primary text-white rounded font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-corporate-primary/20 active:scale-[0.98] group relative overflow-hidden flex items-center justify-center"
                  >
                    {formik.isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Establish Unit
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
