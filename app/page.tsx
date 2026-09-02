"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Shield, ArrowRight, Wallet, Briefcase, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Session, User } from "next-auth";

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

export default function PortalRootPage() {
  const router = useRouter();
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      const user = session.user;
      if (user.is_director || user.is_superuser) {
        router.replace("/director/dashboard");
      } else if (user.is_finance) {
        router.replace("/finance/dashboard");
      } else if (user.is_operations) {
        router.replace("/operations/dashboard");
      } else if (user.is_employee) {
        router.replace("/employee/dashboard");
      } else {
        router.replace("/employee/dashboard");
      }
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center mx-auto shadow-2xl">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Corban Technologies Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Management &amp; Financial Accounting System
          </p>
        </div>

        {status === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-xs text-slate-400 font-medium">Verifying authorization...</p>
          </div>
        ) : status === "unauthenticated" ? (
          <div className="space-y-4 pt-4">
            <p className="text-xs text-slate-400">
              Authentication required to access the internal portal.
            </p>
            <Link
              href="/auth/login"
              className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-2 text-left">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/finance/dashboard"
                className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 text-xs font-semibold transition-colors"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Finance</span>
              </Link>
              <Link
                href="/director/dashboard"
                className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 text-xs font-semibold transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>Director</span>
              </Link>
              <Link
                href="/operations/dashboard"
                className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 text-xs font-semibold transition-colors"
              >
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Operations</span>
              </Link>
              <Link
                href="/employee/dashboard"
                className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 text-xs font-semibold transition-colors"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Employee</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
