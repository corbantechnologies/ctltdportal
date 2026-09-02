"use client";

import { useFetchLeads } from "@/hooks/leads/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  Users,
  ArrowRight,
  UserPlus,
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldAlert,
  Mail,
  Phone,
  Building2,
  Globe,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import UpdateLeadStatusModal from "@/forms/leads/UpdateLead";

interface LeadsListProps {
  rolePrefix: string;
}

export default function LeadsList({ rolePrefix }: LeadsListProps) {
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isLoading, data: leads } = useFetchLeads();

  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter(
      (lead) =>
        lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.reference.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [leads, searchQuery]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const primaryColorClass = rolePrefix === "director" ? "text-corporate-primary" : "text-blue-600";
  const primaryBgClass = rolePrefix === "director" ? "bg-corporate-primary" : "bg-blue-600";
  const primaryBorderClass = rolePrefix === "director" ? "border-corporate-primary/20" : "border-blue-600/20";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "CONTACTED":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "QUALIFIED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PROPOSAL_SENT":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "WON":
        return "bg-green-50 text-green-600 border-green-100";
      case "LOST":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-slate-50 rounded border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 rounded bg-white flex items-center justify-center text-slate-200 mb-6 shadow-xl border border-slate-100">
          <Users className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-semibold text-slate-900 tracking-tight">Lead Pipeline Empty</h4>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">
          Capture new leads to begin the sales cycle
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search & View Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors">
            <Search className={cn("w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors", searchQuery && primaryColorClass)} />
          </div>
          <input
            type="text"
            placeholder="Search leads by name, email, company..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-16 pl-14 pr-6 rounded border border-slate-200 bg-white/80 backdrop-blur-md focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-semibold text-sm text-slate-900 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded border border-slate-200 shadow-inner overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded text-[10px] font-semibold uppercase tracking-widest transition-all",
              view === "grid"
                ? "bg-white text-slate-900 shadow-md border border-slate-100"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded text-[10px] font-semibold uppercase tracking-widest transition-all",
              view === "table"
                ? "bg-white text-slate-900 shadow-md border border-slate-100"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <List className="w-4 h-4" />
            Table
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in duration-700">
        {paginatedLeads.length === 0 ? (
          <div className="py-24 text-center">
            <ShieldAlert className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-base font-semibold text-slate-400 uppercase tracking-[0.2em]">
              No results found
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedLeads.map((lead) => (
              <div
                key={lead.reference}
                className="group block"
              >
                <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-100 rounded p-8 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/5 transition-colors" />

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-14 h-14 rounded flex items-center justify-center transition-all duration-500 border border-slate-100 shadow-inner bg-slate-50 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className={cn("px-4 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 shadow-sm border", getStatusColor(lead.status))}>
                      <div className={cn("w-2 h-2 rounded", lead.status === "NEW" ? "bg-blue-500 animate-pulse" : "bg-current")} />
                      {lead.status}
                    </div>
                  </div>

                  <div className="relative z-10 mb-6 flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {lead.first_name} {lead.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">{lead.company_name}</span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            <Globe className="w-3 h-3" />
                            {lead.country}
                        </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <UpdateLeadStatusModal lead={lead} trigger={
                        <button className={cn("text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity", primaryColorClass)}>
                            <Edit className="w-3.5 h-3.5" />
                            Update Status
                        </button>
                    } />
                    <Link href={`/${rolePrefix}/leads/${lead.reference}`} className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white group-hover:rotate-45 transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded shadow-2xl shadow-slate-100 overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Prospect
                    </th>
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Company
                    </th>
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Contact
                    </th>
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </th>
                    <th className="text-right py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.reference}
                      className="group/row hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white transition-all shadow-inner border border-transparent group-hover/row:border-slate-800">
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">{lead.first_name} {lead.last_name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{lead.reference}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{lead.company_name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{lead.division}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <Mail className="w-3 h-3 text-slate-300" />
                                {lead.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <Phone className="w-3 h-3 text-slate-300" />
                                {lead.phone}
                            </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-widest border", getStatusColor(lead.status))}>
                          <div className={cn("w-1.5 h-1.5 rounded", lead.status === "NEW" ? "bg-blue-500 animate-pulse" : "bg-current")} />
                          {lead.status}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <UpdateLeadStatusModal lead={lead} trigger={
                                <button className="inline-flex items-center justify-center w-10 h-10 rounded bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-transparent hover:shadow-lg group/edit">
                                    <Edit className="w-4 h-4" />
                                </button>
                            } />
                            <Link
                              href={`/${rolePrefix}/leads/${lead.reference}`}
                              className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-slate-800 hover:shadow-xl hover:rotate-12 group/btn"
                            >
                              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2rem] text-slate-400">
            Pipeline Depth: <span className="text-slate-900">{paginatedLeads.length}</span> / <span className="text-slate-900">{filteredLeads.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-12 h-12 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-20 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-slate-100 p-1 rounded border border-slate-200">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isSelected = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded text-[10px] font-semibold transition-all",
                      isSelected
                        ? "bg-slate-900 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {String(page).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-12 h-12 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-20 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
