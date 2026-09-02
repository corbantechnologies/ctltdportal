"use client";

import { useFetchDivisions } from "@/hooks/divisions/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  Database,
  ArrowRight,
  Layers,
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Activity,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DivisionsListProps {
  rolePrefix: string;
}

export default function DivisionsList({ rolePrefix }: DivisionsListProps) {
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isLoading, data: divisions } = useFetchDivisions();

  const filteredDivisions = useMemo(() => {
    if (!divisions) return [];

    return divisions.filter(
      (division) =>
        division.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        division.reference.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [divisions, searchQuery]);

  const totalPages = Math.ceil(filteredDivisions.length / itemsPerPage);
  const paginatedDivisions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDivisions.slice(start, start + itemsPerPage);
  }, [filteredDivisions, currentPage]);

  const primaryColorClass = rolePrefix === "director" ? "text-corporate-primary" : rolePrefix === "operations" ? "text-blue-600" : "text-emerald-600";
  const primaryBgClass = rolePrefix === "director" ? "bg-corporate-primary" : rolePrefix === "operations" ? "bg-blue-600" : "bg-emerald-600";
  const primaryBorderClass = rolePrefix === "director" ? "border-corporate-primary/20" : rolePrefix === "operations" ? "border-blue-600/20" : "border-emerald-600/20";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!divisions || divisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-slate-50 rounded border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 rounded bg-white flex items-center justify-center text-slate-200 mb-6 shadow-xl border border-slate-100">
          <Database className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-semibold text-slate-900 tracking-tight">System Base Empty</h4>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">
          Establish infrastructure units to begin
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
            placeholder="Search by name or reference..."
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
        {paginatedDivisions.length === 0 ? (
          <div className="py-24 text-center">
            <ShieldAlert className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-base font-semibold text-slate-400 uppercase tracking-[0.2em]">
              No results found
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedDivisions.map((division) => (
              <Link
                key={division.reference}
                href={`/${rolePrefix}/divisions/${division.reference}`}
                className="group block"
              >
                <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-100 rounded p-8 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group-hover:shadow-corporate-primary/10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-corporate-primary/5 transition-colors" />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={cn("w-14 h-14 rounded flex items-center justify-center transition-all duration-500 border border-slate-100 shadow-inner bg-slate-50 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg",)}>
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className={cn("px-4 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 shadow-sm border",
                      division.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                      <div className={cn("w-2 h-2 rounded", division.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                      {division.is_active ? "Active" : "Legacy"}
                    </div>
                  </div>

                  <div className="relative z-10 mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight group-hover:text-corporate-primary transition-colors">
                      {division.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">REF:</span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{division.reference}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative z-10 group/btn">
                    <span className={cn("text-[10px] font-semibold uppercase tracking-widest", primaryColorClass)}>
                      Manage Unit
                    </span>
                    <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:rotate-45 transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded shadow-2xl shadow-slate-100 overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Organizational Unit
                    </th>
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Nomenclature
                    </th>
                    <th className="text-left py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Operational State
                    </th>
                    <th className="text-right py-6 px-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Access
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDivisions.map((division) => (
                    <tr
                      key={division.reference}
                      className="group/row hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white transition-all shadow-inner border border-transparent group-hover/row:border-slate-800">
                            <Database className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">{division.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Division Unit</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded border border-slate-200 shadow-sm">
                          {division.reference}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-widest border",
                          division.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5" : "bg-slate-50 text-slate-400 border-slate-100")}>
                          <div className={cn("w-1.5 h-1.5 rounded", division.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                          {division.is_active ? "Operational" : "Deactivated"}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <Link
                          href={`/${rolePrefix}/divisions/${division.reference}`}
                          className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-slate-800 hover:shadow-xl hover:rotate-12 group/btn"
                        >
                          <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
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
            Trace Level: <span className="text-slate-900">{paginatedDivisions.length}</span> / <span className="text-slate-900">{filteredDivisions.length}</span>
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
