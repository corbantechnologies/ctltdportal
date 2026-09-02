"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useFetchGLStatement } from "@/hooks/reports/actions";
import { useFetchBook } from "@/hooks/books/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { formatNumber } from "@/tools/format";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function BookLedgerStatementPage() {
    const params = useParams();
    const reference = params.reference as string;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const activeParams: any = {};
    if (startDate) activeParams.start_date = startDate;
    if (endDate) activeParams.end_date = endDate;

    const { data: book, isLoading: isLoadingBook } = useFetchBook(reference);
    const { data: statement, isLoading: isLoadingStatement } = useFetchGLStatement(reference, activeParams);

    const isLoading = isLoadingBook || isLoadingStatement;

    if (isLoading) return <LoadingSpinner />;
    if (!book) return <div className="p-10 text-center font-semibold text-black/40 uppercase tracking-widest text-sm">Ledger Not Found</div>;

    const entries = statement?.entries || [];

    return (
        <div className="space-y-6 pb-20">
            {/* Breadcrumbs & Header */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">
                <Link href="/finance/books" className="hover:text-emerald-500 transition-colors">Books</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black/80">{book.name}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded border border-black/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded bg-emerald-50 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {book.name} <span className="text-black/30 font-medium text-lg ml-2">#{book.code}</span>
                        </h1>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">
                        Live Balance
                    </p>
                    <div className="font-mono text-3xl font-bold text-emerald-600 tracking-tighter">
                        <span className="text-sm font-semibold tracking-normal text-black/30 mr-2">KES</span>
                        {formatNumber(Number(book.balance || 0))}
                    </div>
                </div>
            </div>

            {/* Statement Filter */}
            <div className="bg-white/40 p-4 sm:p-6 rounded border border-white/60 backdrop-blur-md shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <div className="relative group w-full">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-11 h-12 bg-white/80 border border-black/5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-semibold text-[10px] uppercase tracking-widest shadow-sm"
                            title="Start Date"
                        />
                    </div>
                    <div className="relative group w-full">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-11 h-12 bg-white/80 border border-black/5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-semibold text-[10px] uppercase tracking-widest shadow-sm"
                            title="End Date"
                        />
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white border border-black/5 overflow-hidden shadow-xl shadow-black/5 relative flex flex-col pt-0 rounded">
                {/* Header Banner */}
                <div className="bg-emerald-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-100/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">General Ledger Statement</span>
                    <span className="text-sm font-semibold text-emerald-600 font-mono mt-2 md:mt-0">Opening Balance: KES {formatNumber(Number(statement?.opening_balance || 0))}</span>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-black/10">
                                <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Date</th>
                                <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Journal Ref</th>
                                <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Description & Partner</th>
                                <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Debit</th>
                                <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Credit</th>
                                <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">Running Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-semibold text-black/80">{entry.date}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-xs font-mono text-black/50">{entry.journal_code}</td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm font-medium text-black/80">{entry.description}</div>
                                        {entry.partner && <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest mt-1">{entry.partner}</div>}
                                    </td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono text-sm">{entry.debit > 0 ? formatNumber(Number(entry.debit)) : "-"}</td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono text-sm">{entry.credit > 0 ? formatNumber(Number(entry.credit)) : "-"}</td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono text-sm font-bold text-slate-800 bg-slate-50">{formatNumber(Number(entry.balance))}</td>
                                </tr>
                            ))}
                            {(!entries || entries.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-sm font-semibold text-black/30 bg-black/5">No transaction records found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                        {/* Footer Banner */}
                        {statement?.closing_balance !== undefined && entries.length > 0 && (
                            <tfoot className="border-t-[3px] border-black">
                                <tr className="bg-slate-50">
                                    <td colSpan={5} className="py-4 px-6 text-right text-[10px] font-bold uppercase tracking-widest text-black/60">Calculated Closing Balance</td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono text-lg font-bold text-emerald-700 bg-emerald-50">
                                        KES {formatNumber(Number(statement.closing_balance))}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
