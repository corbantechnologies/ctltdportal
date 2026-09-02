"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import { ActivateAccountSchema } from "@/validation";
import { cn } from "@/lib/utils";
import { activateAccount } from "@/services/accounts";

export default function ActivateAccountPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const router = useRouter();
  const params = useParams();

  const uid = params.uid as string;
  const token = params.token as string;

  const formik = useFormik({
    initialValues: {
      password: "",
      password_confirmation: "",
    },
    validationSchema: ActivateAccountSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await activateAccount({
          uidb64: uid,
          token: token,
          password: values.password,
          password_confirmation: values.password_confirmation,
        });

        toast.success("Account activated successfully. You can now login.");
        router.push("/auth/login");
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Activation failed or link expired.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Activate Account</h2>
        <p className="text-sm text-slate-500">Welcome to Corban Technologies. Set a secure password to activate your portal access.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 block">
            New Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
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
          {formik.touched.password && formik.errors.password && (
            <p className="text-xs font-semibold text-red-500">
              {formik.errors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 block">
            Confirm Password
          </label>
          <div className="relative">
            <input
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={formik.values.password_confirmation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={cn(
                "w-full h-11 pl-4 pr-11 bg-blue-50/40 border border-slate-200 rounded text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all",
                formik.touched.password_confirmation && formik.errors.password_confirmation && "border-red-500 bg-red-50"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formik.touched.password_confirmation && formik.errors.password_confirmation && (
            <p className="text-xs font-semibold text-red-500">
              {formik.errors.password_confirmation}
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
              <span>Activating Account...</span>
            </>
          ) : (
            <span>Activate Account</span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 text-center text-sm font-medium text-slate-500 border-t border-slate-100">
        Already have an active account?{" "}
        <Link
          href="/auth/login"
          className="text-blue-500 hover:text-blue-600 font-semibold"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}