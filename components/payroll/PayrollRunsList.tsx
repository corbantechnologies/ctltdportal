"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchPayrollRuns } from "@/hooks/payrollruns/actions";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Users,
    Plus,
    Search,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ShieldCheck,
    Layers,
    ChevronRight,
    Loader2,
    FileSpreadsheet,
    Printer,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PayrollRunsListProps {
    rolePrefix: "finance" | "director" | "operations";
}

type PayrollStatusFilter = "ALL" | "DRAFT" | "APPROVED" | "POSTED" | "PAID" | "CANCELLED";

export default function PayrollRunsList({ rolePrefix }: PayrollRunsListProps) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<PayrollStatusFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: response, isLoading } = useFetchPayrollRuns({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
    });

    const payrollRuns = useMemo(() => response?.results || [], [response]);

    // KPI stats
    const totalGrossPaid = useMemo(() => {
        return payrollRuns
            .filter((p) => p.status !== "CANCELLED")
            .reduce((sum, p) => sum + (Number(p.total_gross) || 0), 0);
    }, [payrollRuns]);

    const totalPAYERemitted = useMemo(() => {
        return payrollRuns
            .filter((p) => p.status !== "CANCELLED")
            .reduce((sum, p) => sum + (Number(p.total_paye) || 0), 0);
    }, [payrollRuns]);

    const totalStatutory = useMemo(() => {
        return payrollRuns
            .filter((p) => p.status !== "CANCELLED")
            .reduce(
                (sum, p) =>
                    sum +
                    (Number(p.total_nssf) || 0) +
                    (Number(p.total_shif) || 0) +
                    (Number(p.total_housing_levy) || 0),
                0
            );
    }, [payrollRuns]);

    const totalNetDisbursed = useMemo(() => {
        return payrollRuns
            .filter((p) => p.status !== "CANCELLED")
            .reduce((sum, p) => sum + (Number(p.total_net_pay) || 0), 0);
    }, [payrollRuns]);

    const filteredRuns = useMemo(() => {
        if (!searchQuery) return payrollRuns;
        const q = searchQuery.toLowerCase();
        return payrollRuns.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                (p.financial_month_details?.name && p.financial_month_details.name.toLowerCase().includes(q))
        );
    }, [payrollRuns, searchQuery]);


    return (
        <div className="space-y-6">
            {/* Header & New Run Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                            Payroll & Remuneration
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">Kenyan Statutory Auto-Calculations</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                        Payroll Runs Ledger
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage monthly salary computations, PAYE, NSSF, SHIF, and automated GL journal posting.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/${rolePrefix}/staff-claims`}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
                    >
                        <Users className="w-4 h-4" /> Staff Reimbursements
                    </Link>

                    <Link
                        href={`/${rolePrefix}/payroll/new`}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Run New Payroll</span>
                    </Link>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Net Salaries
                    </p>
                    <p className="text-xl font-bold font-mono text-corporate-primary mt-2">
                        {formatCurrency(totalNetDisbursed, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Disbursed to Employees</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        PAYE Tax Liability
                    </p>
                    <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-2">
                        {formatCurrency(totalPAYERemitted, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">KRA Domestic Tax Due</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Statutory Deductions
                    </p>
                    <p className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-2">
                        {formatCurrency(totalStatutory, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">NSSF + SHIF + Housing Levy</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Gross Remuneration
                    </p>
                    <p className="text-xl font-bold font-mono text-foreground mt-2">
                        {formatCurrency(totalGrossPaid, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Payroll Runs Count: {payrollRuns.length}</span>
                </div>
            </div>

            {/* Filter Tabs and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {(
                        [
                            { key: "ALL", label: "All Runs" },
                            { key: "DRAFT", label: "Draft" },
                            { key: "APPROVED", label: "Approved" },
                            { key: "POSTED", label: "Posted to GL" },
                            { key: "PAID", label: "Disbursed / Paid" },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all",
                                statusFilter === tab.key
                                    ? "bg-corporate-primary text-white shadow-sm"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search payroll run title or month..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-corporate-primary"
                    />
                </div>
            </div>

            {/* Payroll Runs Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
                    <p className="text-sm">Loading payroll runs...</p>
                </div>
            ) : filteredRuns.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-semibold text-foreground">No Payroll Runs Found</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Generate monthly payroll items with automated Kenyan statutory calculations.
                    </p>
                    <Link
                        href={`/${rolePrefix}/payroll/new`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Run First Payroll
                    </Link>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="py-3 px-4">Run Code</th>
                                <th className="py-3 px-4">Payroll Title / Month</th>
                                <th className="py-3 px-4">Payroll Date</th>
                                <th className="py-3 px-4 text-right">Gross Pay</th>
                                <th className="py-3 px-4 text-right">PAYE</th>
                                <th className="py-3 px-4 text-right">NSSF</th>
                                <th className="py-3 px-4 text-right">SHIF</th>
                                <th className="py-3 px-4 text-right">Housing</th>
                                <th className="py-3 px-4 text-right">Net Pay</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredRuns.map((run) => (
                                <tr
                                    key={run.reference || run.code}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <Link
                                            href={`/${rolePrefix}/payroll/${run.reference}`}
                                            className="font-mono font-bold text-corporate-primary hover:underline"
                                        >
                                            {run.code}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-foreground">{run.title}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                             {run.financial_month_details?.name || "Active Month"}
                                        </p>
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap font-mono text-muted-foreground">
                                        {run.payroll_date}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-foreground font-medium whitespace-nowrap">
                                        {formatNumber(run.total_gross)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        {formatNumber(run.total_paye)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                                        {formatNumber(run.total_nssf)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                                        {formatNumber(run.total_shif)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                                        {formatNumber(run.total_housing_levy)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-corporate-primary whitespace-nowrap">
                                        {formatCurrency(run.total_net_pay, "KES")}
                                    </td>
                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase",
                                                run.status === "PAID" &&
                                                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                                                run.status === "POSTED" &&
                                                    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
                                                run.status === "APPROVED" &&
                                                    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                                                run.status === "DRAFT" && "bg-muted text-muted-foreground",
                                                run.status === "CANCELLED" &&
                                                    "bg-destructive/10 text-destructive border border-destructive/20"
                                            )}
                                        >
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <Link
                                            href={`/${rolePrefix}/payroll/${run.reference}`}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                        >
                                            <span>Studio</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
