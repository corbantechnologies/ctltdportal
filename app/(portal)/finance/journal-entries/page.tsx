/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useBulkPostJournals } from "@/hooks/journals/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  Search,
  Calendar,
  Filter,
  X,
  FileText,
  ArrowUpRight,
  CheckSquare,
  Square,
  Zap,
  Download,
  Loader2,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatNumber } from "@/tools/format";
import JournalEntryDetailModal from "@/components/journals/JournalEntryDetailModal";
import { JournalEntry } from "@/services/journalentries";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function JournalEntriesPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [division, setDivision] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [initialYearSet, setInitialYearSet] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("20");

  // Selection state for bulk operations
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);

  // Debounce the text search to avoid refetching on every single keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Active filters sent to API
  const activeFilters: Record<string, string> = {
    page: page.toString(),
    limit: limit,
  };
  if (debouncedSearchQuery) activeFilters["search"] = debouncedSearchQuery;
  if (startDate) activeFilters["start_date"] = startDate;
  if (endDate) activeFilters["end_date"] = endDate;
  if (division) activeFilters["division"] = division;
  if (financialYear) activeFilters["financial_year"] = financialYear;

  const { data: entriesResponse, isLoading: isLoadingEntries } =
    useFetchJournalEntries(activeFilters);
  const entries: JournalEntry[] = entriesResponse?.results || [];
  const totalCount = entriesResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();
  const { data: years, isLoading: isLoadingYears } = useFetchFinancialYears();

  const bulkPostMutation = useBulkPostJournals();

  useEffect(() => {
    if (years && !initialYearSet) {
      const active = years.find((y: any) => y.is_active);
      if (active) {
        setFinancialYear(active.reference);
      }
      setInitialYearSet(true);
    }
  }, [years, initialYearSet]);

  // Modal state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setDivision("");
    setFinancialYear("");
    setPage(1);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedRefs.length === entries.length) {
      setSelectedRefs([]);
    } else {
      setSelectedRefs(entries.map((e) => e.reference));
    }
  };

  const handleToggleSelect = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRefs((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref]
    );
  };

  // Bulk Post Action
  const handleBulkPost = async () => {
    if (selectedRefs.length === 0) {
      toast.error("Please select at least one entry to post.");
      return;
    }

    // Extract unique journals from selected entries
    const selectedEntriesList = entries.filter((e) =>
      selectedRefs.includes(e.reference)
    );
    const uniqueJournalCodes = Array.from(
      new Set(selectedEntriesList.map((e) => e.journal).filter(Boolean))
    );

    if (uniqueJournalCodes.length === 0) {
      toast.error("No valid journals found in selected entries.");
      return;
    }

    try {
      const res = await bulkPostMutation.mutateAsync(uniqueJournalCodes);
      toast.success(res.message || `Successfully posted ${res.posted_count} journal(s).`);
      setSelectedRefs([]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || "Bulk post failed";
      toast.error(msg);
    }
  };

  if (isLoadingDivisions || isLoadingYears) return <LoadingSpinner />;

  const isAllSelected = entries.length > 0 && selectedRefs.length === entries.length;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              General Ledger Archive
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Journal <span className="text-emerald-600 font-bold">Entries &amp; Batches</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Double-entry audit trail across all divisions. Select draft journals to execute batch postings.
          </p>
        </div>

        {/* Selected Batch Actions Bar */}
        {selectedRefs.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-xl shadow-lg border border-slate-800 animate-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-bold font-mono">
              {selectedRefs.length} selected
            </span>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              disabled={bulkPostMutation.isPending}
              onClick={handleBulkPost}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {bulkPostMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Bulk Post</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelectedRefs([])}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors ml-1"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white/60 p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative group lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, description, account..."
              className="pl-10 h-10 w-full bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Division Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-semibold text-slate-700 outline-none transition-all cursor-pointer truncate"
            >
              <option value="">All Divisions</option>
              {divisions?.map((div) => (
                <option key={div.reference} value={div.reference}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fiscal Year Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={financialYear}
              onChange={(e) => {
                setFinancialYear(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-semibold text-slate-700 outline-none transition-all cursor-pointer truncate"
            >
              <option value="">All Fiscal Years</option>
              {years?.map((yr) => (
                <option key={yr.reference} value={yr.reference}>
                  {yr.code}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 w-16">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 w-16">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* List Section */}
      {isLoadingEntries ? (
        <LoadingSpinner />
      ) : entries && entries.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="p-1 hover:text-slate-900 transition-colors"
                      title={isAllSelected ? "Deselect All" : "Select All"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Date &amp; Ref</th>
                  <th className="py-3 px-4">Journal / Division</th>
                  <th className="py-3 px-4">Account / Book</th>
                  <th className="py-3 px-4 text-right">Debit</th>
                  <th className="py-3 px-4 text-right">Credit</th>
                  <th className="py-3 px-4 text-center">Document</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  const isSelected = selectedRefs.includes(entry.reference);
                  return (
                    <tr
                      key={entry.reference}
                      className={cn(
                        "hover:bg-slate-50/80 transition-colors cursor-pointer group",
                        isSelected && "bg-emerald-50/40"
                      )}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelect(entry.reference, e)}
                          className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* Date & Ref */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900">
                            {new Date(entry.created_at).toLocaleDateString("en-GB")}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                            {entry.reference}
                          </span>
                        </div>
                      </td>

                      {/* Journal / Division */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors font-mono">
                            {entry.journal}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">
                            {entry.division}
                          </span>
                        </div>
                      </td>

                      {/* Account / Book */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {entry.book}
                        </span>
                      </td>

                      {/* Debit */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {formatNumber(Number(entry.debit))}
                        </span>
                        <div className="text-[9px] text-slate-400 uppercase">{entry.currency}</div>
                      </td>

                      {/* Credit */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {formatNumber(Number(entry.credit))}
                        </span>
                        <div className="text-[9px] text-slate-400 uppercase">{entry.currency}</div>
                      </td>

                      {/* Document */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="text-[11px] font-mono text-slate-500">
                          {entry.document_number || "N/A"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400 group-hover:text-slate-900">
                          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (100% Responsiveness Guaranteed!) */}
          <div className="md:hidden divide-y divide-slate-100">
            {entries.map((entry) => {
              const isSelected = selectedRefs.includes(entry.reference);
              return (
                <div
                  key={entry.reference}
                  onClick={() => setSelectedEntry(entry)}
                  className={cn(
                    "p-4 space-y-2.5 hover:bg-slate-50 transition-colors",
                    isSelected && "bg-emerald-50/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelect(entry.reference, e)}
                        className="mt-0.5 p-1 text-slate-400 hover:text-slate-900"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900 block">
                          {entry.journal}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {entry.reference}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 block">
                        Dr: {formatNumber(Number(entry.debit))}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 block">
                        Cr: {formatNumber(Number(entry.credit))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="font-medium text-slate-700">{entry.book}</span>
                    <span className="uppercase text-[10px]">{entry.division}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">
                Rows:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value);
                  setPage(1);
                }}
                className="h-8 pl-2.5 pr-6 rounded border border-slate-200 bg-white font-semibold text-xs text-slate-700 outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="font-semibold text-slate-500">
                Total: <strong className="text-slate-900 font-mono">{totalCount}</strong> records
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <span className="font-semibold text-slate-500 mx-1">
                Page {page} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="h-8 px-3 rounded border border-slate-200 bg-emerald-50 font-semibold text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-200 p-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
            No Journal Entries Found
          </h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto text-xs">
            Adjust your search filters, dates, or fiscal year to view matching general ledger entries.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <JournalEntryDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
