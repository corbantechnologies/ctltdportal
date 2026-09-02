"use client";

import { useState, useEffect } from "react";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { Search, Calendar, Filter, X, FileText, ArrowUpRight } from "lucide-react";
import { formatNumber } from "@/tools/format";
import JournalEntryDetailModal from "@/components/journals/JournalEntryDetailModal";
import { JournalEntry } from "@/services/journalentries";

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

    const { data: entriesResponse, isLoading: isLoadingEntries } = useFetchJournalEntries(activeFilters);
    const entries = entriesResponse?.results || [];
    const totalCount = entriesResponse?.count || 0;
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();
    const { data: years, isLoading: isLoadingYears } = useFetchFinancialYears();

    useEffect(() => {
        if (years && !initialYearSet) {
            const active = years.find((y: any) => y.is_active);
            if (active) {
                setFinancialYear(active.reference);
            }
            // Mark as initialized so user can clear it later without it auto-resetting
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

    if (isLoadingDivisions || isLoadingYears) return <LoadingSpinner />;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-xl md:text-xl text-slate-900 tracking-tight">
                        Journal <span className="text-emerald-600">Entries</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-lg">
                        Global ledger of all posted and pending financial transactions across all divisions.
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white/40 p-4 sm:p-6 rounded border border-white/60 backdrop-blur-md shadow-sm space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {/* Search */}
                    <div className="relative group lg:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by reference, description, etc..."
                            className="pl-11 h-12 w-full bg-white/80 border border-black/5 rounded transition-all font-medium text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1); // Reset page on filter change
                            }}
                        />
                    </div>

                    {/* Division Filter */}
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 transition-colors" />
                        <select
                            value={division}
                            onChange={(e) => {
                                setDivision(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-12 pl-11 pr-4 rounded border border-black/5 bg-white/80 focus:ring-2 focus:ring-emerald-600/30 outline-none transition-all font-semibold text-[10px] uppercase tracking-widest appearance-none text-black/60 cursor-pointer shadow-sm hover:bg-white"
                        >
                            <option value="">All Divisions</option>
                            {divisions?.map((div) => (
                                <option key={div.reference} value={div.reference}>{div.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fiscal Year Filter */}
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 transition-colors" />
                        <select
                            value={financialYear}
                            onChange={(e) => {
                                setFinancialYear(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-12 pl-11 pr-4 rounded border border-black/5 bg-white/80 focus:ring-2 focus:ring-emerald-600/30 outline-none transition-all font-semibold text-[10px] uppercase tracking-widest appearance-none text-black/60 cursor-pointer shadow-sm hover:bg-white"
                        >
                            <option value="">All Years</option>
                            {years?.map((yr) => (
                                <option key={yr.reference} value={yr.reference}>{yr.code}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Button */}
                    <div className="flex justify-end lg:justify-start">
                        {(searchQuery || startDate || endDate || division || financialYear) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center justify-center h-12 w-12 border border-black/5 rounded bg-white/80 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-black/40 shadow-sm"
                                title="Clear Filters"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-black/5">
                    <div className="relative group w-full">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 h-12 bg-white/80 border border-black/5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-semibold text-[10px] uppercase tracking-widest shadow-sm"
                            title="Start Date"
                        />
                    </div>
                    <div className="relative group w-full lg:w-1/2">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 h-12 bg-white/80 border border-black/5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-semibold text-[10px] uppercase tracking-widest shadow-sm"
                            title="End Date"
                        />
                    </div>
                </div>
            </div>

            {/* List Section */}
            {isLoadingEntries ? (
                <LoadingSpinner />
            ) : entries && entries.length > 0 ? (
                <div className="bg-white/60 backdrop-blur-xl border border-black/5 overflow-hidden shadow-xl shadow-black/5">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-black/5 border-b border-black/5">
                                    <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                                        Date & Ref
                                    </th>
                                    <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                                        Journal / Division
                                    </th>
                                    <th className="text-right py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                                        Debit
                                    </th>
                                    <th className="text-right py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                                        Credit
                                    </th>
                                    <th className="text-right py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-black/60 text-center">
                                        Document
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {entries.map((entry) => (
                                    <tr
                                        key={entry.reference}
                                        className="hover:bg-white/80 transition-all cursor-pointer group"
                                        onClick={() => setSelectedEntry(entry)}
                                    >
                                        <td className="py-2 px-4 border-b border-black/5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-black">
                                                    {new Date(entry.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] font-mono text-black/40 mt-1 uppercase">
                                                    {entry.reference}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 border-b border-black/5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-black group-hover:text-emerald-600 transition-colors">
                                                    {entry.journal}
                                                </span>
                                                <span className="text-xs text-black/30 uppercase mt-1">
                                                    {entry.division}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 text-right border-b border-black/5 whitespace-nowrap">
                                            <span className="font-mono text-sm">
                                                {formatNumber(Number(entry.debit))}
                                            </span>
                                            <div className="text-[9px] text-black/40 uppercase mt-1">{entry.currency}</div>
                                        </td>
                                        <td className="py-2.5 px-4 text-right border-b border-black/5 whitespace-nowrap">
                                            <span className="font-mono text-sm">
                                                {formatNumber(Number(entry.credit))}
                                            </span>
                                            <div className="text-[9px] text-black/40 uppercase mt-1">{entry.currency}</div>
                                        </td>
                                        <td className="py-2.5 px-4 text-right border-b border-black/5 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 text-black/40 group-hover:text-black">
                                                {entry.document_number || "N/A"}
                                                <div className="w-7 h-7 rounded bg-black/5 text-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-emerald-600 hover:text-white">
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="border-t border-black/5 bg-white/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                            <span className="text-xs font-semibold text-black/50 uppercase tracking-widest">
                                Limit:
                            </span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(e.target.value);
                                    setPage(1); 
                                }}
                                className="h-8 pl-3 pr-8 rounded border border-black/10 bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none transition-all font-semibold text-xs text-black/70 shadow-sm hover:border-black/20"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="text-xs font-semibold text-black/50 uppercase tracking-widest">
                                Total: {totalCount} records
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="h-8 px-4 rounded border border-black/10 bg-white font-semibold text-xs text-black/70 hover:bg-black/5 hover:border-black/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <span className="text-xs font-semibold text-black/50 mx-2 uppercase tracking-widest">
                                Page {page} of {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page >= totalPages}
                                className="h-8 px-4 rounded border border-black/10 bg-emerald-50 font-semibold text-xs text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center bg-white/40 rounded border border-dashed border-black/10">
                    <div className="w-20 h-20 rounded bg-black/5 flex items-center justify-center text-black/10 mx-auto mb-6">
                        <Filter className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-black tracking-tight mb-2 uppercase tracking-widest italic scale-95">
                        No Entries Found
                    </h3>
                    <p className="text-black/30 font-semibold max-w-sm mx-auto text-sm">
                        Adjust your filters or query to locate matching financial records.
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
