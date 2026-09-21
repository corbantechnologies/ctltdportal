"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchStaffClaims } from "@/hooks/staffclaims/actions";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useFetchFinancialMonths } from "@/hooks/financialmonths/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import {
    createStaffClaim,
    approveStaffClaim,
    rejectStaffClaim,
    disburseStaffClaim,
    StaffClaim,
} from "@/services/staffclaims";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Receipt,
    Plus,
    Search,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Building2,
    CreditCard,
    DollarSign,
    Users,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Banknote,
    FileCheck,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StaffClaimsStudioProps {
    rolePrefix: "finance" | "director" | "operations" | "employee";
}

type ClaimStatusFilter = "ALL" | "SUBMITTED" | "APPROVED" | "DISBURSED" | "REJECTED";

export default function StaffClaimsStudio({ rolePrefix }: StaffClaimsStudioProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const headers = useAxiosAuth();

    const [statusFilter, setStatusFilter] = useState<ClaimStatusFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
    const [selectedClaimForDisburse, setSelectedClaimForDisburse] = useState<StaffClaim | null>(null);

    // Form states
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [amount, setAmount] = useState<number | string>("");
    const [expenseBook, setExpenseBook] = useState("");
    const [financialMonth, setFinancialMonth] = useState("");
    const [division, setDivision] = useState("");
    const [description, setDescription] = useState("");
    const [disbursingAccount, setDisbursingAccount] = useState("");

    // Loaders
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const { data: response, isLoading, refetch } = useFetchStaffClaims({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
    });
    const { data: booksData } = useFetchBooks();
    const { data: paymentAccountsData } = useFetchPaymentAccounts();
    const { data: monthsData } = useFetchFinancialMonths();
    const { data: divisionsData } = useFetchDivisions();

    // Safe normalized arrays
    const claims = useMemo<StaffClaim[]>(() => (Array.isArray(response) ? (response as unknown as StaffClaim[]) : (response?.results || [])), [response]);
    const books = useMemo(() => (Array.isArray(booksData) ? booksData : (booksData as any)?.results || []), [booksData]);
    const paymentAccounts = useMemo(() => (Array.isArray(paymentAccountsData) ? paymentAccountsData : (paymentAccountsData as any)?.results || []), [paymentAccountsData]);
    const months = useMemo(() => (Array.isArray(monthsData) ? monthsData : (monthsData as any)?.results || []), [monthsData]);
    const divisions = useMemo(() => (Array.isArray(divisionsData) ? divisionsData : (divisionsData as any)?.results || []), [divisionsData]);


    // KPI Metrics
    const pendingApprovalAmount = useMemo(() => {
        return claims
            .filter((c) => c.status === "SUBMITTED")
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    }, [claims]);

    const approvedDisbursementAmount = useMemo(() => {
        return claims
            .filter((c) => c.status === "APPROVED")
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    }, [claims]);

    const totalDisbursedAmount = useMemo(() => {
        return claims
            .filter((c) => c.status === "DISBURSED")
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    }, [claims]);

    const filteredClaims = useMemo(() => {
        if (!searchQuery) return claims;
        const q = searchQuery.toLowerCase();
        return claims.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                (c.employee_name && c.employee_name.toLowerCase().includes(q)) ||
                (c.description && c.description.toLowerCase().includes(q))
        );
    }, [claims, searchQuery]);

    const handleCreateClaim = async () => {
        if (!title) return toast.error("Please enter a claim title.");
        if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid amount.");

        try {
            setIsSubmitting(true);
            await createStaffClaim(
                {
                    title,
                    date,
                    amount: Number(amount),
                    expense_book: expenseBook || undefined,
                    financial_month: financialMonth || undefined,
                    division: division || undefined,
                    description: description || undefined,
                },
                headers
            );
            toast.success("Expense claim submitted for approval!");
            setIsCreateModalOpen(false);
            setTitle("");
            setAmount("");
            setDescription("");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["staffclaims"] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit expense claim.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async (claimRef: string) => {
        try {
            setActionLoadingId(claimRef);
            await approveStaffClaim(claimRef, headers);
            toast.success("Expense claim approved for disbursement!");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["staffclaims"] });
        } catch (err: any) {
            toast.error("Failed to approve claim.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (claimRef: string) => {
        const reason = prompt("Enter reason for rejection:") || "Rejected by Management";
        try {
            setActionLoadingId(claimRef);
            await rejectStaffClaim(claimRef, reason, headers);
            toast.success("Expense claim marked as rejected.");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["staffclaims"] });
        } catch (err: any) {
            toast.error("Failed to reject claim.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmDisburse = async () => {
        if (!selectedClaimForDisburse) return;
        try {
            setIsSubmitting(true);
            const res = await disburseStaffClaim(
                selectedClaimForDisburse.reference,
                disbursingAccount || undefined,
                headers
            );
            toast.success(res.message || "Disbursed and posted to GL!");
            setIsDisburseModalOpen(false);
            setSelectedClaimForDisburse(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ["staffclaims"] });
            queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
            queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to disburse claim.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canApproveOrDisburse = rolePrefix === "director" || rolePrefix === "finance";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                            Staff Claims & Reimbursements
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">Expense Approval & GL Disbursement</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                        Staff Expense Claims
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Submit field expenses, review vouchers, and execute double-entry liquid reimbursements.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Submit New Claim</span>
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
                        Pending Approval
                    </p>
                    <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
                        {formatCurrency(pendingApprovalAmount, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Awaiting Director Review</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
                        Approved For Payout
                    </p>
                    <p className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-2">
                        {formatCurrency(approvedDisbursementAmount, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Ready for Disbursal</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                        Total Disbursed
                    </p>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                        {formatCurrency(totalDisbursedAmount, "KES")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Posted & Reimbursed</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Claims Count
                    </p>
                    <p className="text-xl font-bold font-mono text-foreground mt-2">
                        {claims.length} Claims
                    </p>
                    <span className="text-[10px] text-muted-foreground">Portfolio Records</span>
                </div>
            </div>

            {/* Filter Tabs and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {(
                        [
                            { key: "ALL", label: "All Claims" },
                            { key: "SUBMITTED", label: "Pending Approval" },
                            { key: "APPROVED", label: "Approved" },
                            { key: "DISBURSED", label: "Disbursed" },
                            { key: "REJECTED", label: "Rejected" },
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
                        placeholder="Search employee or memo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-corporate-primary"
                    />
                </div>
            </div>

            {/* Claims Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
                    <p className="text-sm">Loading staff claims...</p>
                </div>
            ) : filteredClaims.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-semibold text-foreground">No Expense Claims Found</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Submit a reimbursement claim for work-related expenses.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Submit Claim
                    </button>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="py-3 px-4">Claim Code</th>
                                <th className="py-3 px-4">Employee</th>
                                <th className="py-3 px-4">Claim Title / Memo</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Expense Account</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                {canApproveOrDisburse && <th className="py-3 px-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredClaims.map((claim) => (
                                <tr key={claim.reference || claim.code} className="hover:bg-muted/30">
                                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-corporate-primary">
                                        {claim.code}
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-foreground">
                                            {claim.employee_name || "Employee"}
                                        </p>
                                        {claim.employee_email && (
                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                {claim.employee_email}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-foreground">{claim.title}</p>
                                        {claim.description && (
                                            <p className="text-[10px] text-muted-foreground truncate max-w-xs">
                                                {claim.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap font-mono text-muted-foreground">
                                        {claim.date}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-secondary text-secondary-foreground">
                                            {claim.expense_book_details?.name || "6010-EXPENSE"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-corporate-primary whitespace-nowrap">
                                        {formatCurrency(claim.amount, "KES")}
                                    </td>
                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase",
                                                claim.status === "DISBURSED" &&
                                                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                                                claim.status === "APPROVED" &&
                                                    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
                                                claim.status === "SUBMITTED" &&
                                                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                                                claim.status === "REJECTED" &&
                                                    "bg-destructive/10 text-destructive border border-destructive/20"
                                            )}
                                        >
                                            {claim.status}
                                        </span>
                                    </td>
                                    {canApproveOrDisburse && (
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {claim.status === "SUBMITTED" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(claim.reference)}
                                                            disabled={actionLoadingId === claim.reference}
                                                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(claim.reference)}
                                                            disabled={actionLoadingId === claim.reference}
                                                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-destructive hover:bg-destructive/10 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {claim.status === "APPROVED" && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClaimForDisburse(claim);
                                                            setIsDisburseModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm"
                                                    >
                                                        <Banknote className="w-3.5 h-3.5" />
                                                        <span>Disburse</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Staff Claim Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-corporate-primary" /> Submit Staff Expense Claim
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Claim Title / Subject <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Field Visit Fuel / Client Meeting"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Amount (KES) <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-3 py-2 font-mono font-bold bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Expense Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Expense Head (COA 6xxx)
                                </label>
                                <select
                                    value={expenseBook}
                                    onChange={(e) => setExpenseBook(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                >
                                    <option value="">Select Expense Category</option>
                                    {books
                                        .filter((b: any) => b.account_type === "EXPENSE" || b.code?.startsWith("6"))
                                        .map((b: any) => (
                                            <option key={b.reference} value={b.reference}>
                                                {b.code} - {b.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Description / Memo
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Explain business purpose of expense..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateClaim}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                <span>Submit Claim</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Disburse Modal */}
            {isDisburseModalOpen && selectedClaimForDisburse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-emerald-500" /> Disburse & Post to GL
                            </h3>
                            <button
                                onClick={() => setIsDisburseModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-xs"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1 text-xs">
                            <p className="font-bold text-foreground">{selectedClaimForDisburse.title}</p>
                            <p className="text-muted-foreground">
                                Employee: {selectedClaimForDisburse.employee_name}
                            </p>
                            <p className="text-base font-bold font-mono text-corporate-primary mt-1">
                                {formatCurrency(selectedClaimForDisburse.amount, "KES")}
                            </p>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Disbursing Bank / M-Pesa Account <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={disbursingAccount}
                                    onChange={(e) => setDisbursingAccount(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                >
                                    <option value="">Select Disbursing Account</option>
                                    {paymentAccounts.map((pa: any) => (
                                        <option key={pa.reference} value={pa.reference}>
                                            {pa.name} ({pa.account_type || "Bank"})
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsDisburseModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDisburse}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                <span>Confirm Disbursement</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
