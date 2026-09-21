"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useFetchFinancialMonths } from "@/hooks/financialmonths/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchVendorBill, useFetchVendorBillPayments } from "@/hooks/vendorbills/actions";
import {
    createVendorBill,
    updateVendorBill,
    postVendorBillToGL,
    recordVendorBillPayment,
    VendorBill,
} from "@/services/vendorbills";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Receipt,
    Building2,
    Calendar,
    DollarSign,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronLeft,
    FileText,
    Printer,
    Send,
    ShieldCheck,
    Plus,
    Loader2,
    Layers,
    FileCheck,
    Banknote,
    Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface VendorBillStudioProps {
    billReference?: string;
    rolePrefix: "finance" | "director" | "operations";
}

export default function VendorBillStudio({ billReference, rolePrefix }: VendorBillStudioProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const headers = useAxiosAuth();

    const isNew = !billReference || billReference === "new";

    // Queries
    const { data: billData, isLoading: isBillLoading, refetch: refetchBill } = useFetchVendorBill(
        isNew ? "" : billReference
    );
    const { data: paymentsData, refetch: refetchPayments } = useFetchVendorBillPayments(
        isNew ? undefined : billReference
    );
    const { data: partnersData } = useFetchPartners();
    const { data: booksData } = useFetchBooks();
    const { data: paymentAccountsData } = useFetchPaymentAccounts();
    const { data: monthsData } = useFetchFinancialMonths();
    const { data: divisionsData } = useFetchDivisions();

    // Safe normalized arrays
    const partners = useMemo(() => (Array.isArray(partnersData) ? partnersData : (partnersData as any)?.results || []), [partnersData]);
    const books = useMemo(() => (Array.isArray(booksData) ? booksData : (booksData as any)?.results || []), [booksData]);
    const paymentAccounts = useMemo(() => (Array.isArray(paymentAccountsData) ? paymentAccountsData : (paymentAccountsData as any)?.results || []), [paymentAccountsData]);
    const months = useMemo(() => (Array.isArray(monthsData) ? monthsData : (monthsData as any)?.results || []), [monthsData]);
    const divisions = useMemo(() => (Array.isArray(divisionsData) ? divisionsData : (divisionsData as any)?.results || []), [divisionsData]);
    const payments = useMemo(() => (Array.isArray(paymentsData) ? paymentsData : (paymentsData as any)?.results || []), [paymentsData]);

    // Form state
    const [vendor, setVendor] = useState("");
    const [vendorBillNumber, setVendorBillNumber] = useState("");
    const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState("");
    const [expenseBook, setExpenseBook] = useState("");
    const [financialMonth, setFinancialMonth] = useState("");
    const [division, setDivision] = useState("");
    const [totalAmount, setTotalAmount] = useState<number | string>("");
    const [description, setDescription] = useState("");

    // Payment modal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAccount, setPaymentAccount] = useState("");
    const [paymentAmount, setPaymentAmount] = useState<number | string>("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentRef, setPaymentRef] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");

    // Action loaders
    const [isSaving, setIsSaving] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Populate existing bill
    useEffect(() => {
        if (billData && !isNew) {
            setVendor(billData.partner || billData.vendor || "");
            setVendorBillNumber(billData.vendor_bill_number || "");
            setBillDate(billData.date || billData.bill_date || "");
            setDueDate(billData.due_date || "");
            setExpenseBook(billData.expense_book || "");
            setFinancialMonth(billData.financial_month || "");
            setDivision(billData.division || "");
            setTotalAmount(billData.total_amount || "");
            setDescription(billData.notes || billData.description || "");
            setPaymentAmount(billData.balance_due || "");
        }
    }, [billData, isNew]);

    // Active financial month default
    useEffect(() => {
        if (isNew && months.length > 0 && !financialMonth) {
            const active = months.find((m: any) => m.is_active);
            if (active) setFinancialMonth(active.reference);
        }
    }, [isNew, months, financialMonth]);

    const handleSaveBill = async () => {
        if (!vendor) return toast.error("Please select a Vendor.");
        if (!billDate) return toast.error("Please enter a bill date.");
        if (!totalAmount || Number(totalAmount) <= 0) return toast.error("Please enter a valid amount.");

        try {
            setIsSaving(true);
            if (isNew) {
                const created = await createVendorBill(
                    {
                        partner: vendor,
                        vendor_bill_number: vendorBillNumber || undefined,
                        date: billDate,
                        due_date: dueDate || undefined,
                        expense_book: expenseBook || undefined,
                        financial_month: financialMonth || undefined,
                        division: division || undefined,
                        total_amount: Number(totalAmount),
                        subtotal: Number(totalAmount),
                        notes: description || undefined,
                    },
                    headers
                );
                toast.success(`Vendor bill ${created.code} booked successfully!`);
                queryClient.invalidateQueries({ queryKey: ["vendorbills"] });
                router.push(`/${rolePrefix}/vendor-bills/${created.reference}`);
            } else {
                await updateVendorBill(
                    billReference,
                    {
                        partner: vendor,
                        vendor_bill_number: vendorBillNumber || undefined,
                        date: billDate,
                        due_date: dueDate || undefined,
                        expense_book: expenseBook || undefined,
                        financial_month: financialMonth || undefined,
                        division: division || undefined,
                        total_amount: Number(totalAmount),
                        subtotal: Number(totalAmount),
                        notes: description || undefined,
                    },
                    headers
                );
                toast.success("Vendor bill updated successfully.");
                refetchBill();
                queryClient.invalidateQueries({ queryKey: ["vendorbills"] });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to save vendor bill.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePostToGL = async () => {
        if (isNew || !billReference) return;
        try {
            setIsPosting(true);
            const res = await postVendorBillToGL(billReference, headers);
            toast.success(res.message || "Vendor bill posted to GL!");
            refetchBill();
            queryClient.invalidateQueries({ queryKey: ["vendorbills"] });
            queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
            queryClient.invalidateQueries({ queryKey: ["pnl"] });
            queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to post vendor bill to GL.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentAccount) return toast.error("Please select a disbursing payment account.");
        if (!paymentAmount || Number(paymentAmount) <= 0) return toast.error("Please enter a valid disbursement amount.");

        try {
            setIsPaying(true);
            await recordVendorBillPayment(
                {
                    bill: billReference!,
                    payment_account: paymentAccount,
                    date: paymentDate,
                    amount: Number(paymentAmount),
                    payment_reference: paymentRef || undefined,
                    notes: paymentNotes || undefined,
                },
                headers
            );
            toast.success("Vendor disbursement recorded & posted to GL!");
            setIsPaymentModalOpen(false);
            refetchBill();
            refetchPayments();
            queryClient.invalidateQueries({ queryKey: ["vendorbills"] });
            queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to record vendor bill payment.");
        } finally {
            setIsPaying(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isNew && isBillLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card rounded-2xl border border-border">
                <Loader2 className="w-8 h-8 animate-spin text-corporate-primary" />
                <p className="text-sm text-muted-foreground">Loading vendor bill...</p>
            </div>
        );
    }

    const selectedVendorObj = partners.find((p: any) => p.reference === vendor);
    const selectedBookObj = books.find((b: any) => b.reference === expenseBook);

    return (
        <div className="space-y-6">
            {/* Studio Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${rolePrefix}/vendor-bills`}
                        className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                                Accounts Payable Studio
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-mono font-medium">
                                {isNew ? "New Vendor Bill" : billData?.code}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                            {isNew
                                ? "Book Supplier Invoice"
                                : `${selectedVendorObj?.name || billData?.partner_details?.name || billData?.vendor_name || "Vendor"} Bill`}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isNew
                                ? "Record vendor bill, allocate operating expense accounts, and preview double-entry AP posting."
                                : "Inspect payable details, audit general ledger journal entries, and disburse bank payments."}
                        </p>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {!isNew && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" /> Print Voucher
                        </button>
                    )}

                    {!isNew && !billData?.is_posted && (
                        <button
                            onClick={handlePostToGL}
                            disabled={isPosting}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                            <span>Post to General Ledger</span>
                        </button>
                    )}

                    {!isNew && billData?.is_posted && billData?.balance_due > 0 && (
                        <button
                            onClick={() => {
                                setPaymentAmount(billData.balance_due);
                                setIsPaymentModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            <Banknote className="w-4 h-4" />
                            <span>Record Payment</span>
                        </button>
                    )}

                    {(!billData?.is_posted || isNew) && (
                        <button
                            onClick={handleSaveBill}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{isNew ? "Create Bill" : "Save Changes"}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Split Grid: Form Configuration & Real-Time Voucher Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Controls Left */}
                <div className="lg:col-span-5 space-y-5 print:hidden">
                    <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-5 space-y-4">
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-corporate-primary" /> Bill Details
                        </h2>

                        {/* Vendor Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Supplier / Vendor <span className="text-destructive">*</span>
                            </label>
                            <select
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                disabled={billData?.is_posted}
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            >
                                <option value="">Select Vendor / Supplier</option>
                                {partners.map((p: any) => (
                                    <option key={p.reference} value={p.reference}>
                                        {p.name} ({p.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vendor Bill Number & Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Vendor Bill / Inv #
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. INV-2024-889"
                                    value={vendorBillNumber}
                                    onChange={(e) => setVendorBillNumber(e.target.value)}
                                    disabled={billData?.is_posted}
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Total Amount (KES) <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(e.target.value)}
                                    disabled={billData?.is_posted}
                                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Bill Date <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    disabled={billData?.is_posted}
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Due Date (Payment Deadline)
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={billData?.is_posted}
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>
                        </div>

                        {/* Expense Book Head (COA 6xxx) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Expense Account (Debit Head)
                            </label>
                            <select
                                value={expenseBook}
                                onChange={(e) => setExpenseBook(e.target.value)}
                                disabled={billData?.is_posted}
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            >
                                <option value="">Select Expense Book (6xxx)</option>
                                {books
                                    .filter((b: any) => b.account_type === "EXPENSE" || b.code?.startsWith("6"))
                                    .map((b: any) => (
                                        <option key={b.reference} value={b.reference}>
                                            {b.code} - {b.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Financial Month & Division */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Financial Month
                                </label>
                                <select
                                    value={financialMonth}
                                    onChange={(e) => setFinancialMonth(e.target.value)}
                                    disabled={billData?.is_posted}
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                >
                                    <option value="">Auto Select Active</option>
                                    {months.map((m: any) => (
                                        <option key={m.reference} value={m.reference}>
                                            {m.title || m.name} {m.is_active ? "(Active)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Cost Center / Division
                                </label>
                                <select
                                    value={division}
                                    onChange={(e) => setDivision(e.target.value)}
                                    disabled={billData?.is_posted}
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                >
                                    <option value="">Headquarters / General</option>
                                    {divisions.map((d: any) => (
                                        <option key={d.reference} value={d.reference}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Memo / Description
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Details of goods / services supplied..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={billData?.is_posted}
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            />
                        </div>
                    </div>

                    {/* Double-Entry GL Blueprint Card */}
                    <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-5 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-corporate-primary" /> Double-Entry General Ledger Impact
                        </h3>
                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                <div>
                                    <span className="font-sans font-bold text-emerald-600 block text-[10px] uppercase">
                                        DEBIT (+) EXPENSE
                                    </span>
                                    <span>{selectedBookObj?.name || "Operating Expense (6xxx)"}</span>
                                </div>
                                <span className="font-bold text-emerald-600">
                                    {formatNumber(Number(totalAmount) || 0)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-2.5 rounded-lg bg-corporate-primary/5 border border-corporate-primary/20">
                                <div>
                                    <span className="font-sans font-bold text-corporate-primary block text-[10px] uppercase">
                                        CREDIT (-) LIABILITY
                                    </span>
                                    <span>2010 - Accounts Payable (AP)</span>
                                </div>
                                <span className="font-bold text-corporate-primary">
                                    {formatNumber(Number(totalAmount) || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Parchment Bill Document Preview */}
                <div className="lg:col-span-7">
                    <div className="bg-card rounded-2xl border border-border/80 shadow-lg p-6 sm:p-8 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-border pb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-corporate-primary" />
                                    <span className="text-lg font-extrabold text-foreground">
                                        CORBAN TECHNOLOGIES LTD
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Accounts Payable Voucher & Audit Ledger
                                </p>
                            </div>

                            <div className="text-right">
                                <span
                                    className={cn(
                                        "px-2.5 py-0.5 text-xs font-bold uppercase rounded-full inline-block",
                                        billData?.status === "PAID" && "bg-emerald-500/10 text-emerald-600",
                                        billData?.status === "PARTIALLY_PAID" && "bg-amber-500/10 text-amber-600",
                                        billData?.status === "POSTED" && "bg-purple-500/10 text-purple-600",
                                        (!billData?.status || billData?.status === "DRAFT") && "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {billData?.status || "DRAFT BILL"}
                                </span>
                                <p className="text-xs font-mono font-bold text-foreground mt-1">
                                    {billData?.code || "VB-PENDING"}
                                </p>
                            </div>
                        </div>

                        {/* Bill Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-muted/30 border border-border">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                                    Vendor / Supplier
                                </span>
                                <span className="font-bold text-foreground mt-0.5 block truncate">
                                    {selectedVendorObj?.name || billData?.partner_details?.name || billData?.vendor_name || "Not Selected"}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-muted/30 border border-border">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                                    Bill Date
                                </span>
                                <span className="font-mono font-medium text-foreground mt-0.5 block">
                                    {billDate || "-"}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-muted/30 border border-border">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                                    Due Date
                                </span>
                                <span className="font-mono font-medium text-foreground mt-0.5 block">
                                    {dueDate || "Immediate"}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-corporate-primary/10 border border-corporate-primary/20">
                                <span className="text-[10px] font-semibold text-corporate-primary uppercase block">
                                    Total Amount
                                </span>
                                <span className="font-mono font-bold text-corporate-primary mt-0.5 block">
                                    {formatCurrency(Number(totalAmount) || 0, "KES")}
                                </span>
                            </div>
                        </div>

                        {/* Bill Balance Summary */}
                        {!isNew && billData && (
                            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/20 border border-border text-center text-xs">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Total Invoiced</p>
                                    <p className="text-sm font-mono font-bold mt-0.5 text-foreground">
                                        {formatCurrency(billData.total_amount, billData.currency || "KES")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-600 uppercase">Amount Paid</p>
                                    <p className="text-sm font-mono font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(billData.amount_paid, billData.currency || "KES")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-corporate-primary uppercase">Balance Due</p>
                                    <p className="text-sm font-mono font-bold mt-0.5 text-corporate-primary">
                                        {formatCurrency(billData.balance_due, billData.currency || "KES")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Payment / Disbursement History Ledger */}
                        {!isNew && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Banknote className="w-4 h-4 text-emerald-500" /> Disbursement & Payment History
                                </h3>

                                <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                            <tr>
                                                <th className="py-2.5 px-3">Date</th>
                                                <th className="py-2.5 px-3">Payment Account</th>
                                                <th className="py-2.5 px-3">Ref #</th>
                                                <th className="py-2.5 px-3 text-right">Amount Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {payments.length > 0 ? (
                                                payments.map((p: any) => (
                                                    <tr key={p.reference || p.code} className="hover:bg-muted/20">
                                                        <td className="py-2 px-3 font-mono text-muted-foreground">
                                                            {p.date || p.payment_date}
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {p.payment_account_details?.name || "Bank Account"}
                                                        </td>
                                                        <td className="py-2 px-3 font-mono text-muted-foreground">
                                                            {p.payment_reference || p.reference_number || "-"}
                                                        </td>
                                                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatCurrency(p.amount, "KES")}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                                                        No disbursements made yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Record Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-emerald-500" /> Record Vendor Disbursement
                            </h3>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-xs"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Disbursing Account <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={paymentAccount}
                                    onChange={(e) => setPaymentAccount(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                >
                                    <option value="">Select Bank / M-Pesa Account</option>
                                    {paymentAccounts.map((pa: any) => (
                                        <option key={pa.reference} value={pa.reference}>
                                            {pa.name} ({pa.account_type || "Bank"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Amount (KES) <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full px-3 py-2 font-mono font-bold bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Ref / Cheque / M-Pesa Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. QKJ8992KLS"
                                    value={paymentRef}
                                    onChange={(e) => setPaymentRef(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1">
                                    Notes
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Payment memo..."
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRecordPayment}
                                disabled={isPaying}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                <span>Confirm Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
