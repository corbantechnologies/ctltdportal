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
import KpiStatCard from "@/components/portal/KpiStatCard";
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
    <div className="space-y-6 pb-12">
      {/* Ctrl + K Search */}
      <GlobalSearch role="director" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Director <span className="text-corporate-primary">Overview</span>
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
              Command Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Welcome back, <span className="text-slate-900 font-medium">{account?.first_name}</span>. Corporate infrastructure and strategic ledger oversight active.
          </p>
        </div>
        <DirectorActionsMenu />
      </div>

      <Tabs.Root defaultValue="overview" className="space-y-6">
        <Tabs.List className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Tabs.Trigger
            value="overview"
            className="px-3.5 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            System Health &amp; Units
          </Tabs.Trigger>
          <Tabs.Trigger
            value="financials"
            className="px-3.5 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            Fiscal Reports &amp; Statements
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content
          value="overview"
          className="space-y-6 focus-visible:outline-none"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, i) => (
              <KpiStatCard
                key={i}
                title={stat.label}
                value={stat.value}
                subtitle={stat.description}
                icon={stat.icon}
                accentColor={
                  i === 0
                    ? "amber"
                    : i === 1
                      ? "emerald"
                      : i === 2
                        ? "blue"
                        : i === 3
                          ? "purple"
                          : "slate"
                }
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <AccountDistributionChart data={coas || []} />
            </div>
            <div className="lg:col-span-4">
              <RecentActivityFeed entries={entries || []} />
            </div>
          </div>

          {/* Divisions Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Unit Infrastructure
                </h2>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  Real-time Operational Capacity
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-[10px] font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Online</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <DivisionsList rolePrefix="director" />
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content
          value="financials"
          className="focus-visible:outline-none"
        >
          <ReportsDashboard rolePrefix="director" />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
