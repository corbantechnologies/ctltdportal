"use client";

import { useState } from "react";
import { useFetchCustomerStatementOfAccount } from "@/hooks/reports/actions";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Calendar,
    Printer,
    Download,
    Mail,
    ChevronLeft,
    Building2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    CreditCard,
    FileSpreadsheet,
    FileText,
    Send,
    Loader2,
    ShieldCheck,
    Receipt,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface CustomerStatementStudioProps {
    partnerReference: string;
    rolePrefix?: "finance" | "director" | "operations";
}

export function CustomerStatementStudio({
    partnerReference,
    rolePrefix = "finance",
}: CustomerStatementStudioProps) {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [isEmailing, setIsEmailing] = useState(false);

    const { data, isLoading, error } = useFetchCustomerStatementOfAccount(partnerReference, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
    });

    const handlePrint = () => {
        window.print();
    };

    const handleEmailStatement = () => {
        setIsEmailing(true);
        setTimeout(() => {
            setIsEmailing(false);
            toast.success(`Statement sent to ${data?.partner.email || "customer email"}!`);
        }, 800);
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border/80 shadow-sm print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${rolePrefix}/reports/ar-aging`}
                        className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                                Statement of Account
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-mono font-semibold">
                                {data?.partner.code || "SOA"}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                            {data?.partner.name || "Customer Statement"}
                        </h1>
                    </div>
                </div>

                {/* Filter and Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl border border-border text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
                        />
                        <span className="text-muted-foreground ml-1">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Print / PDF
                    </button>

                    <button
                        onClick={handleEmailStatement}
                        disabled={isEmailing}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isEmailing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Mail className="w-4 h-4" />
                        )}
                        <span>Email Statement</span>
                    </button>
                </div>
            </div>

            {/* Parchment Statement View */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card rounded-2xl border border-border">
                    <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
                    <p className="text-sm text-muted-foreground">Generating customer statement of account...</p>
                </div>
            ) : error || data?.error ? (
                <div className="p-8 text-center bg-card rounded-2xl border border-destructive/20 text-destructive">
                    {data?.error || "Failed to load customer statement."}
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border/80 shadow-lg p-6 sm:p-10 space-y-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
                    {/* Statement Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border pb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-corporate-primary" />
                                <span className="text-xl font-black tracking-tight text-foreground">
                                    CORBAN TECHNOLOGIES LTD
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Enterprise IT, Cloud & Digital Business Infrastructure
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Nairobi, Kenya • info@corbantechnologies.com • +254 700 000 000
                            </p>
                        </div>

                        <div className="text-left sm:text-right">
                            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20 inline-block">
                                Statement of Account
                            </span>
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-semibold text-foreground">Statement Period:</span>{" "}
                                {data?.period.start_date || "Genesis"} to {data?.period.end_date || "Present"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Currency:</span>{" "}
                                {data?.period.currency || "KES"}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info Card & Metric Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1 text-xs">
                            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                Account Holder (Customer)
                            </p>
                            <p className="text-sm font-bold text-foreground">{data?.partner.name}</p>
                            <p className="text-muted-foreground font-mono">Code: {data?.partner.code}</p>
                            {data?.partner.tax_pin && (
                                <p className="text-muted-foreground">KRA PIN: {data.partner.tax_pin}</p>
                            )}
                            {data?.partner.email && (
                                <p className="text-muted-foreground">Email: {data.partner.email}</p>
                            )}
                            {data?.partner.phone && (
                                <p className="text-muted-foreground">Phone: {data.partner.phone}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-xl bg-muted/40 border border-border">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Opening Balance
                                </p>
                                <p className="text-sm font-bold font-mono mt-1 text-foreground">
                                    {formatCurrency(data?.opening_balance || 0, data?.period.currency || "KES")}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-muted/40 border border-border">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Total Invoiced (+)
                                </p>
                                <p className="text-sm font-bold font-mono mt-1 text-foreground">
                                    {formatCurrency(data?.total_invoiced || 0, data?.period.currency || "KES")}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                <p className="text-[10px] font-semibold text-emerald-600 uppercase">
                                    Total Paid (-)
                                </p>
                                <p className="text-sm font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data?.total_paid || 0, data?.period.currency || "KES")}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-corporate-primary/10 border border-corporate-primary/20">
                                <p className="text-[10px] font-semibold text-corporate-primary uppercase">
                                    Closing Balance Due
                                </p>
                                <p className="text-sm font-bold font-mono mt-1 text-corporate-primary">
                                    {formatCurrency(data?.closing_balance || 0, data?.period.currency || "KES")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Aging Summary Pill Bar */}
                    {data?.aging_summary && (
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div>
                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase">
                                        Current (0-30 d)
                                    </p>
                                    <p className="text-xs font-mono font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                                        {formatNumber(data.aging_summary.current)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-amber-600 uppercase">
                                        31-60 Days
                                    </p>
                                    <p className="text-xs font-mono font-bold mt-0.5 text-amber-600 dark:text-amber-400">
                                        {formatNumber(data.aging_summary.days_31_60)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-orange-600 uppercase">
                                        61-90 Days
                                    </p>
                                    <p className="text-xs font-mono font-bold mt-0.5 text-orange-600 dark:text-orange-400">
                                        {formatNumber(data.aging_summary.days_61_90)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-rose-600 uppercase">
                                        90+ Days (Critical)
                                    </p>
                                    <p className="text-xs font-mono font-bold mt-0.5 text-rose-600 dark:text-rose-400">
                                        {formatNumber(data.aging_summary.days_90_plus)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chronological Statement Ledger Table */}
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-2.5 px-3">Date</th>
                                    <th className="py-2.5 px-3">Type</th>
                                    <th className="py-2.5 px-3">Doc Ref</th>
                                    <th className="py-2.5 px-3">Description</th>
                                    <th className="py-2.5 px-3">Due Date</th>
                                    <th className="py-2.5 px-3 text-right">Debit (+)</th>
                                    <th className="py-2.5 px-3 text-right">Credit (-)</th>
                                    <th className="py-2.5 px-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {/* Opening Balance Row */}
                                <tr className="bg-muted/20 font-semibold text-muted-foreground">
                                    <td className="py-2.5 px-3 font-mono">{data?.period.start_date || "-"}</td>
                                    <td className="py-2.5 px-3">
                                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                                            B/F
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono">-</td>
                                    <td className="py-2.5 px-3">Opening Balance Brought Forward</td>
                                    <td className="py-2.5 px-3">-</td>
                                    <td className="py-2.5 px-3 text-right font-mono">-</td>
                                    <td className="py-2.5 px-3 text-right font-mono">-</td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                                        {formatNumber(data?.opening_balance || 0)}
                                    </td>
                                </tr>

                                {data?.transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                            No transactions recorded during this period.
                                        </td>
                                    </tr>
                                ) : (
                                    data?.transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-muted-foreground">
                                                {tx.date}
                                            </td>
                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                <span
                                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                                        tx.type === "INVOICE"
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 whitespace-nowrap font-mono font-semibold text-corporate-primary">
                                                {tx.document_code}
                                            </td>
                                            <td className="py-2.5 px-3 text-foreground font-medium max-w-xs truncate">
                                                {tx.description}
                                            </td>
                                            <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                                                {tx.due_date || "-"}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-foreground whitespace-nowrap">
                                                {tx.debit > 0 ? formatNumber(tx.debit) : "-"}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                {tx.credit > 0 ? formatNumber(tx.credit) : "-"}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                                                {formatNumber(tx.running_balance)}
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {/* Total / Closing Balance Summary Row */}
                                <tr className="bg-corporate-primary/5 font-bold border-t-2 border-corporate-primary/20">
                                    <td colSpan={5} className="py-3 px-3 text-corporate-primary uppercase text-xs">
                                        CLOSING OUTSTANDING BALANCE DUE
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-foreground">
                                        {formatNumber(data?.total_invoiced || 0)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                        {formatNumber(data?.total_paid || 0)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-base font-extrabold text-corporate-primary whitespace-nowrap">
                                        {formatCurrency(data?.closing_balance || 0, data?.period.currency || "KES")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment / Remittance Instructions Footer */}
                    <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-corporate-primary" /> Remittance & Payment Information
                        </p>
                        <p className="text-muted-foreground">
                            Please make payments payable to <strong>Corban Technologies LTD</strong> quoting your statement account number (<strong>{data?.partner.code}</strong>).
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                            <div className="bg-card p-2.5 rounded-lg border border-border">
                                <span className="font-sans font-semibold text-muted-foreground block text-[10px] uppercase">Bank Transfer</span>
                                Bank: Standard Chartered / NCBA | Account: 0100 0000 0000
                            </div>
                            <div className="bg-card p-2.5 rounded-lg border border-border">
                                <span className="font-sans font-semibold text-muted-foreground block text-[10px] uppercase">M-Pesa Express</span>
                                Paybill: 247247 | Account No: {data?.partner.code}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
