/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchPaymentMethods } from "@/hooks/paymentmethods/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { createSimpleTransaction } from "@/services/simpletransactions";
import {
  Wallet,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  ChevronLeft,
  CheckCircle2,
  Plus,
  RefreshCw,
  UploadCloud,
  Layers,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseStudioProps {
  rolePrefix: "finance" | "director" | "operations";
}

export default function ExpenseStudio({ rolePrefix }: ExpenseStudioProps) {
  const router = useRouter();
  const headers = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: books } = useFetchBooks();
  const { data: paymentMethods } = useFetchPaymentMethods();
  const { data: divisions } = useFetchDivisions();
  const { data: journalTypes } = useFetchJournalTypes();
  const { data: partners } = useFetchPartners();

  // Filter books to expense categories or all books
  const expenseBooks = books?.filter(
    (b: any) =>
      b.account_type?.toLowerCase().includes("expense") ||
      b.code?.startsWith("6") ||
      b.code?.startsWith("5")
  ) || books || [];

  // Form State
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedJournalType, setSelectedJournalType] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [sourceDocument, setSourceDocument] = useState("Receipt / Vendor Bill");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<any>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const currentBookObj = books?.find((b: any) => b.code === selectedBook || b.reference === selectedBook);
  const currentPaymentMethodObj = paymentMethods?.find((pm: any) => pm.reference === selectedPaymentMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseName.trim()) {
      toast.error("Please enter an expense description.");
      return;
    }

    if (parsedAmount <= 0) {
      toast.error("Expense amount must be greater than KES 0.00");
      return;
    }

    if (!selectedBook) {
      toast.error("Please select an Expense Account from the Chart of Accounts.");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a Payment Method (Bank/Cash).");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find fallback division & journal type if unselected
      const defaultDiv = selectedDivision || divisions?.[0]?.reference || "";
      const defaultJt =
        selectedJournalType ||
        journalTypes?.find((jt: any) => jt.name?.toLowerCase().includes("expense"))?.reference ||
        journalTypes?.[0]?.reference ||
        "";

      const formData = new FormData();
      formData.append("name", expenseName.trim());
      formData.append("transaction_type", "MONEY_OUT");
      formData.append("amount", parsedAmount.toFixed(2));
      formData.append("date", date);
      formData.append("ledger_book", selectedBook);
      formData.append("payment_method", selectedPaymentMethod);
      if (defaultDiv) formData.append("division", defaultDiv);
      if (defaultJt) formData.append("journal_type", defaultJt);
      if (selectedPartner) formData.append("partner", selectedPartner);
      if (documentNumber.trim()) formData.append("document_number", documentNumber.trim());
      if (sourceDocument.trim()) formData.append("source_document", sourceDocument.trim());
      if (documentFile) formData.append("document_file", documentFile);

      const created = await createSimpleTransaction(formData, headers);

      queryClient.invalidateQueries({ queryKey: ["simple-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });

      toast.success("Expense logged & double-entry journal posted to GL!");
      setCompletedTx(created);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to log expense.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => router.push(`/${rolePrefix}/expenses`)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Expense Ledger
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
              <ArrowDownRight className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Record Expense &amp; Outflow
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Log operational expenses, vendor disbursements, and cloud/hosting costs with automatic GL double-entry posting
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>Double-Entry Expense Voucher</span>
        </div>
      </div>

      {completedTx ? (
        /* Success State */
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Expense Logged &amp; Posted to GL!
            </h2>
            <p className="text-sm text-slate-500">
              Voucher reference <span className="font-mono font-bold text-slate-900">{completedTx.code}</span> for KES {parsedAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })} has been debited to expense account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-500">Expense Account:</span>
            <span className="font-mono font-bold text-slate-900">
              {currentBookObj?.name || "Operating Expense"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => router.push(`/${rolePrefix}/expenses`)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Expense Ledger
            </button>
            <button
              onClick={() => {
                setCompletedTx(null);
                setExpenseName("");
                setAmount("");
                setPayeeName("");
                setDocumentNumber("");
                setDocumentFile(null);
              }}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Another Expense
            </button>
          </div>
        </div>
      ) : (
        /* Studio Form Layout */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Expense Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Receipt className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Expense Details &amp; Purpose
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Expense Title / Memo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Hosting, Office Rent, Internet Subscription"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm font-semibold transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Amount (KES) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-base font-mono font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Expense Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* General Ledger Categorization */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Layers className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Chart of Accounts &amp; Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Debit Account (Expense Head) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  >
                    <option value="">Select Expense Account...</option>
                    {expenseBooks.map((b: any) => (
                      <option key={b.reference} value={b.code || b.reference}>
                        {b.code} - {b.name} ({b.account_type || "Expense"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Credit Account (Disbursement Source) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  >
                    <option value="">Select Payment Method / Account...</option>
                    {paymentMethods?.map((pm: any) => (
                      <option key={pm.reference} value={pm.reference}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Operational Division
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  >
                    {divisions?.map((div: any) => (
                      <option key={div.reference} value={div.reference}>
                        {div.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Payee / Vendor (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Safaricom PLC, Landlord, Amazon Web Services"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Vendor Document & Receipt Upload */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <FileText className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Supporting Document &amp; Vendor Invoice
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Bill / Voucher Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-99881, REC-4412"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Receipt / Document Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Double-Entry Ledger Preview */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-slate-900 text-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    GL Double-Entry Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Automated Entry
                </span>
              </div>

              {/* Journal Lines Breakdown */}
              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="flex justify-between items-center text-rose-400 font-bold uppercase text-[10px]">
                    <span>DEBIT (Expense Increase)</span>
                    <span className="font-mono">DR</span>
                  </div>
                  <p className="font-semibold text-white truncate">
                    {currentBookObj ? `${currentBookObj.code} - ${currentBookObj.name}` : "Select Expense Account"}
                  </p>
                  <p className="font-mono font-bold text-sm text-white pt-1">
                    KES {parsedAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="flex justify-between items-center text-emerald-400 font-bold uppercase text-[10px]">
                    <span>CREDIT (Asset Decrease)</span>
                    <span className="font-mono">CR</span>
                  </div>
                  <p className="font-semibold text-white truncate">
                    {currentPaymentMethodObj ? currentPaymentMethodObj.name : "Select Payment Method"}
                  </p>
                  <p className="font-mono font-bold text-sm text-white pt-1">
                    KES {parsedAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Total Card */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Outflow:
                </span>
                <span className="text-2xl font-mono font-bold text-rose-400">
                  KES {parsedAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || parsedAmount <= 0}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing to Ledger...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Log Expense &amp; Post to GL
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
