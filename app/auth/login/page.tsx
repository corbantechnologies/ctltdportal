"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Session, User } from "next-auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import { LoginSchema } from "@/validation";
import { cn } from "@/lib/utils";

interface CustomUser extends User {
  is_director?: boolean;
  is_employee?: boolean;
  is_finance?: boolean;
  is_operations?: boolean;
  is_sales?: boolean;
  is_superuser?: boolean;
}

interface CustomSession extends Session {
  user?: CustomUser;
}

export default function Login() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setLoading(true);

      const response = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      const session = (await getSession()) as CustomSession | null;

      setLoading(false);

      if (response?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Identity verified. Accessing portal...");

        if (session?.user?.is_director === true) {
          router.push("/director/dashboard");
        } else if (session?.user?.is_employee === true) {
          router.push("/employee/dashboard");
        } else if (session?.user?.is_finance === true) {
          router.push("/finance/dashboard");
        } else if (session?.user?.is_operations === true) {
          router.push("/operations/dashboard");
        } else if (session?.user?.is_superuser === true) {
          router.push("/director/dashboard");
        } else {
          router.push("/");
        }
      }
    },
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Sign in</h2>
        <p className="text-sm text-slate-500">Welcome back. Enter your credentials to continue.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 block">
            Email
          </label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              placeholder="corbantechnologies@gmail.com"
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer select-none font-medium">
            Remember me
          </label>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full h-11 mt-4 bg-[#2170ed] hover:bg-blue-600 text-white rounded font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

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
