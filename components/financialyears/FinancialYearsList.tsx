"use client";

import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  CalendarRange,
  ArrowRight,
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

interface FinancialYearsListProps {
  rolePrefix: string;
}

export default function FinancialYearsList({
  rolePrefix,
}: FinancialYearsListProps) {
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { isLoading, data: financialYears } = useFetchFinancialYears();

  const filteredYears = useMemo(() => {
    if (!financialYears) return [];

    return financialYears.filter(
      (year) =>
        year.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        year.reference.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [financialYears, searchQuery]);

  const totalPages = Math.ceil(filteredYears.length / itemsPerPage);
  const paginatedYears = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredYears.slice(start, start + itemsPerPage);
  }, [filteredYears, currentPage]);

  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!financialYears || financialYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 rounded bg-white flex items-center justify-center text-gray-400 mb-4 shadow-sm border border-gray-100">
          <CalendarRange className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          No fiscal years registered
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded border border-black/5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20"
              style={{ color: searchQuery ? primaryColor : undefined }}
            />
            <input
              type="text"
              placeholder="Search by code or reference..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 w-full rounded border border-black/5 bg-black/5 focus:bg-white transition-all font-semibold text-xs focus:outline-none focus:ring-1"
              style={
                {
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded self-end lg:self-auto">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest transition-all ${view === "grid"
              ? "bg-white shadow-sm text-black"
              : "text-black/40 hover:text-black"
              }`}
            style={{ color: view === "grid" ? primaryColor : undefined }}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest transition-all ${view === "table"
              ? "bg-white shadow-sm text-black"
              : "text-black/40 hover:text-black"
              }`}
            style={{ color: view === "table" ? primaryColor : undefined }}
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {paginatedYears.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-gray-300 uppercase tracking-[0.2em]">
            No fiscal years match your criteria
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedYears.map((year) => (
            <Link
              key={year.reference}
              href={`/${rolePrefix}/fiscal-years/${year.reference}`}
              className="group"
            >
              <div className="border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-300 rounded overflow-hidden bg-white/80 backdrop-blur-xl group-hover:-translate-y-1">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center transition-all duration-300 shadow-inner"
                      style={{
                        backgroundColor: `${primaryColor}1A`, // 10% opacity
                        color: primaryColor,
                      }}
                    >
                      <CalendarRange className="w-5 h-5" />
                    </div>
                    {year.is_active ? (
                      <span className="bg-green-500/10 text-green-600 border-none font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded inline-block">
                        Active
                      </span>
                    ) : (
                      <span className="bg-black/5 text-black/40 border-none font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded inline-block">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-black tracking-tight transition-colors line-clamp-1 group-hover:text-opacity-80">
                      {year.code}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-semibold text-black/40">
                        {new Date(year.start_date).toLocaleDateString()} -{" "}
                        {new Date(year.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-black/40">
                        view details
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-black/20 group-hover:text-[#D0402B] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur-xl border border-black/5 rounded overflow-hidden shadow-xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-black/5">
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Fiscal Code
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Period
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Estimated Profit
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Status
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paginatedYears.map((year) => (
                  <tr
                    key={year.reference}
                    className="transition-colors group hover:bg-black/5"
                  >
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <Link
                        href={`/${rolePrefix}/fiscal-years/${year.reference}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded bg-black/5 flex items-center justify-center text-black/30 transition-all font-semibold group-hover:bg-white group-hover:shadow-sm">
                          <CalendarRange className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black transition-colors">
                            {year.code}
                          </p>
                          <p className="text-[10px] font-semibold text-black/30 uppercase tracking-widest mt-0.5">
                            {year.reference}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white text-black/60 border border-black/10 font-semibold text-[9px] py-0 px-2 rounded inline-block">
                          {new Date(year.start_date).toLocaleDateString()}
                        </span>
                        <span className="text-black/20">-</span>
                        <span className="bg-white text-black/60 border border-black/10 font-semibold text-[9px] py-0 px-2 rounded inline-block">
                          {new Date(year.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5 text-sm font-medium">{year.estimated_profit}</td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      {year.is_active ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-black/30">
                          <div className="w-1.5 h-1.5 rounded bg-black/20" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Closed
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right border-b border-black/5">
                      <Link
                        href={`/${rolePrefix}/fiscal-years/${year.reference}`}
                      >
                        <button
                          className="h-7 w-7 p-0 rounded hover:bg-white flex items-center justify-center hover:shadow-sm hover:text-black transition-all duration-300 text-black/30"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded border border-black/5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">
            Showing <span className="text-black">{paginatedYears.length}</span>{" "}
            of <span className="text-black">{filteredYears.length}</span> years
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center w-8 h-8 p-0 border border-black/5 rounded bg-white shadow-sm transition-all disabled:opacity-30 hover:text-white"
              style={{ "--hover-bg": primaryColor } as React.CSSProperties}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-[10px] font-semibold transition-all ${currentPage === page
                        ? "text-white shadow-md"
                        : "bg-white border border-black/5 text-black/40 hover:text-black shadow-sm"
                        }`}
                      style={
                        {
                          backgroundColor:
                            currentPage === page ? primaryColor : undefined,
                          boxShadow:
                            currentPage === page
                              ? `0 4px 6px -1px ${primaryColor}33`
                              : undefined,
                        } as React.CSSProperties
                      }
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <MoreHorizontal
                      key={page}
                      className="w-3 h-3 text-black/20"
                    />
                  );
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center justify-center w-8 h-8 p-0 border border-black/5 rounded bg-white shadow-sm transition-all disabled:opacity-30 hover:text-white"
              style={{ "--hover-bg": primaryColor } as React.CSSProperties}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
