/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchInvoices, useCreateReceipt } from "@/hooks/financials/actions";
import { getPaymentMethods } from "@/services/paymentmethods";
import {
  Receipt as ReceiptIcon,
  ChevronLeft,
  Search,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Wallet,
  Check,
  Layers,
  Zap,
} from "lucide-react";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { cn } from "@/lib/utils";

interface ReceiptStudioProps {
  rolePrefix: "finance" | "director" | "operations";
}

function ReceiptStudioContent({ rolePrefix }: ReceiptStudioProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  const urlInvoice = searchParams.get("invoice") || "";
  const urlAmount = searchParams.get("amount") || "";

  // Queries
  const { data: invoices, isLoading: isLoadingInvoices } = useFetchInvoices();
  const { data: paymentMethods = [], isLoading: isLoadingMethods } = useQuery({
    queryKey: ["paymentmethods"],
    queryFn: () => getPaymentMethods(header),
    enabled: !!header.headers.Authorization,
  });

  // Form State
  const [selectedInvoiceRef, setSelectedInvoiceRef] = useState<string>(urlInvoice);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [amount, setAmount] = useState<number>(urlAmount ? parseFloat(urlAmount) : 0);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedPaymentMethodRef, setSelectedPaymentMethodRef] = useState<string>("");
  const [kraReceipt, setKraReceipt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default payment method when loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethodRef) {
      setSelectedPaymentMethodRef(paymentMethods[0].reference);
    }
  }, [paymentMethods, selectedPaymentMethodRef]);

  // Find selected invoice object
  const selectedInvoice = useMemo(() => {
    if (!invoices || !selectedInvoiceRef) return null;
    return invoices.find((inv: any) => inv.reference === selectedInvoiceRef) || null;
  }, [invoices, selectedInvoiceRef]);

  // Calculate invoice balances
  const invoiceTotal = useMemo(() => {
    if (!selectedInvoice) return 0;
    if (typeof (selectedInvoice as any).total_amount === "number") return (selectedInvoice as any).total_amount;
    const items = (selectedInvoice as any).items || (selectedInvoice as any).lines;
    if (items && Array.isArray(items)) {
      return items.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || (parseFloat(item.quantity) * parseFloat(item.unit_price)) || 0), 0);
    }
    return parseFloat((selectedInvoice as any).total_amount || "0");
  }, [selectedInvoice]);

  const invoiceAmountPaid = useMemo(() => {
    if (!selectedInvoice || !(selectedInvoice as any).receipts) return 0;
    return (selectedInvoice as any).receipts.reduce((sum: number, r: any) => sum + parseFloat(r.amount || "0"), 0);
  }, [selectedInvoice]);

  const invoiceBalanceDue = useMemo(() => {
    return Math.max(0, invoiceTotal - invoiceAmountPaid);
  }, [invoiceTotal, invoiceAmountPaid]);

  // If invoice changes and no initial amount was forced, set amount to balance due
  const handleSelectInvoice = (inv: any) => {
    setSelectedInvoiceRef(inv.reference);
    const items = inv.items || inv.lines;
    const total = typeof inv.total_amount === "number" ? inv.total_amount : (items?.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || (parseFloat(item.quantity) * parseFloat(item.unit_price)) || 0), 0) || 0);
    const paid = inv.receipts?.reduce((sum: number, r: any) => sum + parseFloat(r.amount || "0"), 0) || 0;
    const due = Math.max(0, total - paid);
    setAmount(due > 0 ? due : total);
  };

  // Filter invoices for selection list
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((inv: any) => {
      const q = invoiceSearchQuery.toLowerCase();
      const codeMatch = inv.code?.toLowerCase().includes(q);
      const partnerMatch = (inv.partner_name || inv.partner || inv.client_name || "").toLowerCase().includes(q);
      return codeMatch || partnerMatch;
    });
  }, [invoices, invoiceSearchQuery]);

  const createReceiptMutation = useCreateReceipt(rolePrefix);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvoiceRef) {
      toast.error("Please select a target invoice for this receipt");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid receipt settlement amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        invoice: selectedInvoiceRef,
        date,
        amount,
        payment_method: selectedPaymentMethodRef || undefined,
        kra_sales_receipt: kraReceipt || undefined,
        notes: notes || `Payment receipt for ${selectedInvoice?.code || "Invoice"}`,
      };

      createReceiptMutation.mutate(payload, {
        onError: (err: any) => {
          setIsSubmitting(false);
          const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to record receipt";
          toast.error(msg);
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error("An unexpected error occurred while processing receipt");
    }
  };

  const selectedPaymentMethodObj = useMemo(() => {
    return paymentMethods.find((pm: any) => pm.reference === selectedPaymentMethodRef);
  }, [paymentMethods, selectedPaymentMethodRef]);

  const balanceRemainingAfterPayment = Math.max(0, invoiceBalanceDue - (amount || 0));

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => router.push(`/${rolePrefix}/receipts`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-wider mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Receipts Ledger
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <ReceiptIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Payment Receipt <span className="text-emerald-600">Studio</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Record official customer payment inflow &bull; Automated General Ledger Double-Entry Posting
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automated GL Posting Active</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Target Invoice Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Target Invoice &amp; Customer
                  </h3>
                  <p className="text-xs text-slate-400">Select the customer credit invoice to allocate payment against</p>
                </div>
              </div>
            </div>

            {/* Selected Invoice Banner */}
            {selectedInvoice ? (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-900 text-sm">{selectedInvoice.code}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedInvoice.partner_name || selectedInvoice.partner || selectedInvoice.client_name || "Direct Customer"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Billed: <strong className="text-slate-800">KES {invoiceTotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</strong> &bull; Paid: <strong className="text-emerald-700">KES {invoiceAmountPaid.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Outstanding Balance Due
                  </span>
                  <span className="text-lg font-mono font-extrabold text-emerald-800">
                    KES {invoiceBalanceDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceRef("")}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 underline block"
                  >
                    Change Invoice
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search invoices by code, customer name..."
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                  {isLoadingInvoices ? (
                    <div className="p-6 text-center text-xs text-slate-400">Loading open invoices...</div>
                  ) : filteredInvoices.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No invoices match your search.</div>
                  ) : (
                    filteredInvoices.map((inv: any) => {
                      const total = typeof inv.total_amount === "number" ? inv.total_amount : (inv.items?.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || (parseFloat(item.quantity) * parseFloat(item.unit_price)) || 0), 0) || 0);
                      const paid = inv.receipts?.reduce((sum: number, r: any) => sum + parseFloat(r.amount || "0"), 0) || 0;
                      const due = Math.max(0, total - paid);

                      return (
                        <div
                          key={inv.reference}
                          onClick={() => handleSelectInvoice(inv)}
                          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{inv.code}</span>
                              <span className="text-[10px] text-slate-400">({new Date(inv.date).toLocaleDateString("en-GB")})</span>
                            </div>
                            <p className="text-slate-600 font-medium">
                              {inv.partner_name || inv.partner || inv.client_name || "Direct Customer"}
                            </p>
                          </div>

                          <div className="text-right space-y-0.5">
                            <span className="font-mono font-bold text-emerald-700 block">
                              KES {due.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {due === 0 ? "PAID" : "Balance Due"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Settlement Valuation & Payment Account */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Settlement Valuation &amp; Channel
                  </h3>
                  <p className="text-xs text-slate-400">Specify cleared funds and deposit destination</p>
                </div>
              </div>
            </div>

            {/* Inflow Valuation Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Settlement Amount (KES) *
                </label>
                {selectedInvoice && invoiceBalanceDue > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAmount(invoiceBalanceDue)}
                      className="text-[10px] font-bold uppercase px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded transition-colors"
                    >
                      100% Full Balance (KES {invoiceBalanceDue.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount(invoiceBalanceDue / 2)}
                      className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      50% Deposit
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-slate-400 font-mono">
                  KES
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl pl-16 pr-4 py-3.5 text-2xl font-mono font-extrabold text-slate-900 transition-all outline-none"
                />
              </div>
            </div>

            {/* Date & Payment Method Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Receipt Clearance Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Deposit Channel / Bank Account *
                </label>
                <select
                  value={selectedPaymentMethodRef}
                  onChange={(e) => setSelectedPaymentMethodRef(e.target.value)}
                  disabled={isLoadingMethods}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Default Liquid Bank (COA 1010)</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.reference} value={pm.reference}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KRA eTIMS & Internal Notes */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  KRA eTIMS / Fiscal Receipt Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KRA-ETIMS-2026-RC-0928"
                  value={kraReceipt}
                  onChange={(e) => setKraReceipt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-mono placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Cashier Notes &amp; Bank Transaction Memo
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bank EFT reference #TXN9928341 deposited into KCB Commercial Account"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-3 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Voucher & Submit (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          {/* Live Document & Ledger Preview */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                <Sparkles className="w-4 h-4" />
                Live Journal Voucher Preview
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                GL AUTO-POST
              </span>
            </div>

            {/* Inflow Highlight */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Receipt Valuation
              </span>
              <p className="text-3xl font-mono font-extrabold text-emerald-400">
                KES {(amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400">
                Payer: <strong className="text-slate-200">{selectedInvoice?.partner_name || selectedInvoice?.partner || "Direct Client"}</strong>
              </p>
            </div>

            {/* Double-Entry Legs */}
            <div className="space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                Accounting Journal Breakdown
              </span>

              {/* Debit Leg */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-emerald-400 text-xs block">DEBIT (DR)</span>
                  <span className="text-[11px] text-slate-300">
                    {selectedPaymentMethodObj?.name || "Liquid Bank / M-Pesa (COA 1010)"}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-300">
                  + KES {(amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Credit Leg */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-amber-400 text-xs block">CREDIT (CR)</span>
                  <span className="text-[11px] text-slate-300">
                    Accounts Receivable (COA 1030)
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-200">
                  - KES {(amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Balance Remaining After Allocation */}
            {selectedInvoice && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Current Outstanding:</span>
                  <span className="font-mono text-slate-200">
                    KES {invoiceBalanceDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>New Balance After Receipt:</span>
                  <span className="font-mono">
                    KES {balanceRemainingAfterPayment.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {balanceRemainingAfterPayment === 0 && amount > 0 && (
                  <div className="pt-1 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Invoice will transition to 100% PAID
                  </div>
                )}
              </div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting || !amount || amount <= 0 || !selectedInvoiceRef}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Recording &amp; Posting to Ledger...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm &amp; Issue Official Receipt
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ReceiptStudio({ rolePrefix }: ReceiptStudioProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReceiptStudioContent rolePrefix={rolePrefix} />
    </Suspense>
  );
}
