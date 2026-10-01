"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Session, User } from "next-auth";
import {
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useFormik } from "formik";
import { LoginSchema } from "@/validation";
import { cn } from "@/lib/utils";
import { FinancialYear, getFinancialYears } from "@/services/financialyears";

interface CustomUser extends User {
  token?: string;
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

const STORAGE_KEY = "ct_selected_fiscal_year_code";
const SESSION_PROMPT_KEY = "ct_fiscal_year_confirmed_session";

export default function Login() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Fiscal Year Selection Step State (for Director / Finance / Superuser)
  const [step, setStep] = useState<"CREDENTIALS" | "SELECT_YEAR">("CREDENTIALS");
  const [availableYears, setAvailableYears] = useState<FinancialYear[]>([]);
  const [selectedYearCode, setSelectedYearCode] = useState<string>("");
  const [targetDashboard, setTargetDashboard] = useState<string>("/finance/dashboard");
  const [authenticatedUser, setAuthenticatedUser] = useState<CustomUser | null>(null);

  const router = useRouter();

  const handleYearSelectionAndProceed = (yearCode: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, yearCode);
      sessionStorage.setItem(SESSION_PROMPT_KEY, "true");
    }
    toast.success(`Entering portal in FY ${yearCode} context...`);
    router.push(targetDashboard);
  };

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

      if (response?.error) {
        setLoading(false);
        toast.error("Invalid email or password");
        return;
      }

      const session = (await getSession()) as CustomSession | null;
      const user = session?.user;
      setAuthenticatedUser(user || null);

      // Determine target destination
      let dest = "/";
      if (user?.is_director === true || user?.is_superuser === true) {
        dest = "/director/dashboard";
      } else if (user?.is_finance === true) {
        dest = "/finance/dashboard";
      } else if (user?.is_operations === true) {
        dest = "/operations/dashboard";
      } else if (user?.is_employee === true) {
        dest = "/employee/dashboard";
      }
      setTargetDashboard(dest);

      const isDirectorOrFinance = Boolean(
        user?.is_director || user?.is_finance || user?.is_superuser
      );

      // If Director, Finance, or Superuser, fetch available fiscal years for selection
      if (isDirectorOrFinance && user?.token) {
        try {
          const years = await getFinancialYears({
            headers: { Authorization: `Token ${user.token}` },
          });

          if (Array.isArray(years) && years.length > 0) {
            const sortedYears = [...years].sort((a, b) =>
              b.start_date.localeCompare(a.start_date)
            );
            setAvailableYears(sortedYears);

            // Default to is_current === true, or first active, or first available
            const defaultYr =
              sortedYears.find((y) => y.is_current === true) ||
              sortedYears.find((y) => y.is_active === true) ||
              sortedYears[0];

            setSelectedYearCode(defaultYr.code);
            setLoading(false);
            setStep("SELECT_YEAR");
            toast.success("Credentials verified. Please choose your operating fiscal year.");
            return;
          }
        } catch (err) {
          console.error("Failed to fetch fiscal years during login:", err);
          // Fallback to direct navigation if year fetch fails
        }
      }

      // Default path for other roles (employees, operations) or if only 1 / 0 years found
      setLoading(false);
      toast.success("Identity verified. Accessing portal...");
      router.push(dest);
    },
  });

  // Step 2: Fiscal Year Selection Card for Director & Finance
  if (step === "SELECT_YEAR") {
    const currentYear = availableYears.find((y) => y.is_current === true);

    return (
      <div className="w-full animate-in fade-in duration-300">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Authenticated &bull; {authenticatedUser?.is_director ? "Director" : "Finance"} Access</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Select Working Fiscal Year
          </h2>
          <p className="text-sm text-slate-500">
            Choose the accounting period you want to enter. All books, P&amp;L, tax schedules, and reports will immediately reflect this year.
          </p>
        </div>

        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {availableYears.map((yr) => {
            const isSelected = yr.code === selectedYearCode;
            const isCurrent = Boolean(yr.is_current);

            return (
              <div
                key={yr.reference || yr.code}
                onClick={() => setSelectedYearCode(yr.code)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left",
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        FY {yr.code}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Sparkles className="w-2.5 h-2.5" />
                          Current Year
                        </span>
                      )}
                      {!yr.is_active && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {yr.start_date} &rarr; {yr.end_date}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => handleYearSelectionAndProceed(selectedYearCode)}
            className="w-full h-11 bg-[#2170ed] hover:bg-blue-600 text-white rounded font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Enter Portal (FY {selectedYearCode})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {currentYear && currentYear.code !== selectedYearCode && (
            <button
              type="button"
              onClick={() => handleYearSelectionAndProceed(currentYear.code)}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors py-1"
            >
              Or enter directly with Current Year (FY {currentYear.code})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Step 1: Default Credentials Form
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

