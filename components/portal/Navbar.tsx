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
  ChevronDown,
  BookOpen,
  Wallet,
  Zap,
  Receipt,
  FileBadge,
  Users,
  TrendingUp,
  Search,
  Landmark,
  Layers,
  Scale,
  Calendar,
  Building2,
  PieChart,
  HelpCircle,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
  description?: string;
}

interface NavCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: account, isLoading } = useFetchAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

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

  const { data: years } = useFetchFinancialYears();
  const activeYear = years?.find(
    (y: { is_active: boolean; reference: string }) => y.is_active,
  );

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Define categorized navigation structure
  const categories: NavCategory[] = useMemo(() => [
    {
      id: "accounting",
      name: "Accounting & Ledgers",
      icon: BookOpen,
      items: [
        {
          name: "Chart of Accounts (COA)",
          href: `/${rolePrefix}/coa`,
          icon: Layers,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "General ledger account hierarchy",
        },
        {
          name: "Financial Books",
          href: `/${rolePrefix}/books`,
          icon: BookOpen,
          show: Boolean(isFinance),
          description: "Sub-ledgers & multi-book journals",
        },
        {
          name: "Ledger & Journal Entries",
          href: `/${rolePrefix}/journal-entries`,
          icon: FileText,
          show: Boolean(isDirector || isFinance),
          description: "Double-entry transaction audit trail",
        },
        {
          name: "Financial Statements",
          href: `/${rolePrefix}/financials`,
          icon: Scale,
          show: Boolean(isDirector),
          description: "P&L, Balance Sheet & Trial Balance",
        },
        {
          name: "All Fiscal Years",
          href: `/${rolePrefix}/fiscal-years`,
          icon: Calendar,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Fiscal periods and period closing",
        },
        ...(activeYear
          ? [
              {
                name: `Current Year (${activeYear.code || "Active"})`,
                href: `/${rolePrefix}/fiscal-years/${activeYear.reference}`,
                icon: Landmark,
                show: Boolean(isDirector || isFinance || isOperations),
                description: "Active fiscal year performance",
              },
            ]
          : []),
      ],
    },
    {
      id: "sales",
      name: "Sales & Invoicing",
      icon: Zap,
      items: [
        {
          name: "Direct Sales (POS)",
          href: `/${rolePrefix}/sales/new`,
          icon: Zap,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Rapid direct sales & immediate receipt",
        },
        {
          name: "Invoices (AR)",
          href: `/${rolePrefix}/invoices`,
          icon: FileText,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Sales invoices and receivables",
        },
        {
          name: "Quotations",
          href: `/${rolePrefix}/quotations`,
          icon: FileBadge,
          show: Boolean(isDirector || isOperations),
          description: "Customer estimates and proposals",
        },
        {
          name: "Customer Receipts",
          href: `/${rolePrefix}/receipts`,
          icon: Receipt,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Payment collections and allocations",
        },
        {
          name: "Quick Transactions",
          href: isEmployee ? `/employee/transactions` : `/${rolePrefix}/simple-transactions`,
          icon: Database,
          show: Boolean(isDirector || isFinance || isOperations || isEmployee),
          description: "Fast single-entry transaction logger",
        },
      ],
    },
    {
      id: "payables",
      name: "Payables & Expenses",
      icon: Wallet,
      items: [
        {
          name: "Vendor Bills (AP)",
          href: `/${rolePrefix}/vendor-bills`,
          icon: Receipt,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Accounts payable & supplier invoices",
        },
        {
          name: "Expense Studio",
          href: `/${rolePrefix}/expenses`,
          icon: Wallet,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Operating expenses & cost centers",
        },
        {
          name: "Payroll Management",
          href: `/${rolePrefix}/payroll`,
          icon: Users,
          show: Boolean(isDirector || isFinance),
          description: "Staff compensation & payroll runs",
        },
        {
          name: "Staff Expense Claims",
          href: `/${rolePrefix}/staff-claims`,
          icon: Receipt,
          show: Boolean(isDirector || isFinance || isOperations || isEmployee),
          description: "Reimbursements & claim requests",
        },
        {
          name: "Cash Outflow Planner",
          href: `/${rolePrefix}/reports/cash-outflow`,
          icon: TrendingUp,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Projected obligations & cash commitments",
        },
      ],
    },
    {
      id: "crm",
      name: "CRM & Operations",
      icon: Users,
      items: [
        {
          name: "Partners & Contacts",
          href: `/${rolePrefix}/partners`,
          icon: Users,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Customers, vendors and directory",
        },
        {
          name: "Sales Leads",
          href: `/${rolePrefix}/leads`,
          icon: Database,
          show: Boolean(isDirector || isOperations),
          description: "Lead capture & pipeline status",
        },
        {
          name: "Divisions & Units",
          href: `/${rolePrefix}/divisions`,
          icon: Building2,
          show: Boolean(isDirector || isOperations),
          description: "Business units and cost centers",
        },
      ],
    },
    {
      id: "reports",
      name: "Reports & Intelligence",
      icon: PieChart,
      items: [
        {
          name: "Analytics & Reports",
          href: `/${rolePrefix}/reports`,
          icon: PieChart,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Executive dashboards and KPI summaries",
        },
        {
          name: "GL Statements",
          href: `/${rolePrefix}/reports/gl-statement`,
          icon: FileText,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Account transaction ledger statements",
        },
        {
          name: "AR Aging Matrix",
          href: `/${rolePrefix}/reports/ar-aging`,
          icon: TrendingUp,
          show: Boolean(isDirector || isFinance || isOperations),
          description: "Receivables aging buckets & risk profile",
        },
        {
          name: "Finance Guides",
          href: `/${rolePrefix}/guides`,
          icon: HelpCircle,
          show: Boolean(isDirector || isFinance),
          description: "Compliance and operating standards",
        },
      ],
    },
  ], [rolePrefix, isDirector, isFinance, isOperations, isEmployee, activeYear]);

  // Dashboard Item
  const dashboardItem: NavItem = {
    name: "Dashboard",
    href: isEmployee ? `/employee/dashboard` : `/${rolePrefix}/dashboard`,
    icon: LayoutDashboard,
    show: true,
  };

  // Filter categories to only those with accessible items
  const visibleCategories = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const matchesRole = item.show;
          const matchesSearch =
            !searchQuery.trim() ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            cat.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesRole && matchesSearch;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, searchQuery]);

  // Auto-expand category containing current active route on mount / route change
  useEffect(() => {
    const activeCat = categories.find((cat) =>
      cat.items.some((item) => item.show && pathname === item.href)
    );
    if (activeCat) {
      setOpenCategories((prev) => ({
        ...prev,
        [activeCat.id]: true,
      }));
    }
  }, [pathname, categories]);

  // If user is searching, expand all visible categories
  useEffect(() => {
    if (searchQuery.trim()) {
      const allOpen: Record<string, boolean> = {};
      visibleCategories.forEach((cat) => {
        allOpen[cat.id] = true;
      });
      setOpenCategories(allOpen);
    }
  }, [searchQuery, visibleCategories]);

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const isDashboardActive = pathname === dashboardItem.href;

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 w-full z-40 bg-slate-900 border-b border-slate-800 py-2.5 pr-2 shadow-2xl">
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

          {/* Controls & Nav Trigger */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white leading-none">
                {isLoading
                  ? "Loading..."
                  : `${account?.first_name || ""} ${account?.last_name || ""}`}
              </span>
              <span
                className={cn(
                  "text-[10px] uppercase mt-1.5 px-2.5 py-0.5 rounded font-semibold border shadow-sm tracking-wider",
                  isDirector
                    ? "text-corporate-primary bg-corporate-primary/5 border-corporate-primary/20 shadow-corporate-primary/5"
                    : isFinance
                      ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5"
                      : isOperations
                        ? "text-blue-500 bg-blue-500/5 border-blue-500/20 shadow-blue-500/5"
                        : isEmployee
                          ? "text-slate-300 bg-slate-800 border-slate-700"
                          : "text-slate-400 bg-slate-800 border-slate-700"
                )}
              >
                {isDirector
                  ? "Executive Director"
                  : isFinance
                    ? "Finance Controller"
                    : isOperations
                      ? "Operations Officer"
                      : isEmployee
                        ? "Field Staff"
                        : "Portal User"}
              </span>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 hover:border-slate-700 shadow-lg group active:scale-95"
            >
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] transition-opacity duration-300",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMenuOpen(false)}
      />

      {/* Side Menu Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-[310px] sm:w-[360px] max-w-[90vw] bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-out border-l border-slate-800 flex flex-col",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo"
              width={110}
              height={30}
              className="h-6 w-auto object-contain brightness-0 invert"
            />
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 min-h-[34px] min-w-[34px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Section */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold border shadow-inner flex-shrink-0",
                isDirector
                  ? "bg-corporate-primary border-corporate-primary/30"
                  : isFinance
                    ? "bg-emerald-600 border-emerald-600/30"
                    : isOperations
                      ? "bg-blue-600 border-blue-600/30"
                      : "bg-slate-800 border-slate-700"
              )}
            >
              {account?.first_name?.[0]}
              {account?.last_name?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold tracking-tight truncate">
                {account?.first_name} {account?.last_name}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider",
                    isDirector
                      ? "bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20"
                      : isFinance
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : isOperations
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                  )}
                >
                  {isDirector
                    ? "Director"
                    : isFinance
                      ? "Finance"
                      : isOperations
                        ? "Operations"
                        : isEmployee
                          ? "Field Staff"
                          : "User"}
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

        {/* Quick Search */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Categories & Accordions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Dashboard Standalone Item */}
          {(!searchQuery ||
            dashboardItem.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <Link
              href={dashboardItem.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group border shadow-sm",
                isDashboardActive
                  ? isDirector
                    ? "bg-corporate-primary text-white border-corporate-primary/40 shadow-corporate-primary/10"
                    : isFinance
                      ? "bg-emerald-600 text-white border-emerald-600/40 shadow-emerald-600/10"
                      : "bg-blue-600 text-white border-blue-600/40 shadow-blue-600/10"
                  : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors",
                    isDashboardActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-400 group-hover:text-white"
                  )}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Main Dashboard</span>
              </div>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5",
                  isDashboardActive && "opacity-100"
                )}
              />
            </Link>
          )}

          {/* Categorized Dropdown Accordions */}
          {visibleCategories.map((category) => {
            const isOpen = Boolean(openCategories[category.id]);
            const hasActiveChild = category.items.some(
              (item) => pathname === item.href
            );
            const CategoryIcon = category.icon;

            return (
              <div
                key={category.id}
                className="rounded-lg border border-slate-800/80 bg-slate-950/30 overflow-hidden transition-all shadow-sm"
              >
                {/* Category Header Dropdown Trigger */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors select-none group",
                    hasActiveChild
                      ? "text-white bg-slate-800/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/30"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryIcon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        hasActiveChild
                          ? isDirector
                            ? "text-corporate-primary"
                            : isFinance
                              ? "text-emerald-400"
                              : "text-blue-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span className="truncate tracking-tight">{category.name}</span>
                    {hasActiveChild && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50">
                      {category.items.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-white"
                      )}
                    />
                  </div>
                </button>

                {/* Collapsible Category Links List */}
                {isOpen && (
                  <div className="p-1.5 space-y-1 bg-slate-900/40 border-t border-slate-800/60 animate-in fade-in duration-200">
                    {category.items.map((item) => {
                      const isActive = pathname === item.href;
                      const ItemIcon = item.icon;

                      return (
                        <Link
                          key={item.href + item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group border border-transparent",
                            isActive
                              ? isDirector
                                ? "bg-corporate-primary text-white border-corporate-primary/30 shadow-sm"
                                : isFinance
                                  ? "bg-emerald-600 text-white border-emerald-600/30 shadow-sm"
                                  : "bg-blue-600 text-white border-blue-600/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ItemIcon
                              className={cn(
                                "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                                isActive
                                  ? "text-white"
                                  : "text-slate-500 group-hover:text-slate-300"
                              )}
                            />
                            <div className="min-w-0">
                              <p className="truncate leading-tight font-medium">
                                {item.name}
                              </p>
                              {item.description && !isActive && (
                                <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5 hidden sm:block">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5",
                              isActive && "opacity-100 text-white"
                            )}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state for search */}
          {visibleCategories.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
              <Search className="w-6 h-6 mx-auto mb-2 text-slate-500 opacity-60" />
              <p className="font-semibold text-slate-300">No navigation items found</p>
              <p className="text-[11px] text-slate-400 mt-1">
                No items match &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full h-9 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-red-500/20 shadow-sm group active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Sign Out Securely</span>
          </button>
        </div>
      </aside>
    </>
  );
}
