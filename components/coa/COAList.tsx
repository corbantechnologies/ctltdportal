"use client";

import { useFetchCOAs } from "@/hooks/coa/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  Database,
  ArrowRight,
  LayoutGrid,
  List,
  Search,
  Activity,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Hash,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

type CSSWithVariables = React.CSSProperties & {
  [key: string]: string | number;
};

interface COAListProps {
  rolePrefix: string;
}

export default function COAList({ rolePrefix }: COAListProps) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { isLoading, data: coas } = useFetchCOAs();

  const filteredCOAs = useMemo(() => {
    if (!coas) return [];

    return coas.filter(
      (coa) =>
        coa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coa.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coa.reference.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [coas, searchQuery]);

  const totalPages = Math.ceil(filteredCOAs.length / itemsPerPage);
  const paginatedCOAs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCOAs.slice(start, start + itemsPerPage);
  }, [filteredCOAs, currentPage]);

  const primaryColor = rolePrefix === "director" ? "#D0402B" : rolePrefix === "operations" ? "#2563EB" : "#045138";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!coas || coas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-black/5 rounded border-2 border-dashed border-black/10">
        <div className="w-16 h-16 rounded bg-white flex items-center justify-center text-black/20 mb-4 shadow-sm">
          <Database className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-black/40 uppercase tracking-widest">
          No accounts registered in COA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/50 backdrop-blur-xl p-2 rounded border border-black/5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20"
              style={
                {
                  color: searchQuery ? primaryColor : undefined,
                } as CSSWithVariables
              }
            />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 w-full rounded border border-black/5 bg-black/5 focus:bg-white transition-all font-semibold text-xs focus:outline-none focus:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded self-end lg:self-auto">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold uppercase transition-all ${view === "grid"
              ? "bg-white shadow-sm"
              : "text-black/40 hover:text-black"
              }`}
            style={
              {
                color: view === "grid" ? primaryColor : undefined,
              } as CSSWithVariables
            }
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold uppercase transition-all ${view === "table"
              ? "bg-white shadow-sm"
              : "text-black/40 hover:text-black"
              }`}
            style={
              {
                color: view === "table" ? primaryColor : undefined,
              } as CSSWithVariables
            }
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {paginatedCOAs.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-black/20 uppercase tracking-[0.2em]">
            No accounts match your criteria
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCOAs.map((coa) => (
            <Link
              key={coa.reference}
              href={`/${rolePrefix}/coa/${coa.reference}`}
              className="group"
            >
              <div className="border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-300 rounded overflow-hidden bg-white/80 backdrop-blur-xl group-hover:-translate-y-1">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center group-hover:text-white transition-all duration-300 shadow-inner"
                      style={
                        {
                          backgroundColor: `${primaryColor}1A`, // 10% opacity
                          color: primaryColor,
                          "--hover-bg": primaryColor,
                        } as CSSWithVariables
                      }
                    >
                      <Hash className="w-5 h-5" />
                    </div>
                    {coa.is_active ? (
                      <span className="bg-green-500/10 text-green-600 border-none font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded inline-block">
                        Active
                      </span>
                    ) : (
                      <span className="bg-black/5 text-black/40 border-none font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded inline-block">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3
                      className="text-base font-semibold text-black tracking-tight transition-colors line-clamp-1"
                      style={
                        {
                          "--hover-text": primaryColor,
                        } as CSSWithVariables
                      }
                    >
                      {coa.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-widest"
                        style={{ color: primaryColor } as CSSWithVariables}
                      >
                        CODE: {coa.code}
                      </p>
                      <span className="w-1 h-1 rounded bg-black/10" />
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                        REF: {coa.reference}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/5">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-black/20" />
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-black/40">
                        {coa.normal_balance} Balance
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
                    Account Name
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Code
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Type / Balance
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Status
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paginatedCOAs.map((coa) => (
                  <tr
                    key={coa.reference}
                    onClick={() =>
                      router.push(`/${rolePrefix}/coa/${coa.reference}`)
                    }
                    className="transition-colors group cursor-pointer"
                    style={
                      {
                        "--hover-bg": `${primaryColor}0D`,
                      } as CSSWithVariables
                    } // 5% opacity
                  >
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded bg-black/5 flex items-center justify-center text-black/30 transition-all font-semibold"
                          style={
                            {
                              "--group-hover-bg": `${primaryColor}33`, // 20% opacity
                              "--group-hover-text": primaryColor,
                            } as CSSWithVariables
                          }
                        >
                          <Hash className="w-4 h-4" />
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium text-black transition-colors"
                            style={
                              {
                                "--group-hover-text": primaryColor,
                              } as CSSWithVariables
                            }
                          >
                            {coa.name}
                          </p>
                          <p className="text-[10px] font-semibold text-black/30 uppercase tracking-widest mt-0.5">
                            {coa.reference}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <span className="bg-black/5 text-black border border-black/5 font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-none inline-block">
                        {coa.code}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3 h-3 text-black/30" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-black/60">
                          {coa.normal_balance}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      {coa.is_active ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                          <span className="text-[9px] font-semibold uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-black/30">
                          <div className="w-1.5 h-1.5 rounded bg-black/20" />
                          <span className="text-[9px] font-semibold uppercase tracking-wider">
                            Inactive
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right border-b border-black/5">
                      <Link
                        href={`/${rolePrefix}/coa/${coa.reference}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="flex items-center justify-center h-7 w-7 p-0 rounded hover:text-white transition-all duration-300"
                          style={
                            {
                              "--hover-bg": primaryColor,
                            } as CSSWithVariables
                          }
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
            Showing <span className="text-black">{paginatedCOAs.length}</span>{" "}
            of <span className="text-black">{filteredCOAs.length}</span>{" "}
            accounts
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center w-8 h-8 p-0 border border-black/5 rounded bg-white shadow-sm transition-all disabled:opacity-30 hover:text-white"
              style={{ "--hover-bg": primaryColor } as CSSWithVariables}
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
                        } as CSSWithVariables
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
              style={{ "--hover-bg": primaryColor } as CSSWithVariables}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
