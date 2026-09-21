/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";
import { useFetchCOAs } from "@/hooks/coa/actions";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import { useFetchInvoices } from "@/hooks/financials/actions";
import { useFetchVendorBills } from "@/hooks/vendorbills/actions";
import { useFetchPayrollRuns } from "@/hooks/payrollruns/actions";
import * as Tabs from "@radix-ui/react-tabs";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { GlobalSearch } from "@/components/navigation/GlobalSearch";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import AccountDistributionChart from "@/components/analytics/AccountDistributionChart";
import RecentActivityFeed from "@/components/analytics/RecentActivityFeed";
import KpiStatCard from "@/components/portal/KpiStatCard";
import {
  Layers,
  Settings2,
  Users,
  BookOpen,
  Building2,
  Briefcase,
  CalendarRange,
  TrendingUp,
  Receipt as ReceiptIcon,
  Banknote,
  ShieldCheck,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export default function FinanceDashboard() {
  const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();
  const { data: journalTypes } = useFetchJournalTypes();
  const { data: partnerTypes } = useFetchPartnerTypes();
  const { data: coas } = useFetchCOAs();
  const { data: books } = useFetchBooks();
  const { data: years } = useFetchFinancialYears();
  const { data: entriesResponse } = useFetchJournalEntries();
  const { data: invoices } = useFetchInvoices();
  const { data: vendorBillsResponse } = useFetchVendorBills();
  const { data: payrollRunsResponse } = useFetchPayrollRuns();

  const rawEntries = (entriesResponse as any)?.results || entriesResponse;
  const entries: any[] = Array.isArray(rawEntries) ? rawEntries : [];
  const vendorBills = (vendorBillsResponse as any)?.results || (Array.isArray(vendorBillsResponse) ? vendorBillsResponse : []);
  const payrollRuns = (payrollRunsResponse as any)?.results || (Array.isArray(payrollRunsResponse) ? payrollRunsResponse : []);

  // Active Fiscal Year
  const activeFiscalYear = useMemo(() => {
    return years?.find((y: { is_active: boolean; code: string }) => y.is_active) || years?.[0] || null;
  }, [years]);

  // Compute AR (Accounts Receivable) from Invoices
  const arMetrics = useMemo(() => {
    if (!invoices || !Array.isArray(invoices)) return { totalDue: 0, openCount: 0, totalInvoiced: 0 };
    let totalDue = 0;
    let openCount = 0;
    let totalInvoiced = 0;

    invoices.forEach((inv: any) => {
      const items = inv.items || inv.lines;
      const total = typeof inv.total_amount === "number" ? inv.total_amount : (items?.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || (parseFloat(item.quantity) * parseFloat(item.unit_price)) || 0), 0) || 0);
      const paid = inv.receipts?.reduce((sum: number, r: any) => sum + parseFloat(r.amount || "0"), 0) || 0;
      const due = Math.max(0, total - paid);
      totalInvoiced += total;
      if (due > 0) {
        totalDue += due;
        openCount++;
      }
    });

    return { totalDue, openCount, totalInvoiced };
  }, [invoices]);

  // Compute AP (Accounts Payable) from Vendor Bills & Pending Payroll
  const apMetrics = useMemo(() => {
    let totalDue = 0;
    let openCount = 0;

    if (Array.isArray(vendorBills)) {
      vendorBills.forEach((bill: any) => {
        const total = parseFloat(bill.total_amount || bill.amount || "0");
        const paid = parseFloat(bill.amount_paid || "0");
        const due = Math.max(0, total - paid);
        if (due > 0) {
          totalDue += due;
          openCount++;
        }
      });
    }

    // Include unapproved / pending payroll runs
    if (Array.isArray(payrollRuns)) {
      payrollRuns.forEach((run: any) => {
        if (run.status !== "PAID") {
          totalDue += parseFloat(run.total_net_pay || run.total_gross_pay || "0");
        }
      });
    }

    return { totalDue, openCount };
  }, [vendorBills, payrollRuns]);

  // Compute Cash / Liquid Balances
  const cashLiquidity = useMemo(() => {
    if (!books || !Array.isArray(books)) return 0;
    return books.reduce((sum: number, b: any) => {
      const isBankOrCash = (b.name || "").toLowerCase().includes("bank") ||
        (b.name || "").toLowerCase().includes("cash") ||
        (b.name || "").toLowerCase().includes("mpesa");
      if (isBankOrCash) {
        return sum + (parseFloat(b.current_balance || b.balance || "0"));
      }
      return sum;
    }, 0);
  }, [books]);

  // Net Working Capital
  const netWorkingCapital = cashLiquidity + arMetrics.totalDue - apMetrics.totalDue;

  // Statutory Tax & Payroll Deadlines (Kenya - 9th & 20th of the month)
  const statutoryCalendar = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysToNinth = currentDay <= 9 ? 9 - currentDay : (new Date(today.getFullYear(), today.getMonth() + 1, 9).getTime() - today.getTime()) / (1000 * 3600 * 24);
    const daysToTwentieth = currentDay <= 20 ? 20 - currentDay : (new Date(today.getFullYear(), today.getMonth() + 1, 20).getTime() - today.getTime()) / (1000 * 3600 * 24);

    return [
      {
        name: "PAYE Income Tax",
        deadline: "9th of Month",
        daysRemaining: Math.ceil(daysToNinth),
        code: "KRA-PAYE",
        status: currentDay <= 9 ? "Due Soon" : "Upcoming Next Cycle",
      },
      {
        name: "SHIF / NHIF Health",
        deadline: "9th of Month",
        daysRemaining: Math.ceil(daysToNinth),
        code: "SHA-SHIF",
        status: currentDay <= 9 ? "Due Soon" : "Upcoming Next Cycle",
      },
      {
        name: "NSSF Pension Tier I & II",
        deadline: "9th of Month",
        daysRemaining: Math.ceil(daysToNinth),
        code: "NSSF-KE",
        status: currentDay <= 9 ? "Due Soon" : "Upcoming Next Cycle",
      },
      {
        name: "Affordable Housing Levy",
        deadline: "9th of Month",
        daysRemaining: Math.ceil(daysToNinth),
        code: "AHL-1.5%",
        status: currentDay <= 9 ? "Due Soon" : "Upcoming Next Cycle",
      },
      {
        name: "VAT 16% Return",
        deadline: "20th of Month",
        daysRemaining: Math.ceil(daysToTwentieth),
        code: "KRA-VAT",
        status: currentDay <= 20 ? "On Track" : "Upcoming Next Cycle",
      },
    ];
  }, []);

  if (isLoadingDivisions) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12">
      <GlobalSearch role="finance" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Finance <span className="text-emerald-600">Portal</span>
            </h1>
            {activeFiscalYear && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                FY {activeFiscalYear.code || (activeFiscalYear as any)?.name || "Active"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fiscal policy audit, working capital monitoring, and strategic ledger execution engine.
          </p>
        </div>

        <Link
          href="/finance/guides"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-tight transition-all shadow-sm group"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-105 transition-transform" />
          <span>Finance Reference</span>
        </Link>
      </div>

      {/* Quick Action Command Hub */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-2 whitespace-nowrap hidden md:inline">
            Direct Actions:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/finance/receipts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <ReceiptIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Record Receipt</span>
            </Link>

            <Link
              href="/finance/vendor-bills"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Post Vendor Bill</span>
            </Link>

            <Link
              href="/finance/payroll"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 hover:border-purple-300 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Banknote className="w-3.5 h-3.5 text-purple-600" />
              <span>Run Payroll</span>
            </Link>

            <Link
              href="/finance/staff-claims"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
              <span>Staff Claims</span>
            </Link>

            <Link
              href="/finance/simple-transactions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Simple Inflow/Outflow</span>
            </Link>

            <Link
              href="/finance/coa"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chart of Accounts</span>
            </Link>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="overview" className="space-y-6">
        <Tabs.List className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Tabs.Trigger
            value="overview"
            className="px-3 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            Financial Health &amp; Operations
          </Tabs.Trigger>
          <Tabs.Trigger
            value="reports"
            className="px-3 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            Financial Statements &amp; Reports
          </Tabs.Trigger>
          <Tabs.Trigger
            value="architecture"
            className="px-3 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            Master Structure
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: Overview */}
        <Tabs.Content value="overview" className="space-y-6 focus-visible:outline-none">
          {/* Executive Working Capital KPI Band */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiStatCard
              title="Cash & Bank Liquidity"
              value={`KES ${cashLiquidity.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${books?.length || 0} Sub-Ledger Books`}
              icon={Banknote}
              accentColor="emerald"
            />
            <KpiStatCard
              title="Accounts Receivable (AR)"
              value={`KES ${arMetrics.totalDue.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${arMetrics.openCount} Unpaid Customer Invoices`}
              icon={ReceiptIcon}
              accentColor="blue"
            />
            <KpiStatCard
              title="Accounts Payable (AP)"
              value={`KES ${apMetrics.totalDue.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${apMetrics.openCount} Pending Vendor Obligations`}
              icon={CreditCard}
              accentColor="amber"
            />
            <KpiStatCard
              title="Net Working Capital"
              value={`KES ${netWorkingCapital.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Liquid Assets + AR - AP"
              icon={TrendingUp}
              accentColor={netWorkingCapital >= 0 ? "emerald" : "rose"}
            />
          </div>

          {/* 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Cash Velocity & Live Financial Ledger Feed (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Cash Velocity Summary Card */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Cash Velocity &amp; Revenue Overview
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      Operational Inflows &amp; Direct Allocations
                    </p>
                  </div>
                  <Link
                    href="/finance/invoices"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Open Invoices &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Total Invoiced Volume
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900 block mt-1 tabular-nums">
                      KES {arMetrics.totalInvoiced.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {invoices?.length || 0} Total Generated
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                      Cleared Collections
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900 block mt-1 tabular-nums">
                      KES {(arMetrics.totalInvoiced - arMetrics.totalDue).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Settled to General Ledger
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                      Collection Efficiency
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900 block mt-1 tabular-nums">
                      {arMetrics.totalInvoiced > 0
                        ? `${Math.round(((arMetrics.totalInvoiced - arMetrics.totalDue) / arMetrics.totalInvoiced) * 100)}%`
                        : "100%"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Receipt Realization Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Financial Ledger Stream */}
              <RecentActivityFeed entries={entries} />
            </div>

            {/* Right Column: Statutory Deadlines, Portfolio Distribution, Active Period (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Kenyan Statutory Tax & Payroll Deadlines Card */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Statutory Compliance
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      Kenya Tax &amp; Payroll Schedule
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    KRA / SHA / NSSF
                  </span>
                </div>

                <div className="space-y-2.5">
                  {statutoryCalendar.map((item) => (
                    <div
                      key={item.code}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-200/80 text-slate-600">
                            {item.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">Due: {item.deadline}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 block">
                          {item.daysRemaining}d left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Distribution Chart */}
              <AccountDistributionChart data={coas || []} />

              {/* Active Fiscal Period Card */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Active Fiscal Configuration
                  </span>
                  <CalendarRange className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-500">Fiscal Period:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {activeFiscalYear?.code || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-500">Audit Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Active &amp; Open
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-500">Chart Ledgers:</span>
                    <span className="font-semibold text-slate-900">{coas?.length || 0} Established</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href="/finance/fiscal-years"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center justify-between"
                  >
                    <span>Manage Fiscal Years &amp; Monthly Closures</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Tab 2: Financial Reports */}
        <Tabs.Content value="reports" className="focus-visible:outline-none">
          <ReportsDashboard rolePrefix="finance" />
        </Tabs.Content>

        {/* Tab 3: Master Architecture */}
        <Tabs.Content value="architecture" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Operational Units */}
            <div className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Operational Units
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Sub-ledgers</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                  {divisions?.length || 0} Units
                </span>
              </div>
              <div className="space-y-2">
                {divisions?.map((division) => (
                  <div
                    key={division.reference}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center gap-3 transition-colors text-xs"
                  >
                    <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-slate-500 border border-slate-200 flex-shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-900 truncate">{division.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal Logic */}
            <div className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Journal Logic
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Transaction Schemas</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                  {journalTypes?.length || 0} Types
                </span>
              </div>
              <div className="space-y-2">
                {journalTypes?.map((type) => (
                  <div
                    key={type.reference}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 space-y-1 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{type.name}</span>
                    </div>
                    {type.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 pl-5.5">
                        {type.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ecosystem Partners */}
            <div className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Partner Ecosystem
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Categorization Schemes</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                  {partnerTypes?.length || 0} Categories
                </span>
              </div>
              <div className="space-y-2">
                {partnerTypes?.map((type) => (
                  <div
                    key={type.reference}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 space-y-1 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{type.name}</span>
                    </div>
                    {type.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 pl-5.5">
                        {type.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
