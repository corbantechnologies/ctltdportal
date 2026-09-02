"use client";

import { useState, useMemo } from "react";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchGLStatement } from "@/hooks/reports/actions";
import {
    BookOpen,
    Search,
    ChevronLeft,
    ChevronRight,
    Download,
    SlidersHorizontal,
    X,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/tools/format";

const ITEMS_PER_PAGE = 30;

export default function GLStatementPage() {
    const { data: books, isLoading: isLoadingBooks } = useFetchBooks();
    const { data: divisions } = useFetchDivisions();

    const [selectedBook, setSelectedBook] = useState("");
    const [division, setDivision] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Only fire query when a book is selected
    const { data: glData, isLoading: isLoadingGL, isFetching } = useFetchGLStatement(
        selectedBook,
        { start_date: startDate || undefined, end_date: endDate || undefined, division: division !== "ALL" ? division : undefined }
    );

    const filtered = useMemo(() => {
        if (!glData?.entries) return [];
        if (!searchQuery) return glData.entries;
        const q = searchQuery.toLowerCase();
        return glData.entries.filter(
            (e) =>
                e.description?.toLowerCase().includes(q) ||
                e.journal_code?.toLowerCase().includes(q) ||
                e.partner?.toLowerCase().includes(q)
        );
    }, [glData, searchQuery]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setDivision("ALL");
        setSearchQuery("");
        setCurrentPage(1);
    };

    const hasActiveFilters = startDate || endDate || division !== "ALL" || searchQuery;

    // CSV export
    const handleExportCSV = () => {
        if (!glData?.entries?.length) return;
        const rows = [
            ["Date", "Journal Code", "Description", "Partner", "Debit", "Credit", "Running Balance"],
            ...glData.entries.map((e) => [
                e.date,
                e.journal_code,
                `"${e.description}"`,
                e.partner || "",
                e.debit,
                e.credit,
                e.balance,
            ]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gl_${glData.book_code}_${startDate || "all"}_${endDate || "date"}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Breadcrumbs */}
            <nav>
                <ol className="flex items-center gap-2 text-sm text-black/60">
                    <li><a href="/finance/dashboard" className="hover:text-black hover:underline">Dashboard</a></li>
                    <li><span className="text-black/30">/</span></li>
                    <li><a href="/finance/reports" className="hover:text-black hover:underline">Reports</a></li>
                    <li><span className="text-black/30">/</span></li>
                    <li><span className="font-semibold text-black">General Ledger Statement</span></li>
                </ol>
            </nav>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/finance/reports"
                        className="flex items-center justify-center w-9 h-9 rounded border border-black/5 bg-white hover:bg-black/5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-black tracking-tighter">
                            General Ledger Statement
                        </h1>
                        <p className="text-black/50 font-medium text-sm mt-0.5">
                            Account-level transaction history with running balance
                        </p>
                    </div>
                </div>
                {glData && (
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 h-10 px-4 bg-[#045138] hover:bg-black text-white rounded font-semibold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-3">
                <div className="flex flex-wrap gap-3">
                    {/* Book Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">
                            Account Book <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select
                                value={selectedBook}
                                onChange={(e) => { setSelectedBook(e.target.value); setCurrentPage(1); }}
                                className="w-full h-10 pl-9 pr-3 rounded border border-gray-200 bg-white text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138] transition-all appearance-none"
                            >
                                <option value="">— Select a Book —</option>
                                {isLoadingBooks ? (
                                    <option disabled>Loading...</option>
                                ) : (
                                    books?.map((book) => (
                                        <option key={book.reference} value={book.reference}>
                                            {book.code} — {book.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Division */}
                    <div className="w-40">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">Division</label>
                        <select
                            value={division}
                            onChange={(e) => { setDivision(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 rounded border border-gray-200 bg-white text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138] transition-all appearance-none"
                        >
                            <option value="ALL">All Divisions</option>
                            {divisions?.map((d) => (
                                <option key={d.reference} value={d.code ?? d.reference}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-end gap-2">
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                                className="h-10 px-3 rounded border border-gray-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                                className="h-10 px-3 rounded border border-gray-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138]"
                            />
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                title="Clear Filters"
                                className="flex items-center justify-center h-10 w-10 rounded border border-gray-200 bg-white hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                {glData && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search description, journal code, partner..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full h-9 pl-9 pr-3 rounded border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:ring-1 focus:bg-white transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Empty / Prompt State */}
            {!selectedBook && (
                <div className="py-20 text-center bg-white rounded border border-dashed border-gray-200">
                    <div className="w-14 h-14 rounded bg-gray-50 flex items-center justify-center text-gray-200 mx-auto mb-4">
                        <SlidersHorizontal className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-black/40 uppercase tracking-widest">Select an account book to load the GL Statement</p>
                </div>
            )}

            {/* Loading */}
            {selectedBook && (isLoadingGL || isFetching) && !glData && (
                <div className="py-20 text-center bg-white rounded border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/4 mx-auto mb-2" />
                    <div className="h-3 bg-gray-50 rounded w-1/3 mx-auto" />
                </div>
            )}

            {/* GL Statement */}
            {glData && (
                <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
                    {/* Summary Header */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Book", value: `${glData.book_code} — ${glData.book_name}` },
                            { label: "Opening Balance", value: formatNumber(glData.opening_balance), mono: true },
                            { label: "Closing Balance", value: formatNumber(glData.closing_balance), mono: true, highlight: glData.closing_balance < 0 },
                            { label: "Period", value: glData.start_date ? `${glData.start_date} → ${glData.end_date}` : "Full Year" },
                        ].map(({ label, value, mono, highlight }) => (
                            <div key={label} className="bg-white border border-gray-100 rounded p-4 shadow-sm">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">{label}</p>
                                <p className={`font-semibold text-sm ${mono ? "font-mono" : ""} ${highlight ? "text-red-600" : "text-black"}`}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-y border-gray-200">
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-28">Date</th>
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-32">Journal</th>
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Description</th>
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-36">Partner</th>
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right w-32">Debit</th>
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right w-32">Credit</th>
                                        <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right w-36">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginated.map((entry, idx) => (
                                        <tr key={`${entry.journal_code}-${idx}`} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3 px-4 text-xs font-mono text-gray-600 whitespace-nowrap">
                                                {entry.date}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-[10px] font-mono font-semibold text-[#045138] bg-[#045138]/5 px-2 py-0.5 rounded">
                                                    {entry.journal_code}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate">
                                                {entry.description}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">
                                                {entry.partner || <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-sm">
                                                {entry.debit > 0 ? (
                                                    <span className="text-emerald-600 font-semibold">{formatNumber(entry.debit)}</span>
                                                ) : (
                                                    <span className="text-gray-200">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-sm">
                                                {entry.credit > 0 ? (
                                                    <span className="text-indigo-600 font-semibold">{formatNumber(entry.credit)}</span>
                                                ) : (
                                                    <span className="text-gray-200">—</span>
                                                )}
                                            </td>
                                            <td className={`py-3 px-4 text-right font-mono text-sm font-bold ${entry.balance < 0 ? "text-red-600" : "text-black"}`}>
                                                {formatNumber(entry.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-gray-300 font-semibold text-xs uppercase tracking-widest">
                                                No transactions found for the selected criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded border border-gray-100 shadow-sm gap-4">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Showing{" "}
                                <span className="text-black">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                                {" "}–{" "}
                                <span className="text-black">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span>
                                {" "}of{" "}
                                <span className="text-black">{filtered.length}</span> entries
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center h-8 px-3 rounded border border-gray-200 bg-white text-gray-500 text-[10px] font-semibold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                                </button>
                                <span className="text-xs font-mono text-gray-500 px-2">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center h-8 px-3 rounded border border-gray-200 bg-white text-gray-500 text-[10px] font-semibold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
