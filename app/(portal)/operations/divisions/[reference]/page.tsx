"use client";

import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { useFetchDivision } from "@/hooks/divisions/actions";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  History,
  Calendar,
  Activity,
  ArrowUpRight,
  Receipt,
  Users,
  ChevronLeft,
  Briefcase,
  Layers,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export default function DivisionDetail() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();

  const { isLoading: isLoadingDivision, data: division } = useFetchDivision(reference);

  if (isLoadingDivision) {
    return <LoadingSpinner />;
  }

  const quickStats = [
    {
      label: "Foundation",
      value: division?.created_at ? new Date(division.created_at).toLocaleDateString() : "—",
      icon: Calendar,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Partnership",
      value: `${division?.partners?.length || 0} Registered`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Unit Type",
      value: "Operational",
      icon: Briefcase,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Navigation & Breadcrumb */}
      <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-slate-900">{division?.name}</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
              Institutional Intelligence
            </p>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight italic">
            {division?.name} <span className="text-blue-600">Protocol</span>
          </h1>
          <p className="text-slate-400 font-semibold mt-3 text-sm max-w-2xl leading-relaxed">
            Consolidated operational overview and financial audit trail for the <span className="text-slate-900">{division?.name}</span> unit.
            Monitoring resource utilization and mission-critical ledger entries.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-100 shadow-xl shadow-slate-100/50">
          {division?.is_active ? (
            <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
              <div className="w-2 h-2 rounded bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Active Operational Status</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-400 rounded border border-slate-200">
              <div className="w-2 h-2 rounded bg-slate-300" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Unit Offline</span>
            </div>
          )}
        </div>
      </div>

      <Tabs.Root defaultValue="overview" className="space-y-10">
        <Tabs.List className="inline-flex p-1.5 bg-slate-100 rounded border border-slate-200 shadow-inner">
          <Tabs.Trigger
            value="overview"
            className="px-8 py-3 rounded text-[10px] font-semibold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-100 text-slate-400 hover:text-slate-600"
          >
            Unit Summary
          </Tabs.Trigger>
          <Tabs.Trigger
            value="financials"
            className="px-8 py-3 rounded text-[10px] font-semibold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-100 text-slate-400 hover:text-slate-600"
          >
            Financial Audit
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-10 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickStats.map((stat, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500"
              >
                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity", stat.bg)} />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className={cn("w-12 h-12 rounded flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-widest text-[9px] mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Partners List Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Associated <span className="text-blue-600">Ecosystem</span>
                  </h2>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">
                    Stakeholders & Personnel mapped to this unit
                  </p>
                </div>
                <div className="px-5 py-2 bg-slate-900 text-white rounded text-[10px] font-semibold border border-slate-800 uppercase shadow-xl shadow-slate-900/20">
                  {division?.partners?.length || 0} Registered
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {division?.partners && division.partners.length > 0 ? (
                  division.partners.map((partner: any) => (
                    <div
                      key={partner.reference}
                      className="group bg-white p-6 rounded border border-slate-200 hover:border-blue-600/20 hover:shadow-2xl hover:shadow-slate-100 transition-all flex items-center gap-5"
                    >
                      <div className="w-14 h-14 rounded bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {partner.name || `Partner ${partner.reference.slice(0, 8)}`}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                          {partner.role || "Corporate Partner"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-20 bg-slate-50/50 rounded border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No active partnerships detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-8">
              <div className="bg-slate-900 p-10 rounded text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold tracking-tight">Mission Status</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Audit Frequency</span>
                      <span className="text-xs font-semibold">Real-time</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Ledger Health</span>
                      <span className="text-xs font-semibold text-emerald-400">Stable</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Classification</span>
                      <span className="text-xs font-semibold uppercase tracking-tighter">Strategic Unit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="financials" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded border border-slate-200 shadow-2xl shadow-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  Financial <span className="text-blue-600">Audit Trail</span>
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-1">
                  Immutable Mission Ledger Logs
                </p>
              </div>
              <div className="px-5 py-2.5 bg-white text-slate-900 rounded text-[10px] font-semibold border border-slate-200 uppercase shadow-sm">
                {division?.journal_entries?.length || 0} Transactions Found
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-6 px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                    <th className="py-6 px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Reference</th>
                    <th className="py-6 px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Category</th>
                    <th className="py-6 px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">Debit</th>
                    <th className="py-6 px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">Credit</th>
                    <th className="py-6 px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {division?.journal_entries && division.journal_entries.length > 0 ? (
                    division.journal_entries.map((entry: any) => (
                      <tr key={entry.reference} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-8 px-10">
                          <p className="text-sm font-semibold text-slate-900">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="py-8 px-10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-semibold text-slate-900 tracking-tight">
                              {entry.reference}
                            </p>
                          </div>
                        </td>
                        <td className="py-8 px-10">
                          <span className="px-3 py-1 bg-slate-900 text-[9px] font-semibold text-white rounded uppercase tracking-widest">
                            {entry.journal}
                          </span>
                        </td>
                        <td className="py-8 px-10 text-right">
                          <p className="text-sm font-semibold text-slate-500">
                            {entry.currency} {parseFloat(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="py-8 px-10 text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {entry.currency} {parseFloat(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="py-8 px-10">
                          <div className="flex justify-center">
                            <button className="w-10 h-10 rounded bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-blue-600/20">
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                            <History className="w-10 h-10" />
                          </div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">No transactional data available</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
