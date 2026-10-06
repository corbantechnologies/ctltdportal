/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFetchAccountDrillDown } from "@/hooks/reports/actions";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    X,
    FileSpreadsheet,
    Printer,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    BookOpen,
    Loader2,
    Calendar,
    Layers,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { downloadCSV } from "@/tools/csvExport";
import { toast } from "react-hot-toast";

interface AccountDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookCode?: string | null;
    bookReference?: string | null;
    startDate?: string;
    endDate?: string;
    division?: string;
}

export function AccountDrillDownModal({
    isOpen,
    onClose,
    bookCode,
    bookReference,
    startDate,
    endDate,
    division,
}: AccountDrillDownModalProps) {
    const pathname = usePathname();
    const rolePrefix = pathname?.startsWith("/director")
        ? "director"
        : pathname?.startsWith("/operations")
        ? "operations"
        : "finance";

    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading, error } = useFetchAccountDrillDown({
        book_code: bookCode || undefined,
        book_reference: bookReference || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        division: division || undefined,
    });

    if (!isOpen) return null;

    const rawTransactions: any[] = (data as any)?.transactions || (data as any)?.entries || [];

    const filteredTransactions = rawTransactions.filter((tx: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (tx.journal_code && tx.journal_code.toLowerCase().includes(q)) ||
            (tx.description && tx.description.toLowerCase().includes(q)) ||
            (tx.partner && tx.partner.toLowerCase().includes(q)) ||
            (tx.date && tx.date.includes(q))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            toast.error("No transactions to export.");
            return;
        }
        const headers = ["Date", "Journal Ref", "Description", "Partner", "Debit (KES)", "Credit (KES)", "Balance (KES)"];
        const rows = filteredTransactions.map((t: any) => [
            t.date,
            t.journal_code,
            `"${(t.description || "").replace(/"/g, '""')}"`,
            `"${(t.partner || "").replace(/"/g, '""')}"`,
            t.debit,
            t.credit,
            t.balance,
        ]);
        const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\r\n");
        downloadCSV(csv, `${data?.book_code || bookCode || "ledger"}_statement.csv`);
        toast.success("Downloaded account statement CSV");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white text-slate-800 border border-slate-200 flex items-center justify-center shadow-sm">
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                    {data?.book_name || bookCode || "Account Ledger Drill-Down"}
                                </h2>
                                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {data?.book_code || bookCode}
                                </span>
                                {data?.account_type && (
                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                        {data.account_type}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>{data?.division || division || "All Divisions"}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {data?.start_date && data?.end_date
                                        ? `${data.start_date} to ${data.end_date}`
                                        : "Full Ledger Period"}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleExportCSV}
                            className="h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            title="Export CSV"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="h-8 w-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                            title="Print Ledger"
                        >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
                            <p className="text-sm">Fetching general ledger audit trail...</p>
                        </div>
                    ) : error || data?.error ? (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            {data?.error || "Failed to load audit transactions for this account."}
                        </div>
                    ) : (
                        <>
                            {/* Summary Metrics Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Opening Balance
                                    </p>
                                    <p className="text-base font-bold font-mono mt-1 text-foreground">
                                        {formatCurrency(data?.opening_balance || 0, data?.currency || "KES")}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                            Total Debits (+)
                                        </p>
                                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <p className="text-base font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(data?.total_debit || 0, data?.currency || "KES")}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                            Total Credits (-)
                                        </p>
                                        <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <p className="text-base font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
                                        {formatCurrency(data?.total_credit || 0, data?.currency || "KES")}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-corporate-primary/10 border border-corporate-primary/20">
                                    <p className="text-[11px] font-semibold text-corporate-primary uppercase tracking-wider">
                                        Closing Balance
                                    </p>
                                    <p className="text-base font-bold font-mono mt-1 text-corporate-primary">
                                        {formatCurrency(data?.closing_balance || 0, data?.currency || "KES")}
                                    </p>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Filter journal entries by note, code, partner..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Showing {filteredTransactions.length} of {data?.transactions_count || 0} transactions
                                </span>
                            </div>

                            {/* Transactions Table */}
                            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="py-2.5 px-3">Date</th>
                                            <th className="py-2.5 px-3">Journal Ref</th>
                                            <th className="py-2.5 px-3">Type</th>
                                            <th className="py-2.5 px-3">Description / Counterparty</th>
                                            <th className="py-2.5 px-3 text-right">Debit</th>
                                            <th className="py-2.5 px-3 text-right">Credit</th>
                                            <th className="py-2.5 px-3 text-right">Running Bal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    No journal entries found in this period.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((tx: any) => (
                                                <tr
                                                    key={tx.id}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-muted-foreground">
                                                        {tx.date}
                                                    </td>
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        {tx.journal_reference ? (
                                                            <Link
                                                                href={`/${rolePrefix}/fiscal-years/active/journals/${tx.journal_reference}`}
                                                                className="font-mono font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                                                                title="View Journal Batch"
                                                            >
                                                                {tx.journal_code}
                                                            </Link>
                                                        ) : (
                                                            <span className="font-mono font-semibold text-slate-800">
                                                                {tx.journal_code}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-secondary text-secondary-foreground uppercase">
                                                            {tx.entry_type || (tx.debit > 0 ? "DEBIT" : "CREDIT")}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 max-w-sm">
                                                        <p className="truncate text-foreground font-medium">{tx.description}</p>
                                                        {tx.notes && (
                                                            <p className="text-[10px] text-muted-foreground truncate italic">{tx.notes}</p>
                                                        )}
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                                                            {tx.partner && <span>Partner: {tx.partner}</span>}
                                                            {tx.division && <span>• Div: {tx.division}</span>}
                                                            {tx.payment_method && <span>• {tx.payment_method}</span>}
                                                            {tx.document_number && <span>• Doc: {tx.document_number}</span>}
                                                            {tx.document_url && (
                                                                <a
                                                                    href={tx.document_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-corporate-primary hover:underline font-semibold flex items-center gap-0.5 ml-1"
                                                                >
                                                                    <span>Receipt</span>
                                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                        {tx.debit > 0 ? formatNumber(tx.debit) : "-"}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                                        {tx.credit > 0 ? formatNumber(tx.credit) : "-"}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                                                        {formatNumber(tx.balance ?? tx.running_balance ?? 0)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-white text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Corban Technologies Double-Entry GL Ledger
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
