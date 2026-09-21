/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useFetchAccount } from "@/hooks/accounts/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import {
  LogOut,
  LayoutDashboard,
  Database,
  FileText,
  Menu,
  X,
  ChevronRight,
  User,
  Settings,
  BookOpen,
  Wallet,
  Zap,
  Receipt,
  FileBadge,
  Users,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: account, isLoading } = useFetchAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDirector = account?.is_director;
  const isFinance = account?.is_finance;
  const isOperations = account?.is_operations;
  const isEmployee = account?.is_employee;

  const rolePrefix = isDirector
    ? "director"
    : isFinance
      ? "finance"
      : isOperations
        ? "operations"
        : isEmployee
          ? "employee"
          : "portal";

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const { data: years } = useFetchFinancialYears();
  const activeYear = years?.find(
    (y: { is_active: boolean; reference: string }) => y.is_active,
  );

  const navItems = [
    {
      name: "Dashboard",
      href: `/${rolePrefix}/dashboard`,
      icon: LayoutDashboard,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Current Fiscal Year",
      href: activeYear
        ? `/${rolePrefix}/fiscal-years/${activeYear.reference}`
        : `/${rolePrefix}/fiscal-years`,
      icon: FileText,
      show: !!activeYear && (isDirector || isFinance || isOperations),
    },
    {
      name: "All Fiscal Years",
      href: `/${rolePrefix}/fiscal-years`,
      icon: FileText,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Reports",
      href: `/${rolePrefix}/reports`,
      icon: FileText,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "GL Statements",
      href: `/${rolePrefix}/reports/gl-statement`,
      icon: FileText,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Divisions",
      href: `/${rolePrefix}/divisions`,
      icon: Database,
      show: isDirector || isOperations,
    },
    {
      name: "Leads",
      href: `/${rolePrefix}/leads`,
      icon: Database,
      show: isDirector || isOperations,
    },
    {
      name: "COA",
      href: `/${rolePrefix}/coa`,
      icon: FileText,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Books",
      href: `/${rolePrefix}/books`,
      icon: FileText,
      show: isFinance,
    },
    {
      name: "Quotations",
      href: `/${rolePrefix}/quotations`,
      icon: FileBadge,
      show: isDirector || isOperations,
    },
    {
      name: "Invoices",
      href: `/${rolePrefix}/invoices`,
      icon: FileText,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Direct Sales",
      href: `/${rolePrefix}/sales/new`,
      icon: Zap,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Expenses",
      href: `/${rolePrefix}/expenses`,
      icon: Wallet,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "AR Aging",
      href: `/${rolePrefix}/reports/ar-aging`,
      icon: TrendingUpIcon,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Vendor Bills (AP)",
      href: `/${rolePrefix}/vendor-bills`,
      icon: Receipt,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Outflow Planner",
      href: `/${rolePrefix}/reports/cash-outflow`,
      icon: Wallet,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Payroll",
      href: `/${rolePrefix}/payroll`,
      icon: Users,
      show: isDirector || isFinance,
    },
    {
      name: "Staff Claims",
      href: `/${rolePrefix}/staff-claims`,
      icon: Receipt,
      show: isDirector || isFinance || isOperations || isEmployee,
    },
    {
      name: "Receipts",
      href: `/${rolePrefix}/receipts`,
      icon: Receipt,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Ledger",
      href: `/${rolePrefix}/journal-entries`,
      icon: FileText,
      show: isDirector || isFinance,
    },
    {
      name: "Partners",
      href: `/${rolePrefix}/partners`,
      icon: Users,
      show: isDirector || isFinance || isOperations,
    },
    {
      name: "Financials",
      href: `/${rolePrefix}/financials`,
      icon: FileText,
      show: isDirector,
    },
    {
      name: "Quick Transactions",
      href: isEmployee ? `/employee/transactions` : `/${rolePrefix}/simple-transactions`,
      icon: Database,
      show: isDirector || isFinance || isOperations || isEmployee,
    },
    {
      name: "Finance Guides",
      href: `/${rolePrefix}/guides`,
      icon: BookOpen,
      show: isDirector || isFinance,
    },
    {
      name: "Dashboard",
      href: `/employee/dashboard`,
      icon: LayoutDashboard,
      show: isEmployee,
    },
  ];


  return (
    <>
      <nav className="sticky top-0 w-full z-40 bg-slate-900 border-b border-slate-800 py-3 pr-2 shadow-2xl">
        <div className="mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src="/logo.png"
              alt="Corban Technologies Logo"
              width={140}
              height={38}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </Link>

          {/* Controls & Nav */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm text-white leading-none">
                {isLoading
                  ? "Loading..."
                  : `${account?.first_name} ${account?.last_name}`}
              </span>
              <span className={cn(
                "text-[10px] uppercase mt-1.5 px-3 py-1 rounded border shadow-sm",
                isDirector
                  ? "text-corporate-primary bg-corporate-primary/5 border-corporate-primary/20 shadow-corporate-primary/5"
                  : isFinance
                    ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5"
                    : isOperations
                      ? "text-blue-500 bg-blue-500/5 border-blue-500/20 shadow-blue-500/5"
                      : isEmployee
                        ? "text-slate-300 bg-slate-800 border-slate-700"
                        : "text-slate-400 bg-slate-800 border-slate-700"
              )}>
                {isDirector ? "Executive Director" : isFinance ? "Finance Controller" : isOperations ? "Operations Officer" : isEmployee ? "Field Staff" : "Portal User"}
              </span>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 hover:border-slate-700 shadow-2xl group"
            >
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] transition-opacity duration-300",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMenuOpen(false)}
      />

      {/* Side Menu Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-[300px] sm:w-[340px] max-w-[85vw] bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) border-l border-slate-800",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl">
            <Image
              src="/logo.png"
              alt="Logo"
              width={110}
              height={30}
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Section */}
          <div className="p-3.5 bg-slate-950/60 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold border shadow flex-shrink-0",
                isDirector
                  ? "bg-corporate-primary border-corporate-primary/30"
                  : isFinance
                    ? "bg-emerald-600 border-emerald-600/30"
                    : "bg-slate-800 border-slate-700"
              )}>
                {account?.first_name?.[0]}
                {account?.last_name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold tracking-tight truncate">
                  {account?.first_name} {account?.last_name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider",
                    isDirector
                      ? "bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20"
                      : isFinance
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : isOperations
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                  )}>
                    {isDirector ? "Director" : isFinance ? "Finance" : isOperations ? "Operations" : isEmployee ? "Field Staff" : "User"}
                  </span>
                  {activeYear && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700">
                      FY {activeYear.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all group border border-transparent font-medium",
                      isActive
                        ? "bg-slate-800 text-white border-slate-700 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center transition-colors flex-shrink-0",
                          isActive
                            ? isDirector
                              ? "bg-corporate-primary text-white"
                              : "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-400 group-hover:text-white",
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 flex-shrink-0",
                        isActive && (isDirector ? "text-corporate-primary opacity-100" : "text-emerald-500 opacity-100"),
                      )}
                    />
                  </Link>
                );
              })}
          </div>

          {/* Footer Action */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full h-10 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-red-500/20 shadow-sm group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Sign Out Securely
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
