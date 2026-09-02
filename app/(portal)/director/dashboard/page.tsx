"use client";

import { useFetchAccount } from "@/hooks/accounts/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import DivisionsList from "@/components/divisions/DivisionsList";
import DirectorActionsMenu from "@/components/portal/DirectorActionsMenu";
import {
  Building2,
  Layers,
  Book,
  ScrollText,
  CalendarRange,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useFetchCOAs } from "@/hooks/coa/actions";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { GlobalSearch } from "@/components/navigation/GlobalSearch";
import AccountDistributionChart from "@/components/analytics/AccountDistributionChart";
import RecentActivityFeed from "@/components/analytics/RecentActivityFeed";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export default function DirectorDashboard() {
  const { data: account, isLoading: accountLoading } = useFetchAccount();
  const { data: coas, isLoading: coaLoading } = useFetchCOAs();
  const { data: books, isLoading: booksLoading } = useFetchBooks();
  const { data: years, isLoading: yearsLoading } = useFetchFinancialYears();
  const { data: entriesResponse, isLoading: entriesLoading } =
    useFetchJournalEntries();
  const entries = entriesResponse?.results || [];
  const { data: divisions, isLoading: divisionsLoading } = useFetchDivisions();

  const isLoading =
    accountLoading ||
    coaLoading ||
    booksLoading ||
    yearsLoading ||
    entriesLoading ||
    divisionsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      label: "Total Divisions",
      value: divisions?.length || 0,
      icon: Building2,
      description: "Operational Units",
      color: "text-corporate-primary",
      bg: "bg-corporate-primary/10",
    },
    {
      label: "Active Fiscal Year",
      value:
        years?.find((y: { is_active: boolean; code: string }) => y.is_active)
          ?.code || "N/A",
      icon: CalendarRange,
      description: `${years?.length || 0} Years Configured`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Chart of Accounts",
      value: coas?.length || 0,
      icon: Layers,
      description: "Active Ledgers",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Ledger Books",
      value: books?.length || 0,
      icon: Book,
      description: "Sub-accounts",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Journal Entries",
      value: entries?.length || 0,
      icon: ScrollText,
      description: "Total Transactions",
      color: "text-slate-900",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Ctrl + K Search */}
      <GlobalSearch role="director" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-corporate-primary flex items-center justify-center text-white shadow-lg shadow-corporate-primary/20">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-corporate-primary">
              Executive Command Center
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight italic">
            Director <span className="text-corporate-primary">Overview</span>
          </h1>
          <p className="text-slate-400 font-semibold mt-2 text-sm max-w-lg">
            Welcome back,{" "}
            <span className="text-slate-900">{account?.first_name}</span>.
            Corporate infrastructure and strategic audit trail monitoring
            active.
          </p>
        </div>
        <DirectorActionsMenu />
      </div>

      <Tabs.Root defaultValue="overview" className="space-y-10">
        <Tabs.List className="flex w-full overflow-x-auto md:inline-flex md:w-auto p-1.5 bg-slate-100 rounded border border-slate-200 shadow-inner scrollbar-hide">
          <Tabs.Trigger
            value="overview"
            className="shrink-0 whitespace-nowrap px-8 py-3 rounded text-[10px] font-semibold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-100 text-slate-400 hover:text-slate-600"
          >
            System Health
          </Tabs.Trigger>
          <Tabs.Trigger
            value="financials"
            className="shrink-0 whitespace-nowrap px-8 py-3 rounded text-[10px] font-semibold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-100 text-slate-400 hover:text-slate-600"
          >
            Fiscal Reports
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content
          value="overview"
          className="space-y-10 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500"
              >
                <div
                  className={cn(
                    "absolute top-0 right-0 w-24 h-24 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity",
                    stat.bg,
                  )}
                />
                <div className="relative z-10 flex flex-col gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded flex items-center justify-center shadow-inner",
                      stat.bg,
                      stat.color,
                    )}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-widest text-[9px] mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tighter">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <div className="lg:col-span-2">
              <AccountDistributionChart data={coas || []} />
            </div>
            <RecentActivityFeed entries={entries || []} />
          </div>

          {/* Divisions Section */}
          <div className="space-y-8 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  Unit Infrastructure
                </h2>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-1">
                  Real-time Operational Capacity
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 shadow-sm animate-pulse">
                <div className="w-2 h-2 rounded bg-emerald-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  System Online
                </span>
              </div>
            </div>
            <div className="bg-slate-50/50 p-1 rounded border border-slate-100">
              <DivisionsList rolePrefix="director" />
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content
          value="financials"
          className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div>
            <ReportsDashboard rolePrefix="director" />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
