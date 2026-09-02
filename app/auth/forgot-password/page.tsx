"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft, Loader2, Mail, ArrowRight } from "lucide-react";
import { forgotPassword } from "@/services/accounts";
import { useFormik } from "formik";
import { ForgotPasswordSchema } from "@/validation";
import { cn } from "@/lib/utils";

export default function ForgotPassword() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await forgotPassword({ email: values.email });
        setSubmitted(true);
        toast.success("Security protocol initiated. Check your inbox.");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
          "Could not initiate recovery. Please verify your identity."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Recover Access</h2>
        <p className="text-sm text-slate-500">
          Verify your identity to initiate the recovery protocol.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 block">
              Registered Email
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="identity@company.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  "w-full h-11 px-4 bg-blue-50/40 border border-slate-200 rounded text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all",
                  formik.touched.email && formik.errors.email && "border-red-500 bg-red-50"
                )}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs font-semibold text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full h-11 mt-4 bg-[#2170ed] hover:bg-blue-600 text-white rounded font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Requesting...</span>
              </>
            ) : (
              <span>Send Recovery Email</span>
            )}
          </button>

          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-blue-50 rounded flex items-center justify-center border border-blue-100 mx-auto">
            <Mail className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">Protocol Dispatched</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              A recovery link has been sent to <br />
              <span className="text-blue-600 font-semibold">{formik.values.email}</span>.
            </p>
          </div>

          <Link
            href="/auth/reset-password"
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Enter Recovery Code</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs font-medium text-slate-400 pt-4">
            Code Expires in 15 Minutes
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 text-center text-sm font-medium text-slate-500 border-t border-slate-100">
        New to Corban Technologies?{" "}
        <Link
          href="/contact"
          className="text-blue-500 hover:text-blue-600 font-semibold"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
