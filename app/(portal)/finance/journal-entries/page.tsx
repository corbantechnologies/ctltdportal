/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useBulkPostJournals } from "@/hooks/journals/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/tools/format";
import JournalEntryDetailModal from "@/components/journals/JournalEntryDetailModal";
import { JournalEntry } from "@/services/journalentries";
import { exportJournalEntriesToCSV } from "@/tools/csvExport";
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

  // Selection helpers
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

  const selectedEntries = useMemo(() => {
    return entries.filter((e) => selectedRefs.includes(e.reference));
  }, [entries, selectedRefs]);

  // Distinct unposted journals from selected entries
  const unpostedSelectedJournals = useMemo(() => {
    const unposted = selectedEntries.filter(
      (e) => !e.journal_is_posted && e.journal_status !== "POSTED"
    );
    return Array.from(new Set(unposted.map((e) => e.journal).filter(Boolean)));
  }, [selectedEntries]);

  // Bulk Post Action (only for unposted journals)
  const handleBulkPost = async () => {
    if (unpostedSelectedJournals.length === 0) {
      toast.error("All selected entries belong to already posted journals.");
      return;
    }

    try {
      const res = await bulkPostMutation.mutateAsync(unpostedSelectedJournals);
      toast.success(res.message || `Successfully posted ${res.posted_count} journal(s).`);
      setSelectedRefs([]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || "Bulk post failed";
      toast.error(msg);
    }
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error("No journal entries available to export.");
      return;
    }

    exportJournalEntriesToCSV(
      entries,
      `gl_journal_entries_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success(`Exported ${entries.length} journal entry records to CSV.`);
  };

  const handleExportSelectedCSV = () => {
    if (selectedEntries.length === 0) {
      toast.error("No journal entries selected to export.");
      return;
    }

    exportJournalEntriesToCSV(
      selectedEntries,
      `selected_journal_entries_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success(`Exported ${selectedEntries.length} selected journal entries to CSV.`);
  };

  if (isLoadingDivisions || isLoadingYears) return <LoadingSpinner />;

  const isAllSelected = entries.length > 0 && selectedRefs.length === entries.length;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
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

        {/* Compact Header Actions in Popover */}
        <div className="flex items-center gap-2">
          <Link
            href="/finance/journal-entries/studio"
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Journal Studio</span>
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                <span>Actions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-[100] w-52 p-1 bg-white rounded border border-slate-200 shadow-lg text-xs"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href="/finance/journal-entries/bulk"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer outline-none font-medium"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bulk Batch Input</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                <DropdownMenu.Item
                  disabled={entries.length === 0}
                  onSelect={handleExportCSV}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer outline-none font-medium disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Page to CSV</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors font-mono">
                              {entry.journal}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase",
                                entry.journal_is_posted || entry.journal_status === "POSTED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              )}
                            >
                              {entry.journal_is_posted || entry.journal_status === "POSTED" ? "Posted" : "Draft"}
                            </span>
                          </div>
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-900 block">
                            {entry.journal}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-semibold px-1 py-0.2 rounded border uppercase",
                              entry.journal_is_posted || entry.journal_status === "POSTED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            {entry.journal_is_posted || entry.journal_status === "POSTED" ? "Posted" : "Draft"}
                          </span>
                        </div>
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

      {/* Floating Selection Toolbar */}
      {selectedRefs.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-2.5 sm:gap-3.5 max-w-[95vw] overflow-x-auto scrollbar-none animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-2.5 sm:pr-3.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono">{selectedRefs.length} selected</span>
          </div>

          <button
            type="button"
            onClick={handleExportSelectedCSV}
            className="flex items-center gap-1.5 text-xs font-semibold hover:text-emerald-400 transition-colors flex-shrink-0 cursor-pointer"
            title="Export selected journal entries to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {unpostedSelectedJournals.length > 0 ? (
            <button
              type="button"
              disabled={bulkPostMutation.isPending}
              onClick={handleBulkPost}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {bulkPostMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Bulk Post ({unpostedSelectedJournals.length})</span>
                </>
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>All Selected Posted</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setSelectedRefs([])}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors ml-0.5 flex-shrink-0 cursor-pointer"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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
