"use client";

import { useState } from "react";
import { useFetchARAgingSchedule } from "@/hooks/reports/actions";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Calendar,
    Search,
    ChevronDown,
    ChevronRight,
    FileText,
    Download,
    Printer,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Users,
    DollarSign,
    Filter,
    ArrowUpRight,
    TrendingUp,
    ExternalLink,
    Mail,
    Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ARAgingMatrixProps {
    rolePrefix?: "finance" | "director" | "operations";
}

type AgingBucketFilter = "ALL" | "CURRENT" | "31_60" | "61_90" | "90_PLUS";

export function ARAgingMatrix({ rolePrefix = "finance" }: ARAgingMatrixProps) {
    const router = useRouter();
    const [asOfDate, setAsOfDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
    const [selectedBucket, setSelectedBucket] = useState<AgingBucketFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [expandedPartners, setExpandedPartners] = useState<Record<string, boolean>>({});

    const { data, isLoading, error, refetch } = useFetchARAgingSchedule({
        as_of_date: asOfDate,
        division: selectedDivision !== "ALL" ? selectedDivision : undefined,
    });

    const toggleExpand = (code: string) => {
        setExpandedPartners((prev) => ({
            ...prev,
            [code]: !prev[code],
        }));
    };

    const expandAll = () => {
        if (!data?.partners) return;
        const all: Record<string, boolean> = {};
        data.partners.forEach((p) => {
            all[p.partner_code] = true;
        });
        setExpandedPartners(all);
    };

    const collapseAll = () => {
        setExpandedPartners({});
    };

    const filteredPartners = (data?.partners || []).filter((partner) => {
        // Bucket filter
        if (selectedBucket === "CURRENT" && partner.current <= 0) return false;
        if (selectedBucket === "31_60" && partner.days_31_60 <= 0) return false;
        if (selectedBucket === "61_90" && partner.days_61_90 <= 0) return false;
        if (selectedBucket === "90_PLUS" && partner.days_90_plus <= 0) return false;

        // Search query filter
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            partner.partner_name.toLowerCase().includes(q) ||
            partner.partner_code.toLowerCase().includes(q) ||
            (partner.partner_email && partner.partner_email.toLowerCase().includes(q)) ||
            (partner.partner_phone && partner.partner_phone.includes(q))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-xl border border-border/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                            Accounts Receivable
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">Aging Matrix &amp; DSO</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                        AR Aging Schedule
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Track outstanding customer receivables, overdue aging brackets, and liquidity velocity.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg border border-border text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <label className="text-xs font-medium text-muted-foreground">As of:</label>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print Matrix
                    </button>
                </div>
            </div>

            {/* Executive Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Total AR */}
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Receivables
                    </p>
                    <p className="text-base sm:text-lg font-bold font-mono text-foreground mt-1.5 tabular-nums">
                        {formatCurrency(data?.total_ar || 0, data?.currency || "KES")}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                        <Users className="w-3 h-3" />
                        <span>{data?.partners_count || 0} debtors</span>
                    </div>
                </div>

                {/* Current 0-30 */}
                <div
                    onClick={() => setSelectedBucket("CURRENT")}
                    className={cn(
                        "p-3.5 rounded-xl border shadow-sm cursor-pointer transition-all flex flex-col justify-between",
                        selectedBucket === "CURRENT"
                            ? "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20"
                            : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            0-30 Days (Current)
                        </p>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1.5 tabular-nums">
                        {formatCurrency(data?.total_current || 0, data?.currency || "KES")}
                    </p>
                    <span className="text-[10px] text-emerald-600/80 font-medium">On Schedule</span>
                </div>

                {/* 31-60 Days */}
                <div
                    onClick={() => setSelectedBucket("31_60")}
                    className={cn(
                        "p-3.5 rounded-xl border shadow-sm cursor-pointer transition-all flex flex-col justify-between",
                        selectedBucket === "31_60"
                            ? "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20"
                            : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            31-60 Days
                        </p>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className="text-base sm:text-lg font-bold font-mono text-amber-700 dark:text-amber-400 mt-1.5 tabular-nums">
                        {formatCurrency(data?.total_31_60 || 0, data?.currency || "KES")}
                    </p>
                    <span className="text-[10px] text-amber-600/80 font-medium">Early Follow-Up</span>
                </div>

                {/* 61-90 Days */}
                <div
                    onClick={() => setSelectedBucket("61_90")}
                    className={cn(
                        "p-3.5 rounded-xl border shadow-sm cursor-pointer transition-all flex flex-col justify-between",
                        selectedBucket === "61_90"
                            ? "bg-orange-500/10 border-orange-500/50 ring-2 ring-orange-500/20"
                            : "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                            61-90 Days
                        </p>
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <p className="text-base sm:text-lg font-bold font-mono text-orange-700 dark:text-orange-400 mt-1.5 tabular-nums">
                        {formatCurrency(data?.total_61_90 || 0, data?.currency || "KES")}
                    </p>
                    <span className="text-[10px] text-orange-600/80 font-medium">Action Required</span>
                </div>

                {/* 90+ Days */}
                <div
                    onClick={() => setSelectedBucket("90_PLUS")}
                    className={cn(
                        "p-3.5 rounded-xl border shadow-sm cursor-pointer transition-all flex flex-col justify-between",
                        selectedBucket === "90_PLUS"
                            ? "bg-rose-500/10 border-rose-500/50 ring-2 ring-rose-500/20"
                            : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                            90+ Days (Critical)
                        </p>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <p className="text-base sm:text-lg font-bold font-mono text-rose-700 dark:text-rose-400 mt-1.5 tabular-nums">
                        {formatCurrency(data?.total_90_plus || 0, data?.currency || "KES")}
                    </p>
                    <span className="text-[10px] text-rose-600/80 font-medium">Critical Overdue</span>
                </div>

                {/* Days Sales Outstanding (DSO) */}
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Days Sales Outstanding
                    </p>
                    <p className="text-base sm:text-lg font-bold font-mono text-corporate-primary mt-1.5 tabular-nums">
                        {data?.dso_days || 0} Days
                    </p>
                    <span className="text-[10px] text-muted-foreground">Cash Collection Velocity</span>
                </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-xl border border-border/80 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                    {(
                        [
                            { key: "ALL", label: "All Receivables" },
                            { key: "CURRENT", label: "0-30 Days" },
                            { key: "31_60", label: "31-60 Days" },
                            { key: "61_90", label: "61-90 Days" },
                            { key: "90_PLUS", label: "90+ Days" },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedBucket(tab.key)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all shadow-none",
                                selectedBucket === tab.key
                                    ? "bg-corporate-primary text-white shadow-sm"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="relative flex-1 sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search client name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-corporate-primary"
                        />
                    </div>

                    <button
                        onClick={expandAll}
                        className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted rounded-lg border border-border transition-colors whitespace-nowrap"
                        title="Expand all customer invoice tables"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={collapseAll}
                        className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted rounded-lg border border-border transition-colors whitespace-nowrap"
                        title="Collapse all"
                    >
                        Collapse
                    </button>
                </div>
            </div>

            {/* Customers Receivables Matrix Ledger */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full border-2 border-corporate-primary border-t-transparent animate-spin" />
                    <p className="text-sm">Calculating portfolio aging schedule...</p>
                </div>
            ) : filteredPartners.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
                    <h3 className="text-base font-semibold text-foreground">No Outstanding Receivables Found</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        All customer accounts matching the selected criteria are fully settled.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPartners.map((partner) => {
                        const isExpanded = !!expandedPartners[partner.partner_code];

                        return (
                            <div
                                key={partner.partner_code}
                                className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden transition-all hover:border-corporate-primary/40"
                            >
                                {/* Partner Card Header Row */}
                                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start sm:items-center gap-3">
                                        <button
                                            onClick={() => toggleExpand(partner.partner_code)}
                                            className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mt-0.5 sm:mt-0"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-bold text-foreground">
                                                    {partner.partner_name}
                                                </h3>
                                                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-muted text-muted-foreground">
                                                    {partner.partner_code}
                                                </span>
                                                {partner.max_days_past > 90 ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                        {partner.max_days_past} Days Past Due
                                                    </span>
                                                ) : partner.max_days_past > 30 ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        {partner.max_days_past} Days Past Due
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                                {partner.partner_email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {partner.partner_email}
                                                    </span>
                                                )}
                                                {partner.partner_phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {partner.partner_phone}
                                                    </span>
                                                )}
                                                <span>• {partner.invoices_count} pending invoice(s)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Aging Buckets Breakdown for Partner */}
                                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/50">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                                0-30 Days
                                            </p>
                                            <p className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                                {partner.current > 0 ? formatNumber(partner.current) : "-"}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                                31-60 Days
                                            </p>
                                            <p className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
                                                {partner.days_31_60 > 0 ? formatNumber(partner.days_31_60) : "-"}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                                61-90 Days
                                            </p>
                                            <p className="text-xs font-mono font-medium text-orange-600 dark:text-orange-400">
                                                {partner.days_61_90 > 0 ? formatNumber(partner.days_61_90) : "-"}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                                90+ Days
                                            </p>
                                            <p className="text-xs font-mono font-medium text-rose-600 dark:text-rose-400">
                                                {partner.days_90_plus > 0 ? formatNumber(partner.days_90_plus) : "-"}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right pl-2 sm:pl-4 border-l border-border">
                                            <p className="text-[10px] font-semibold text-corporate-primary uppercase">
                                                Total Due
                                            </p>
                                            <p className="text-sm font-bold font-mono text-corporate-primary">
                                                {formatCurrency(partner.total_balance, data?.currency || "KES")}
                                            </p>
                                        </div>

                                        {/* 1-Click Statement of Account Button */}
                                        {partner.partner_reference && (
                                            <Link
                                                href={`/${rolePrefix}/partners/${partner.partner_reference}/statement`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20 hover:bg-corporate-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>Statement</span>
                                                <ExternalLink className="w-3 h-3 opacity-60" />
                                            </Link>
                                        )}

                                    </div>
                                </div>

                                {/* Collapsible Invoices Subtable */}
                                {isExpanded && (
                                    <div className="border-t border-border/80 bg-muted/20 p-4 sm:p-5">
                                        <div className="border border-border/70 rounded-xl overflow-hidden shadow-inner bg-card">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                                                    <tr>
                                                        <th className="py-2.5 px-3">Invoice No.</th>
                                                        <th className="py-2.5 px-3">Invoice Date</th>
                                                        <th className="py-2.5 px-3">Due Date</th>
                                                        <th className="py-2.5 px-3">Days Past</th>
                                                        <th className="py-2.5 px-3">Aging Bracket</th>
                                                        <th className="py-2.5 px-3 text-right">Invoice Total</th>
                                                        <th className="py-2.5 px-3 text-right">Amount Paid</th>
                                                        <th className="py-2.5 px-3 text-right">Balance Due</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {partner.invoices.map((inv) => (
                                                        <tr
                                                            key={inv.reference || inv.code}
                                                            className="hover:bg-muted/30 transition-colors"
                                                        >
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                <Link
                                                                    href={`/${rolePrefix}/invoices/${inv.reference}`}
                                                                    className="font-mono font-semibold text-corporate-primary hover:underline"
                                                                >
                                                                    {inv.code}
                                                                </Link>
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                                                                {inv.date}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                                                                {inv.due_date || "-"}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                {inv.days_past > 0 ? (
                                                                    <span className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                                                                        +{inv.days_past} d
                                                                    </span>
                                                                ) : (
                                                                    <span className="font-mono text-xs text-emerald-600">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                <span
                                                                    className={cn(
                                                                        "px-2 py-0.5 text-[10px] font-semibold rounded-full",
                                                                        inv.bucket === "CURRENT" &&
                                                                            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                                                                        inv.bucket === "31-60" &&
                                                                            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                                                                        inv.bucket === "61-90" &&
                                                                            "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
                                                                        inv.bucket === "90+" &&
                                                                            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                                                    )}
                                                                >
                                                                    {inv.bucket}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-muted-foreground">
                                                                {formatNumber(inv.total_amount)}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                                                                {inv.amount_paid > 0 ? formatNumber(inv.amount_paid) : "-"}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap text-corporate-primary">
                                                                {formatCurrency(inv.balance_due, data?.currency || "KES")}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
