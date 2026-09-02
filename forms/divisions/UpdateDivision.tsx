/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updateDivision } from "@/services/divisions";
import { useFormik } from "formik";
import { DivisionSchema } from "@/validation";




import { toast } from "react-hot-toast";
import { Loader2, Edit3, Save } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateDivisionProps {
  division: {
    name: string;
    is_active: boolean;
    is_public: boolean;
    reference: string;
  };
}

export default function UpdateDivision({ division }: UpdateDivisionProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      name: division.name,
      is_active: division.is_active,
      is_public: division.is_public,
    },
    enableReinitialize: true,
    validationSchema: DivisionSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateDivision(division.reference, values, header);
        toast.success("Division updated successfully");
        router.refresh();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to update division",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="w-full max-w-2xl border-black/5 shadow-2xl rounded overflow-hidden bg-white/80 backdrop-blur-xl">
      <div className="bg-orange-50/50 p-8 border-b border-black/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded bg-black flex items-center justify-center text-white shadow-lg">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Update Division
            </h2>
            <p className="text-black/50 font-semibold uppercase text-[10px] tracking-widest mt-1">
              Refine Infrastructure
            </p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1"
            >
              Division Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Sales, Marketing, HR"
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-slate-50 focus:ring-corporate-primary/20 transition-all font-semibold px-5"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest ml-1">
                {formik.errors.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50/30 rounded border border-black/5 transition-colors">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              className="w-5 h-5 rounded border-black/5 text-corporate-primary focus:ring-corporate-primary/20"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.is_active}
            />
            <label
              htmlFor="is_active"
              className="text-sm font-semibold text-black"
            >
              Keep Division Active
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50/30 rounded border border-black/5 transition-colors">
            <input
              id="is_public"
              name="is_public"
              type="checkbox"
              className="w-5 h-5 rounded border-black/5 text-corporate-primary focus:ring-corporate-primary/20"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.is_public}
            />
            <label
              htmlFor="is_public"
              className="text-sm font-semibold text-black"
            >
              Set as Public Division
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-16 bg-corporate-primary hover:bg-black text-white rounded font-semibold text-lg transition-all shadow-xl hover:shadow-black/10 active:scale-[0.98] group flex items-center justify-center"
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5" />
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
