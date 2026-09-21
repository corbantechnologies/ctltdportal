/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchLeads } from "@/hooks/leads/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import KpiStatCard from "@/components/portal/KpiStatCard";
import FilterTabs from "@/components/portal/FilterTabs";
import LeadsKanbanBoard from "./LeadsKanbanBoard";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Search,
  Plus,
  LayoutGrid,
  List,
  Columns3,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LeadsListProps {
  rolePrefix: string;
}

export default function LeadsList({ rolePrefix }: LeadsListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isLoading, data: leads } = useFetchLeads();

  // Metrics
  const metrics = useMemo(() => {
    if (!leads) return { total: 0, qualified: 0, proposals: 0, won: 0 };
    return {
      total: leads.length,
      qualified: leads.filter((l) => l.status === "QUALIFIED").length,
      proposals: leads.filter((l) => l.status === "PROPOSAL_SENT").length,
      won: leads.filter((l) => l.status === "WON").length,
    };
  }, [leads]);

  // Filtering
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      // Tab filter
      if (activeTab === "new" && lead.status !== "NEW") return false;
      if (activeTab === "qualified" && lead.status !== "QUALIFIED") return false;
      if (activeTab === "proposals" && lead.status !== "PROPOSAL_SENT") return false;
      if (activeTab === "won" && lead.status !== "WON") return false;

      // Search filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        lead.first_name.toLowerCase().includes(q) ||
        lead.last_name.toLowerCase().includes(q) ||
        (lead.company_name && lead.company_name.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q))
      );
    });
  }, [leads, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const filterTabs = [
    { id: "all", label: "All Leads", count: leads?.length || 0 },
    { id: "new", label: "New Prospects", count: leads?.filter((l) => l.status === "NEW").length || 0 },
    { id: "qualified", label: "Qualified", count: metrics.qualified },
    { id: "proposals", label: "Proposal Sent", count: metrics.proposals },
    { id: "won", label: "Deals Won", count: metrics.won },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CONTACTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "QUALIFIED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "PROPOSAL_SENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "WON":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LOST":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            CRM Sales &amp; Lead Pipeline
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track prospective clients, sales pipeline stages, and conversion to partner accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>

          <button
            onClick={() => router.push(`/${rolePrefix}/leads/new`)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          title="Active Prospects"
          value={metrics.total}
          subtitle="Total CRM pipeline volume"
          icon={Users}
          accentColor="blue"
        />
        <KpiStatCard
          title="Qualified Deals"
          value={metrics.qualified}
          subtitle="Ready for formal pricing"
          icon={ShieldCheck}
          accentColor="purple"
        />
        <KpiStatCard
          title="Proposals in Flight"
          value={metrics.proposals}
          subtitle="Commercial quotes issued"
          icon={Clock}
          accentColor="amber"
        />
        <KpiStatCard
          title="Converted & Won"
          value={metrics.won}
          subtitle={
            metrics.total > 0
              ? `${((metrics.won / metrics.total) * 100).toFixed(1)}% deal win rate`
              : "0% win rate"
          }
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, company, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold shadow-sm transition-all"
          />
        </div>

        {viewMode === "table" && (
          <FilterTabs
            tabs={filterTabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Main View: Kanban vs Table */}
      {viewMode === "kanban" ? (
        <LeadsKanbanBoard leads={filteredLeads} rolePrefix={rolePrefix} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Prospect Name</th>
                  <th className="py-4 px-6">Company / Organization</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6 text-right">Stage</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-blue-600" />
                      <p className="text-xs font-bold uppercase tracking-wider">No leads found</p>
                      <p className="text-slate-400 text-xs mt-1">Click "Add Prospect" to capture new opportunities</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr
                      key={lead.reference}
                      onClick={() => router.push(`/${rolePrefix}/leads/${lead.reference}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                              {lead.first_name} {lead.last_name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {lead.reference}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                            {lead.company_name || "Independent"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-0.5 text-[11px] font-mono">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-slate-700">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[180px]">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            getStatusColor(lead.status)
                          )}
                        >
                          {lead.status?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/${rolePrefix}/quotations/new?lead=${lead.reference}`}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1"
                          >
                            Quote
                          </Link>
                          <Link
                            href={`/${rolePrefix}/leads/${lead.reference}`}
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">
                Showing {paginatedLeads.length} of {filteredLeads.length} leads
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-slate-900 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
