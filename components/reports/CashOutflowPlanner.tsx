"use client";

import { useState, useMemo } from "react";
import { useFetchCashBalance } from "@/hooks/reports/actions";
import { useFetchVendorBills } from "@/hooks/vendorbills/actions";
import { useFetchStaffClaims } from "@/hooks/staffclaims/actions";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    TrendingDown,
    Building2,
    ArrowUpRight,
    ArrowDownLeft,
    Receipt,
    Users,
    ChevronRight,
    Wallet,
    ShieldAlert,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CashOutflowPlannerProps {
    rolePrefix?: "finance" | "director" | "operations";
}

export function CashOutflowPlanner({ rolePrefix = "finance" }: CashOutflowPlannerProps) {
    const [selectedDivision, setSelectedDivision] = useState("ALL");

    const { data: cashData, isLoading: isCashLoading } = useFetchCashBalance(
        selectedDivision !== "ALL" ? { division: selectedDivision } : {}
    );

    const { data: billsData, isLoading: isBillsLoading } = useFetchVendorBills({
        status: "POSTED",
    });
    const { data: claimsData } = useFetchStaffClaims({
        status: "APPROVED",
    });

    const currentLiquidBalance = cashData?.cash_balance || 0;

    // Filter unpaid bills
    const unpaidBills = useMemo(() => {
        const list = Array.isArray(billsData) ? billsData : (billsData?.results || []);
        return list.filter((b: any) => Number(b.balance_due) > 0);
    }, [billsData]);

    const approvedClaims = useMemo(() => {
        const list = Array.isArray(claimsData) ? claimsData : (claimsData?.results || []);
        return list.filter((c: any) => c.status === "APPROVED");
    }, [claimsData]);

    // Bucket commitments
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const getDaysDiff = (dateStr?: string | null) => {
        if (!dateStr) return 999;
        const target = new Date(dateStr);
        const diffTime = target.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const dueOverdue = useMemo(() => {
        return unpaidBills.filter((b) => b.due_date && b.due_date < todayStr);
    }, [unpaidBills, todayStr]);

    const dueNext7Days = useMemo(() => {
        return unpaidBills.filter((b) => {
            const days = getDaysDiff(b.due_date);
            return days >= 0 && days <= 7;
        });
    }, [unpaidBills]);

    const dueNext30Days = useMemo(() => {
        return unpaidBills.filter((b) => {
            const days = getDaysDiff(b.due_date);
            return days > 7 && days <= 30;
        });
    }, [unpaidBills]);

    const dueLater = useMemo(() => {
        return unpaidBills.filter((b) => {
            const days = getDaysDiff(b.due_date);
            return days > 30 || !b.due_date;
        });
    }, [unpaidBills]);

    const totalOverdueAmount = dueOverdue.reduce((s, b) => s + Number(b.balance_due), 0);
    const total7DaysAmount = dueNext7Days.reduce((s, b) => s + Number(b.balance_due), 0);
    const total30DaysAmount = dueNext30Days.reduce((s, b) => s + Number(b.balance_due), 0);
    const totalApprovedClaimsAmount = approvedClaims.reduce((s, c) => s + Number(c.amount), 0);

    const totalImmediateOutflow = totalOverdueAmount + total7DaysAmount + totalApprovedClaimsAmount;
    const netProjectedRunway = currentLiquidBalance - totalImmediateOutflow;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                            Cash Outflow & AP Planner
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">Liquidity Runway Forecast</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                        Cash Outflow Planner
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Schedule vendor disbursements, staff reimbursements, and safeguard working capital reserves.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/${rolePrefix}/vendor-bills`}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm"
                    >
                        <Receipt className="w-4 h-4" /> Manage AP Bills
                    </Link>
                </div>
            </div>

            {/* Liquidity Runway Forecast Widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Available Liquid Cash
                        </p>
                        <Wallet className="w-5 h-5 text-corporate-primary" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-corporate-primary mt-3">
                        {formatCurrency(currentLiquidBalance, "KES")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Bank ({formatNumber(cashData?.bank_balance || 0)}) + Cash Box ({formatNumber(cashData?.cash_only || 0)})
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                            Immediate Outflow (7 Days)
                        </p>
                        <TrendingDown className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-3">
                        {formatCurrency(totalImmediateOutflow, "KES")}
                    </p>
                    <p className="text-[11px] text-rose-600/80 mt-1">
                        Overdue AP + Due this week + Staff claims
                    </p>
                </div>

                <div
                    className={cn(
                        "p-5 rounded-2xl border shadow-sm flex flex-col justify-between",
                        netProjectedRunway >= 0
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-destructive/10 border-destructive/30"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <p
                            className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                netProjectedRunway >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-destructive"
                            )}
                        >
                            Net Projected Runway
                        </p>
                        {netProjectedRunway >= 0 ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <ShieldAlert className="w-5 h-5 text-destructive" />
                        )}
                    </div>
                    <p
                        className={cn(
                            "text-2xl font-bold font-mono mt-3",
                            netProjectedRunway >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                        )}
                    >
                        {formatCurrency(netProjectedRunway, "KES")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {netProjectedRunway >= 0
                            ? "Surplus liquid buffer maintained."
                            : "Deficit warning: Requires AR collections / capital infusion."}
                    </p>
                </div>
            </div>

            {/* Outflow Timeline Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Critical & Overdue AP (Immediate) */}
                <div className="bg-card rounded-2xl border border-rose-500/30 shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <h3 className="text-sm font-bold text-foreground">
                                Critical & Overdue Vendor Bills
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-600">
                            {formatCurrency(totalOverdueAmount, "KES")}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {dueOverdue.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No overdue vendor bills. Great job!
                            </div>
                        ) : (
                            dueOverdue.map((bill) => (
                                <div
                                    key={bill.reference || bill.code}
                                    className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {bill.partner_details?.name || bill.vendor_name || "Vendor"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            {bill.code} • Due: {bill.due_date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                            {formatCurrency(bill.balance_due, bill.currency || "KES")}
                                        </span>
                                        <Link
                                            href={`/${rolePrefix}/vendor-bills/${bill.reference}`}
                                            className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Due Within 7 Days */}
                <div className="bg-card rounded-2xl border border-amber-500/30 shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <h3 className="text-sm font-bold text-foreground">
                                Due This Week (0-7 Days)
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-600">
                            {formatCurrency(total7DaysAmount, "KES")}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {dueNext7Days.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No bills due in the next 7 days.
                            </div>
                        ) : (
                            dueNext7Days.map((bill) => (
                                <div
                                    key={bill.reference || bill.code}
                                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {bill.partner_details?.name || bill.vendor_name || "Vendor"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            {bill.code} • Due: {bill.due_date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                            {formatCurrency(bill.balance_due, bill.currency || "KES")}
                                        </span>
                                        <Link
                                            href={`/${rolePrefix}/vendor-bills/${bill.reference}`}
                                            className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Approved Staff Expense Claims */}
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            <h3 className="text-sm font-bold text-foreground">
                                Approved Staff Reimbursements
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-600">
                            {formatCurrency(totalApprovedClaimsAmount, "KES")}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {approvedClaims.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No pending staff reimbursement disbursements.
                            </div>
                        ) : (
                            approvedClaims.map((claim) => (
                                <div
                                    key={claim.reference || claim.code}
                                    className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div>
                                        <p className="font-bold text-foreground">{claim.title}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {claim.employee_name || "Employee"} • {claim.code}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-purple-600">
                                            {formatCurrency(claim.amount, "KES")}
                                        </span>
                                        <Link
                                            href={`/${rolePrefix}/staff-claims`}
                                            className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 4. Due in 8-30 Days */}
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-foreground">
                                Due Later This Month (8-30 Days)
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-600">
                            {formatCurrency(total30DaysAmount, "KES")}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {dueNext30Days.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No bills due in the 8-30 day window.
                            </div>
                        ) : (
                            dueNext30Days.map((bill) => (
                                <div
                                    key={bill.reference || bill.code}
                                    className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {bill.partner_details?.name || bill.vendor_name || "Vendor"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            {bill.code} • Due: {bill.due_date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-blue-600">
                                            {formatCurrency(bill.balance_due, bill.currency || "KES")}
                                        </span>
                                        <Link
                                            href={`/${rolePrefix}/vendor-bills/${bill.reference}`}
                                            className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
