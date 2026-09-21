"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchVendorBills } from "@/hooks/vendorbills/actions";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Receipt,
    Plus,
    Search,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Building2,
    DollarSign,
    Filter,
    ExternalLink,
    ChevronRight,
    Loader2,
    ShieldCheck,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface VendorBillsListProps {
    rolePrefix: "finance" | "director" | "operations";
}

type BillStatusFilter = "ALL" | "DRAFT" | "POSTED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";

export default function VendorBillsList({ rolePrefix }: VendorBillsListProps) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<BillStatusFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: response, isLoading } = useFetchVendorBills({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
    });

    const bills = useMemo(() => response?.results || [], [response]);

    // KPI stats
    const totalOutstandingAP = useMemo(() => {
        return bills
            .filter((b) => b.status !== "CANCELLED" && b.status !== "DRAFT")
            .reduce((sum, b) => sum + (Number(b.balance_due) || 0), 0);
    }, [bills]);

    const totalPaidAP = useMemo(() => {
        return bills.reduce((sum, b) => sum + (Number(b.amount_paid) || 0), 0);
    }, [bills]);

    const overdueBillsCount = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        return bills.filter(
            (b) =>
                b.due_date &&
                b.due_date < today &&
                b.balance_due > 0 &&
                b.status !== "CANCELLED"
        ).length;
    }, [bills]);

    const filteredBills = useMemo(() => {
        if (!searchQuery) return bills;
        const q = searchQuery.toLowerCase();
        return bills.filter(
            (b) =>
                b.code.toLowerCase().includes(q) ||
                (b.vendor_bill_number && b.vendor_bill_number.toLowerCase().includes(q)) ||
                (b.partner_details?.name && b.partner_details.name.toLowerCase().includes(q)) ||
                (b.vendor_name && b.vendor_name.toLowerCase().includes(q)) ||
                (b.notes && b.notes.toLowerCase().includes(q))
        );
    }, [bills, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header & New Bill Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                            Accounts Payable
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">Vendor Invoices & Ledger</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                        Vendor Bills (AP)
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage supplier invoices, double-entry expense accruals, and disbursement schedules.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/${rolePrefix}/reports/cash-outflow`}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
                    >
                        <Clock className="w-4 h-4" /> Outflow Planner
                    </Link>

                    <Link
                        href={`/${rolePrefix}/vendor-bills/new`}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Book Vendor Bill</span>
                    </Link>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total AP Outstanding
                    </p>
                    <p className="text-xl font-bold font-mono text-corporate-primary mt-2">
                        {formatCurrency(totalOutstandingAP, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Committed Supplier Liabilities</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                        Total Settled
                    </p>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                        {formatCurrency(totalPaidAP, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Disbursed to Vendors</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
                        Overdue Bills
                    </p>
                    <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
                        {overdueBillsCount} Bills
                    </p>
                    <span className="text-[10px] text-rose-600/80 font-medium">Past Due Date</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Bills Count
                    </p>
                    <p className="text-xl font-bold font-mono text-foreground mt-2">
                        {bills.length} Bills
                    </p>
                    <span className="text-[10px] text-muted-foreground">Portfolio Records</span>
                </div>
            </div>

            {/* Filter Tabs and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {(
                        [
                            { key: "ALL", label: "All Bills" },
                            { key: "DRAFT", label: "Draft" },
                            { key: "POSTED", label: "Posted" },
                            { key: "PARTIALLY_PAID", label: "Partially Paid" },
                            { key: "PAID", label: "Fully Settled" },
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
                        placeholder="Search vendor, bill code, or note..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-corporate-primary"
                    />
                </div>
            </div>

            {/* Vendor Bills Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
                    <p className="text-sm">Loading vendor bills ledger...</p>
                </div>
            ) : filteredBills.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border">
                    <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-semibold text-foreground">No Vendor Bills Found</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Book a supplier invoice to initiate double-entry expense accruals.
                    </p>
                    <Link
                        href={`/${rolePrefix}/vendor-bills/new`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Book First Vendor Bill
                    </Link>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="py-3 px-4">Bill Code</th>
                                <th className="py-3 px-4">Vendor</th>
                                <th className="py-3 px-4">Bill Date</th>
                                <th className="py-3 px-4">Due Date</th>
                                <th className="py-3 px-4">Expense Account</th>
                                <th className="py-3 px-4 text-right">Total Amount</th>
                                <th className="py-3 px-4 text-right">Paid</th>
                                <th className="py-3 px-4 text-right">Balance Due</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredBills.map((bill) => {
                                const isOverdue =
                                    bill.due_date &&
                                    bill.due_date < new Date().toISOString().split("T")[0] &&
                                    bill.balance_due > 0 &&
                                    bill.status !== "CANCELLED";

                                return (
                                    <tr
                                        key={bill.reference || bill.code}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <Link
                                                href={`/${rolePrefix}/vendor-bills/${bill.reference}`}
                                                className="font-mono font-bold text-corporate-primary hover:underline"
                                            >
                                                {bill.code}
                                            </Link>
                                            {bill.vendor_bill_number && (
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    Ref: {bill.vendor_bill_number}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-foreground">
                                                {bill.partner_details?.name || bill.vendor_name || "Vendor"}
                                            </p>
                                            {bill.notes && (
                                                <p className="text-[10px] text-muted-foreground truncate max-w-xs">
                                                    {bill.notes}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap font-mono text-muted-foreground">
                                            {bill.date || bill.bill_date}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap font-mono">
                                            {bill.due_date ? (
                                                <span
                                                    className={cn(
                                                        isOverdue
                                                            ? "text-rose-600 dark:text-rose-400 font-semibold"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {bill.due_date}
                                                    {isOverdue && " (Overdue)"}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-secondary text-secondary-foreground">
                                                {bill.expense_book_details?.name || "Operating Expense"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-foreground font-medium whitespace-nowrap">
                                            {formatNumber(bill.total_amount)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                            {bill.amount_paid > 0 ? formatNumber(bill.amount_paid) : "-"}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-corporate-primary whitespace-nowrap">
                                            {formatCurrency(bill.balance_due, bill.currency || "KES")}
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span
                                                className={cn(
                                                    "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase",
                                                    bill.status === "PAID" &&
                                                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                                                    bill.status === "PARTIALLY_PAID" &&
                                                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                                                    bill.status === "POSTED" &&
                                                        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
                                                    bill.status === "DRAFT" &&
                                                        "bg-muted text-muted-foreground",
                                                    bill.status === "CANCELLED" &&
                                                        "bg-destructive/10 text-destructive border border-destructive/20"
                                                )}
                                            >
                                                {bill.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/${rolePrefix}/vendor-bills/${bill.reference}`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                            >
                                                <span>Manage</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
