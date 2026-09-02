"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  ShieldAlert
} from "lucide-react";
import { resetPassword } from "@/services/accounts";
import { useFormik } from "formik";
import { ResetPasswordSchema } from "@/validation";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await resetPassword({
          email: values.email,
          code: values.code,
          password: values.password,
          password_confirmation: values.confirmPassword,
        });
        toast.success("Security credentials updated successfully.");
        router.push("/auth/login");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
          "Failed to update credentials. Please verify your recovery code."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Reset Password</h2>
        <p className="text-sm text-slate-500">
          Update your secure credentials to regain authorized access.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 block">
              Email Identity
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
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

          {/* Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 block">
              Recovery Code
            </label>
            <div className="relative">
              <input
                name="code"
                type="text"
                required
                placeholder="000000"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  "w-full h-11 px-4 bg-blue-50/40 border border-slate-200 rounded text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all tracking-widest",
                  formik.touched.code && formik.errors.code && "border-red-500 bg-red-50"
                )}
              />
            </div>
            {formik.touched.code && formik.errors.code && (
              <p className="text-xs font-semibold text-red-500">
                {formik.errors.code}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 block">
              New Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  "w-full h-11 pl-4 pr-11 bg-blue-50/40 border border-slate-200 rounded text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all",
                  formik.touched.password && formik.errors.password && "border-red-500 bg-red-50"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  "w-full h-11 pl-4 pr-11 bg-blue-50/40 border border-slate-200 rounded text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all",
                  formik.touched.confirmPassword && formik.errors.confirmPassword && "border-red-500 bg-red-50"
                )}
              />
            </div>
          </div>
        </div>

        {(formik.touched.password && formik.errors.password) || (formik.touched.confirmPassword && formik.errors.confirmPassword) ? (
          <div className="p-3 bg-red-50 rounded border border-red-100 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-500 leading-relaxed">
              {formik.errors.password || formik.errors.confirmPassword}
            </p>
          </div>
        ) : null}

        <button
          disabled={loading}
          type="submit"
          className="w-full h-11 mt-4 bg-[#2170ed] hover:bg-blue-600 text-white rounded font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <span>Update Password</span>
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
    </div>
  );
}
