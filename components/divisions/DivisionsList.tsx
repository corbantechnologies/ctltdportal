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
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-slate-50 rounded border-2 border-dashed border-slate-200">
        <div className="w-12 h-12 rounded bg-white flex items-center justify-center text-slate-300 mb-3 shadow-sm border border-slate-100">
          <Database className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-900 tracking-tight">System Base Empty</h4>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Establish infrastructure units to begin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-xs group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors">
            <Search className={cn("w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors", searchQuery && primaryColorClass)} />
          </div>
          <input
            type="text"
            placeholder="Search divisions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-9 sm:h-10 pl-9 pr-3 rounded border border-slate-200 bg-white focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-medium text-xs sm:text-sm text-slate-900 shadow-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded border border-slate-200">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all",
              view === "grid"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all",
              view === "table"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in duration-300">
        {paginatedDivisions.length === 0 ? (
          <div className="py-12 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              No results found
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDivisions.map((division) => (
              <Link
                key={division.reference}
                href={`/${rolePrefix}/divisions/${division.reference}`}
                className="group block"
              >
                <div className="bg-white border border-slate-200 shadow-sm rounded p-4 sm:p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group-hover:shadow-corporate-primary/10">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={cn("w-9 h-9 rounded flex items-center justify-center transition-all border border-slate-100 shadow-inner bg-slate-50 group-hover:bg-slate-900 group-hover:text-white")}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className={cn("px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 border",
                      division.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", division.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                      {division.is_active ? "Active" : "Legacy"}
                    </div>
                  </div>

                  <div className="relative z-10 mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight group-hover:text-corporate-primary transition-colors">
                      {division.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">REF:</span>
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{division.reference}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between relative z-10 group/btn">
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", primaryColorClass)}>
                      Manage Unit
                    </span>
                    <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Organizational Unit
                    </th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Nomenclature
                    </th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Operational State
                    </th>
                    <th className="text-right py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white transition-all shadow-inner border border-transparent">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm">{division.name}</span>
                            <span className="text-[10px] font-medium text-slate-400">{division.reference}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700 tracking-tight">{division.code || "STD-CORP"}</span>
                          <span className="text-[10px] font-medium text-slate-400">Central Division</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
                          division.is_active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", division.is_active ? "bg-emerald-500" : "bg-slate-300")} />
                          {division.is_active ? "Operational" : "Decommissioned"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href={`/${rolePrefix}/divisions/${division.reference}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
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
