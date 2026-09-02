"use client";

import { useState } from "react";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";
import { useFetchCOAs } from "@/hooks/coa/actions";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import CreateJournalType from "@/forms/journaltypes/CreateJournalType";
import * as Tabs from "@radix-ui/react-tabs";
import CreatePartnerType from "@/forms/partnertypes/CreatePartnerType";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { GlobalSearch } from "@/components/navigation/GlobalSearch";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import AccountDistributionChart from "@/components/analytics/AccountDistributionChart";
import RecentActivityFeed from "@/components/analytics/RecentActivityFeed";
import {
  Layers,
  Settings2,
  Users,
  Plus,
  BookOpen,
  X,
  Building2,
  Briefcase,
  CalendarRange,
  Book,
  ScrollText,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanceDashboard() {
  const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();
  const { data: journalTypes, isLoading: isLoadingJournalTypes } = useFetchJournalTypes();
  const { data: partnerTypes, isLoading: isLoadingPartnerTypes } = useFetchPartnerTypes();
  const { data: coas } = useFetchCOAs();
  const { data: books } = useFetchBooks();
  const { data: years } = useFetchFinancialYears();
  const { data: entriesResponse } = useFetchJournalEntries();
  const entries = entriesResponse?.results || [];

  const [openCreateJournalType, setOpenCreateJournalType] = useState(false);
  const [openCreatePartnerType, setOpenCreatePartnerType] = useState(false);

  if (isLoadingDivisions || isLoadingJournalTypes || isLoadingPartnerTypes)
    return <LoadingSpinner />;

  const stats = [
    {
      label: "Total Divisions",
      value: divisions?.length || 0,
      icon: Building2,
      description: "Operational Units",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Fiscal Year",
      value: years?.find((y: { is_active: boolean; code: string }) => y.is_active)?.code || "N/A",
      icon: CalendarRange,
      description: `${years?.length || 0} Years Configured`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Chart of Accounts",
      value: coas?.length || 0,
      icon: Layers,
      description: "Active Ledgers",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
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
    {
      label: "Journal Types",
      value: journalTypes?.length || 0,
      icon: BookOpen,
      description: "Categories",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Partner Types",
      value: partnerTypes?.length || 0,
      icon: Users,
      description: "Entities",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      <GlobalSearch role="finance" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-xl md:text-xl text-slate-900 tracking-tight">
            Finance <span className="text-emerald-600">Portal</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">
            Fiscal policy audit, system configuration, and strategic resource allocation engine.
          </p>
        </div>
      </div>

      <Tabs.Root defaultValue="reports" className="space-y-6">
        <Tabs.List className="grid w-auto grid-cols-3">
          <Tabs.Trigger
            value="reports"
            className="p-1 rounded text-[10px] md:text-xs uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 hover:text-slate-700"
          >
            Reports
          </Tabs.Trigger>
          <Tabs.Trigger
            value="overview"
            className="p-1 rounded text-[10px] md:text-xs uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 hover:text-slate-700"
          >
            Health
          </Tabs.Trigger>
          <Tabs.Trigger
            value="configuration"
            className="p-1 rounded text-[10px] md:text-xs uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 hover:text-slate-700"
          >
            Architecture
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-10 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.slice(0, 4).map((stat, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500"
              >
                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity", stat.bg)} />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className={cn("w-8 h-8 rounded flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold text-[10px] mb-1">
                      {stat.label}
                    </p>
                    <h3 className="font-semibold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <div className="lg:col-span-1">
              <AccountDistributionChart data={coas || []} />
            </div>
            <div className="space-y-8 lg:col-span-1">
              <RecentActivityFeed entries={entries || []} />
            </div>
            <div className="space-y-8 lg:col-span-1">
              <div className="bg-slate-900 p-4 rounded border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-600/30 transition-colors" />
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-6">Tactical Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setOpenCreateJournalType(true)}
                      className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded border border-white/10 text-sm transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform text-emerald-400" />
                      Add Journal Type
                    </button>
                    <button
                      onClick={() => setOpenCreatePartnerType(true)}
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow-lg shadow-emerald-600/20 text-sm transition-all flex items-center justify-center gap-3"
                    >
                      <Plus className="w-4 h-4" />
                      Add Partner Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="configuration" className="space-y-10 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Divisions Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Operational Units
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Sub-ledgers</p>
                </div>
                <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200 uppercase">
                  {divisions?.length || 0} Total
                </div>
              </div>
              <div className="space-y-3">
                {divisions?.map((division) => (
                  <div
                    key={division.reference}
                    className="group bg-white p-5 rounded border border-slate-200 hover:border-emerald-600/20 hover:shadow-xl hover:shadow-slate-100 transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {division.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal Types Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Journal Logic
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Transaction Schemas</p>
                </div>
                <button
                  onClick={() => setOpenCreateJournalType(true)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 hover:shadow-lg hover:shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {journalTypes?.map((type) => (
                  <div
                    key={type.reference}
                    className="group bg-white p-5 rounded border border-slate-200 hover:border-emerald-600/20 hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                        <Settings2 className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">{type.name}</h3>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight line-clamp-2 px-1">
                      {type.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Types Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Ecosystem
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Partner Entities</p>
                </div>
                <button
                  onClick={() => setOpenCreatePartnerType(true)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 hover:shadow-lg hover:shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {partnerTypes?.map((type) => (
                  <div
                    key={type.reference}
                    className="group bg-white p-5 rounded border border-slate-200 hover:border-emerald-600/20 hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">{type.name}</h3>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight line-clamp-2 px-1">
                      {type.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="reports" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <ReportsDashboard rolePrefix="finance" />
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Manual Modals */}
      {openCreateJournalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
            <CreateJournalType
              rolePrefix="finance"
              onSuccess={() => setOpenCreateJournalType(false)}
              onClose={() => setOpenCreateJournalType(false)}
            />
          </div>
        </div>
      )}

      {openCreatePartnerType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
            <CreatePartnerType
              rolePrefix="finance"
              onSuccess={() => setOpenCreatePartnerType(false)}
              onClose={() => setOpenCreatePartnerType(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
