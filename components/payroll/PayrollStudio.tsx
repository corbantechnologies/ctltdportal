"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchEmployees } from "@/hooks/accounts/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useFetchFinancialMonths } from "@/hooks/financialmonths/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchPayrollRun } from "@/hooks/payrollruns/actions";
import { useFetchPayrollItems } from "@/hooks/payrollitems/actions";
import {
    createPayrollRun,
    postPayrollRunToGL,
    PayrollRun,
} from "@/services/payrollruns";
import {
    createPayrollItem,
    deletePayrollItem,
    calculateStatutoryDeductions,
    PayrollItem,
} from "@/services/payrollitems";
import { formatCurrency, formatNumber } from "@/tools/format";
import {
    Users,
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
    Trash2,
    Loader2,
    Layers,
    Banknote,
    Sparkles,
    UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PayrollStudioProps {
    runReference?: string;
    rolePrefix: "finance" | "director" | "operations";
}

export default function PayrollStudio({ runReference, rolePrefix }: PayrollStudioProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const headers = useAxiosAuth();

    const isNew = !runReference || runReference === "new";

    // Queries
    const { data: runData, isLoading: isRunLoading, refetch: refetchRun } = useFetchPayrollRun(
        isNew ? "" : runReference
    );
    const { data: itemsData, refetch: refetchItems } = useFetchPayrollItems(
        isNew ? {} : { payroll_run: runReference }
    );
    const { data: employeesData } = useFetchEmployees();
    const { data: paymentAccountsData } = useFetchPaymentAccounts();
    const { data: monthsData } = useFetchFinancialMonths();
    const { data: divisionsData } = useFetchDivisions();

    // Payroll Run Meta Form State
    const [title, setTitle] = useState("");
    const [payrollDate, setPayrollDate] = useState(new Date().toISOString().split("T")[0]);
    const [financialMonth, setFinancialMonth] = useState("");
    const [division, setDivision] = useState("");
    const [paymentAccount, setPaymentAccount] = useState("");
    const [notes, setNotes] = useState("");

    // New Item Add State
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [basicSalary, setBasicSalary] = useState<number | string>("");
    const [allowances, setAllowances] = useState<number | string>("0");

    // Live preview item auto-calculation
    const [computedPreview, setComputedPreview] = useState<{
        gross: number;
        taxable: number;
        nssf: number;
        paye: number;
        shif: number;
        housingLevy: number;
        net: number;
    } | null>(null);

    // Loaders
    const [isSavingRun, setIsSavingRun] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isPostingGL, setIsPostingGL] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

    // Populate existing run
    useEffect(() => {
        if (runData && !isNew) {
            setTitle(runData.title || "");
            setPayrollDate(runData.payroll_date || "");
            setFinancialMonth(runData.financial_month || "");
            setDivision(runData.division || "");
            setPaymentAccount(runData.payment_account || "");
            setNotes(runData.notes || "");
        }
    }, [runData, isNew]);

    // Active financial month default
    useEffect(() => {
        if (isNew && monthsData && monthsData.length > 0 && !financialMonth) {
            const active = monthsData.find((m: any) => m.is_active);
            if (active) setFinancialMonth(active.reference);
        }
    }, [isNew, monthsData, financialMonth]);

    // Live compute statutory deductions whenever basic/allowances change
    useEffect(() => {
        const basic = Number(basicSalary) || 0;
        const allow = Number(allowances) || 0;
        if (basic > 0) {
            const result = calculateStatutoryDeductions(basic, allow);
            setComputedPreview(result);
        } else {
            setComputedPreview(null);
        }
    }, [basicSalary, allowances]);

    const handleCreateRun = async () => {
        if (!title) return toast.error("Please enter a payroll title.");
        if (!payrollDate) return toast.error("Please enter a payroll date.");

        try {
            setIsSavingRun(true);
            const created = await createPayrollRun(
                {
                    title,
                    payroll_date: payrollDate,
                    financial_month: financialMonth || undefined,
                    division: division || undefined,
                    payment_account: paymentAccount || undefined,
                    notes: notes || undefined,
                },
                headers
            );
            toast.success(`Payroll run ${created.code} initiated!`);
            queryClient.invalidateQueries({ queryKey: ["payrollruns"] });
            router.push(`/${rolePrefix}/payroll/${created.reference}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to create payroll run.");
        } finally {
            setIsSavingRun(false);
        }
    };

    const handleAddItem = async () => {
        if (!selectedEmployee) return toast.error("Please select an employee.");
        if (!basicSalary || Number(basicSalary) <= 0) return toast.error("Please enter a valid basic salary.");

        try {
            setIsAddingItem(true);
            await createPayrollItem(
                {
                    payroll_run: runReference!,
                    employee: selectedEmployee,
                    basic_salary: Number(basicSalary),
                    allowances: Number(allowances) || 0,
                    other_allowances: Number(allowances) || 0,
                },
                headers
            );
            toast.success("Staff payroll item calculated & added!");
            setSelectedEmployee("");
            setBasicSalary("");
            setAllowances("0");
            refetchItems();
            refetchRun();
            queryClient.invalidateQueries({ queryKey: ["payrollruns"] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to add employee payroll item.");
        } finally {
            setIsAddingItem(false);
        }
    };

    const handleDeleteItem = async (itemRef: string) => {
        try {
            setDeletingItemId(itemRef);
            await deletePayrollItem(itemRef, headers);
            toast.success("Payroll item removed.");
            refetchItems();
            refetchRun();
            queryClient.invalidateQueries({ queryKey: ["payrollruns"] });
        } catch (err: any) {
            toast.error("Failed to delete payroll item.");
        } finally {
            setDeletingItemId(null);
        }
    };

    const handlePostToGL = async () => {
        if (!runReference || isNew) return;
        try {
            setIsPostingGL(true);
            const res = await postPayrollRunToGL(runReference, headers);
            toast.success(res.message || "Payroll run posted to General Ledger!");
            refetchRun();
            queryClient.invalidateQueries({ queryKey: ["payrollruns"] });
            queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
            queryClient.invalidateQueries({ queryKey: ["pnl"] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to post payroll run to GL.");
        } finally {
            setIsPostingGL(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const items = itemsData?.results || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${rolePrefix}/payroll`}
                        className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-corporate-primary/10 text-corporate-primary border border-corporate-primary/20">
                                Payroll Studio
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs font-mono font-bold text-foreground">
                                {isNew ? "New Payroll Batch" : runData?.code}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                            {isNew ? "Initiate Payroll Run" : runData?.title}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {!isNew && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" /> Print Master Payslip
                        </button>
                    )}

                    {!isNew && !runData?.is_posted && items.length > 0 && (
                        <button
                            onClick={handlePostToGL}
                            disabled={isPostingGL}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isPostingGL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                            <span>Post Payroll to GL</span>
                        </button>
                    )}

                    {isNew && (
                        <button
                            onClick={handleCreateRun}
                            disabled={isSavingRun}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSavingRun ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>Initialize Payroll</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Run Parameters Card (If New or viewing) */}
            {isNew ? (
                <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6 space-y-4 max-w-2xl">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-corporate-primary" /> Payroll Period & Disbursing Bank
                    </h2>

                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Payroll Title <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. September 2026 Executive & Staff Payroll"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Payroll Date <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="date"
                                value={payrollDate}
                                onChange={(e) => setPayrollDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Financial Month
                            </label>
                            <select
                                value={financialMonth}
                                onChange={(e) => setFinancialMonth(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            >
                                <option value="">Select Month</option>
                                {monthsData?.map((m: any) => (
                                    <option key={m.reference} value={m.reference}>
                                        {m.title} {m.is_active ? "(Active)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Disbursing Account
                            </label>
                            <select
                                value={paymentAccount}
                                onChange={(e) => setPaymentAccount(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            >
                                <option value="">Select Bank / M-Pesa Account</option>
                                {paymentAccountsData?.map((pa: any) => (
                                    <option key={pa.reference} value={pa.reference}>
                                        {pa.name} ({pa.account_type || "Bank"})
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
                                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                            >
                                <option value="">Headquarters / General</option>
                                {divisionsData?.map((d: any) => (
                                    <option key={d.reference} value={d.reference}>
                                        {d.name} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Executive Statutory Metrics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                                Gross Salaries
                            </p>
                            <p className="text-base font-bold font-mono mt-1 text-foreground">
                                {formatCurrency(runData?.total_gross || 0, "KES")}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-sm">
                            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                                PAYE Tax (KRA)
                            </p>
                            <p className="text-base font-bold font-mono mt-1 text-blue-600 dark:text-blue-400">
                                {formatCurrency(runData?.total_paye || 0, "KES")}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 shadow-sm">
                            <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">
                                NSSF (Tier 1 & 2)
                            </p>
                            <p className="text-base font-bold font-mono mt-1 text-purple-600 dark:text-purple-400">
                                {formatCurrency(runData?.total_nssf || 0, "KES")}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/20 shadow-sm">
                            <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase">
                                SHIF (2.75%)
                            </p>
                            <p className="text-base font-bold font-mono mt-1 text-teal-600 dark:text-teal-400">
                                {formatCurrency(runData?.total_shif || 0, "KES")}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm">
                            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                                Housing Levy (1.5%)
                            </p>
                            <p className="text-base font-bold font-mono mt-1 text-amber-600 dark:text-amber-400">
                                {formatCurrency(runData?.total_housing_levy || 0, "KES")}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-corporate-primary/10 border border-corporate-primary/20 shadow-sm">
                            <p className="text-[10px] font-semibold text-corporate-primary uppercase">
                                Total Net Pay
                            </p>
                            <p className="text-base font-bold font-mono mt-1 text-corporate-primary">
                                {formatCurrency(runData?.total_net_pay || 0, "KES")}
                            </p>
                        </div>
                    </div>

                    {/* Double-Entry GL Ledger Mapping Card */}
                    <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-4 print:hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-corporate-primary" /> Automated GL Journal Entry Blueprint
                            </h3>
                            {runData?.is_posted && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                                    Posted to GL ({runData.journal || "Journal Ledger"})
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                <span className="font-sans font-bold text-emerald-600 block text-[9px] uppercase">
                                    DR 6010 Salaries Expense
                                </span>
                                {formatCurrency(runData?.total_gross || 0, "KES")}
                            </div>
                            <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <span className="font-sans font-bold text-blue-600 block text-[9px] uppercase">
                                    CR 2040 PAYE Payable
                                </span>
                                {formatCurrency(runData?.total_paye || 0, "KES")}
                            </div>
                            <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                <span className="font-sans font-bold text-purple-600 block text-[9px] uppercase">
                                    CR 2050 Statutory Payable
                                </span>
                                {formatCurrency(
                                    (runData?.total_nssf || 0) +
                                        (runData?.total_shif || 0) +
                                        (runData?.total_housing_levy || 0),
                                    "KES"
                                )}
                            </div>
                            <div className="p-2 rounded-lg bg-corporate-primary/5 border border-corporate-primary/20">
                                <span className="font-sans font-bold text-corporate-primary block text-[9px] uppercase">
                                    CR 1010 Bank / Net Salaries
                                </span>
                                {formatCurrency(runData?.total_net_pay || 0, "KES")}
                            </div>
                        </div>
                    </div>

                    {/* Add Employee Item Bar (If not locked) */}
                    {!runData?.is_posted && (
                        <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-4 space-y-3 print:hidden">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-corporate-primary" /> Compute & Add Employee To Batch
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Select Employee
                                    </label>
                                    <select
                                        value={selectedEmployee}
                                        onChange={(e) => setSelectedEmployee(e.target.value)}
                                        className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    >
                                        <option value="">Choose Employee</option>
                                        {employeesData?.map((emp: any) => (
                                            <option key={emp.reference || emp.id} value={emp.reference || emp.id}>
                                                {emp.first_name} {emp.last_name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Basic Salary (KES)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 80000"
                                        value={basicSalary}
                                        onChange={(e) => setBasicSalary(e.target.value)}
                                        className="w-full px-3 py-2 font-mono font-bold bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-muted-foreground mb-1">
                                        Allowances (KES)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={allowances}
                                        onChange={(e) => setAllowances(e.target.value)}
                                        className="w-full px-3 py-2 font-mono font-bold bg-muted/40 border border-border rounded-xl focus:ring-1 focus:ring-corporate-primary"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddItem}
                                        disabled={isAddingItem}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold rounded-xl bg-corporate-primary text-white hover:bg-corporate-primary/90 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isAddingItem ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        <span>Add to Payroll</span>
                                    </button>
                                </div>
                            </div>

                            {/* Real-time Computed Preview Pill */}
                            {computedPreview && (
                                <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-emerald-500" />
                                        <span className="font-semibold text-foreground">Calculated Breakdown:</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                                        <span>Gross: <strong>{formatNumber(computedPreview.gross)}</strong></span>
                                        <span className="text-muted-foreground">•</span>
                                        <span>NSSF: <strong>{formatNumber(computedPreview.nssf)}</strong></span>
                                        <span className="text-muted-foreground">•</span>
                                        <span>PAYE: <strong>{formatNumber(computedPreview.paye)}</strong></span>
                                        <span className="text-muted-foreground">•</span>
                                        <span>SHIF: <strong>{formatNumber(computedPreview.shif)}</strong></span>
                                        <span className="text-muted-foreground">•</span>
                                        <span>Housing: <strong>{formatNumber(computedPreview.housingLevy)}</strong></span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-corporate-primary font-bold">
                                            Net Pay: {formatNumber(computedPreview.net)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Master Payroll Itemization Table */}
                    <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Master Employee Remuneration Ledger ({items.length} Staff)
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                    <tr>
                                        <th className="py-2.5 px-3">Employee</th>
                                        <th className="py-2.5 px-3 text-right">Basic</th>
                                        <th className="py-2.5 px-3 text-right">Allowances</th>
                                        <th className="py-2.5 px-3 text-right">Gross Pay</th>
                                        <th className="py-2.5 px-3 text-right">NSSF</th>
                                        <th className="py-2.5 px-3 text-right">PAYE</th>
                                        <th className="py-2.5 px-3 text-right">SHIF</th>
                                        <th className="py-2.5 px-3 text-right">Housing</th>
                                        <th className="py-2.5 px-3 text-right">Total Ded.</th>
                                        <th className="py-2.5 px-3 text-right">Net Pay</th>
                                        {!runData?.is_posted && <th className="py-2.5 px-3 text-center">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={runData?.is_posted ? 10 : 11}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No employees added to this payroll batch yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item: PayrollItem) => (
                                            <tr key={item.reference || item.id} className="hover:bg-muted/30">
                                                <td className="py-2.5 px-3 whitespace-nowrap">
                                                    <p className="font-bold text-foreground">
                                                        {item.employee_name || "Staff Member"}
                                                    </p>
                                                    {item.employee_email && (
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {item.employee_email}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono">
                                                    {formatNumber(item.basic_salary)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono">
                                                    {(item.allowances || item.other_allowances || 0) > 0
                                                        ? formatNumber(item.allowances || item.other_allowances || 0)
                                                        : "-"}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                                                    {formatNumber(item.gross_pay || item.gross_salary || 0)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                                                    {formatNumber(item.nssf_deduction)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                                                    {formatNumber(item.paye_deduction || item.paye_tax || 0)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-teal-600 dark:text-teal-400">
                                                    {formatNumber(item.shif_deduction)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                                                    {formatNumber(item.housing_levy_deduction || item.housing_levy || 0)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                                                    {formatNumber(item.total_deductions)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-extrabold text-corporate-primary whitespace-nowrap">
                                                    {formatCurrency(item.net_pay || item.net_salary || 0, "KES")}
                                                </td>
                                                {!runData?.is_posted && (
                                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleDeleteItem(item.reference)}
                                                            disabled={deletingItemId === item.reference}
                                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                            title="Remove from batch"
                                                        >
                                                            {deletingItemId === item.reference ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
