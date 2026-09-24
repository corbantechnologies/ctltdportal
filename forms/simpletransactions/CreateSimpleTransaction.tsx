/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Zap, X, ArrowDownLeft, ArrowUpRight, FileUp, Maximize2, Minimize2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatBackendError } from "@/lib/error-handler";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import SearchableSelect from "@/components/portal/SearchableSelect";
import { useFetchPaymentMethods } from "@/hooks/paymentmethods/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { apiActions } from "@/tools/axios";

interface CreateSimpleTransactionProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function CreateSimpleTransaction({
  onSuccess,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
}: CreateSimpleTransactionProps) {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: books, isLoading: loadingBooks } = useFetchBooks();
  const { data: divisions, isLoading: loadingDivisions } = useFetchDivisions();
  const { data: journalTypes, isLoading: loadingJournalTypes } = useFetchJournalTypes();
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useFetchPaymentMethods();
  const { data: partners } = useFetchPartners();

  const formik = useFormik({
    initialValues: {
      name: "",
      transaction_type: "MONEY_OUT" as "MONEY_IN" | "MONEY_OUT",
      ledger_book: "",
      payment_method: "",
      division: "",
      journal_type: "",
      partner: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      source_document: "",
      document_number: "",
      document_file: null as File | null,
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Always use FormData so we can optionally include a file
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("transaction_type", values.transaction_type);
        formData.append("ledger_book", values.ledger_book);
        formData.append("payment_method", values.payment_method);
        formData.append("division", values.division);
        formData.append("journal_type", values.journal_type);
        formData.append("amount", values.amount);
        formData.append("date", values.date);
        if (values.partner) formData.append("partner", values.partner);
        if (values.source_document) formData.append("source_document", values.source_document);
        if (values.document_number) formData.append("document_number", values.document_number);
        if (values.document_file) formData.append("document_file", values.document_file);

        await apiActions.post(`/api/v1/simpletransactions/`, formData, {
          headers: {
            Authorization: header.headers.Authorization,
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Transaction logged! Journal auto-generated.");
        queryClient.invalidateQueries({ queryKey: ["simpletransactions"] });
        resetForm();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(formatBackendError(error, "Failed to log transaction"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isMoneyIn = formik.values.transaction_type === "MONEY_IN";

  const bookOptions = books?.map((b) => ({
    value: b.name,
    label: b.code ? `[${b.code}] ${b.name}` : b.name,
    secondaryLabel: b.account_type,
  })) || [];
  const divisionOptions = divisions?.map((d) => ({ value: d.name, label: d.name })) || [];
  const journalTypeOptions = journalTypes?.map((j) => ({ value: j.name, label: j.name, secondaryLabel: j.code })) || [];
  const paymentMethodOptions = paymentMethods?.map((p) => ({ value: p.name, label: p.name })) || [];
  const partnerOptions = partners?.map((p) => ({ value: p.name, label: p.name })) || [];

  const isLoading = loadingBooks || loadingDivisions || loadingJournalTypes || loadingPaymentMethods;

  return (
    <div
      className={cn(
        "bg-white flex flex-col transition-all duration-200",
        isFullscreen
          ? "w-full h-full max-h-none rounded-none border-none shadow-none"
          : "mx-auto w-full border border-slate-200 shadow-2xl rounded-xl overflow-hidden max-h-[90vh]"
      )}
    >
      {/* Header */}
      <div className="px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md bg-slate-900 flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Log Transaction</h2>
              <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider mt-0.5">
                Journal entry auto-generated on save
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg p-1.5 transition-all active:scale-95"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 p-1.5 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable form body */}
      <div className={cn("flex-1 overflow-y-auto p-4 sm:p-5", isFullscreen && "sm:p-8 max-w-4xl mx-auto w-full")}>
        <form id="simple-tx-form" onSubmit={formik.handleSubmit} className="space-y-4">

          {/* Transaction Type Toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => formik.setFieldValue("transaction_type", "MONEY_OUT")}
                className={cn(
                  "flex items-center justify-center gap-1.5 h-9 rounded-lg border font-semibold text-xs transition-all",
                  !isMoneyIn
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-500"
                )}
              >
                <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                Money Out
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue("transaction_type", "MONEY_IN")}
                className={cn(
                  "flex items-center justify-center gap-1.5 h-9 rounded-lg border font-semibold text-xs transition-all",
                  isMoneyIn
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-500"
                )}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 flex-shrink-0" />
                Money In
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Bought water, Office supplies..."
              className="border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-1 focus:ring-slate-900 w-full h-9 rounded-lg focus:bg-white focus:border-slate-400 transition-all font-medium px-3 text-xs sm:text-sm"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                Amount (KES) <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-1 focus:ring-slate-900 w-full h-9 rounded-lg focus:bg-white focus:border-slate-400 transition-all font-bold px-3 text-xs sm:text-sm font-mono"
                onChange={formik.handleChange}
                value={formik.values.amount}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                name="date"
                type="date"
                required
                className="border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-1 focus:ring-slate-900 w-full h-9 rounded-lg focus:bg-white focus:border-slate-400 transition-all font-medium px-3 text-xs sm:text-sm"
                onChange={formik.handleChange}
                value={formik.values.date}
              />
            </div>
          </div>

          {/* Ledger Book + Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SearchableSelect
              label={isMoneyIn ? "Credit Book (Destination)" : "Debit Book (What is bought/paid)"}
              options={bookOptions}
              value={formik.values.ledger_book}
              onChange={(val) => formik.setFieldValue("ledger_book", val)}
              placeholder="Select Ledger Book..."
              required
              disabled={loadingBooks}
            />
            <SearchableSelect
              label={isMoneyIn ? "Debit Account (Receiving)" : "Credit Account (Paying)"}
              options={paymentMethodOptions}
              value={formik.values.payment_method}
              onChange={(val) => formik.setFieldValue("payment_method", val)}
              placeholder="Select Payment Method..."
              required
              disabled={loadingPaymentMethods}
            />
          </div>

          {/* Division + Journal Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SearchableSelect
              label="Division"
              options={divisionOptions}
              value={formik.values.division}
              onChange={(val) => formik.setFieldValue("division", val)}
              placeholder="Select Division..."
              required
              disabled={loadingDivisions}
            />
            <SearchableSelect
              label="Journal Type"
              options={journalTypeOptions}
              value={formik.values.journal_type}
              onChange={(val) => formik.setFieldValue("journal_type", val)}
              placeholder="Select Journal Type..."
              required
              disabled={loadingJournalTypes}
            />
          </div>

          {/* Partner (optional) */}
          <SearchableSelect
            label="Partner / Vendor (Optional)"
            options={partnerOptions}
            value={formik.values.partner}
            onChange={(val) => formik.setFieldValue("partner", val)}
            placeholder="Select Partner..."
            disabled={false}
          />

          {/* Documentation */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Documentation (Optional)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Source Document
                </label>
                <input
                  name="source_document"
                  type="text"
                  placeholder="Invoice, Receipt, Tax Receipt, etc."
                  className="border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-1 focus:ring-slate-900 w-full h-9 rounded-lg focus:bg-white focus:border-slate-400 transition-all font-medium px-3 text-xs sm:text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.source_document}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Document Number
                </label>
                <input
                  name="document_number"
                  type="text"
                  placeholder="INV-001, RCT-2024, etc."
                  className="border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-1 focus:ring-slate-900 w-full h-9 rounded-lg focus:bg-white focus:border-slate-400 transition-all font-medium px-3 text-xs sm:text-sm font-mono"
                  onChange={formik.handleChange}
                  value={formik.values.document_number}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                Attach Proof (Receipt / Invoice image)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="simple-tx-file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    formik.setFieldValue("document_file", e.currentTarget.files?.[0] ?? null)
                  }
                />
                <label
                  htmlFor="simple-tx-file"
                  className={cn(
                    "flex h-9 sm:h-10 border border-dashed rounded-lg items-center px-3 gap-2.5 cursor-pointer transition-all group",
                    formik.values.document_file
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400 hover:bg-slate-100"
                  )}
                >
                  <FileUp className={cn("w-3.5 h-3.5 flex-shrink-0", formik.values.document_file ? "text-emerald-600" : "")} />
                  <span className="text-[10px] sm:text-xs font-semibold truncate">
                    {formik.values.document_file
                      ? formik.values.document_file.name
                      : "Tap to upload receipt or invoice"}
                  </span>
                  {formik.values.document_file && (
                    <button
                      type="button"
                      className="ml-auto flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        formik.setFieldValue("document_file", null);
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </label>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Sticky Submit Button */}
      <div className="px-5 py-3 sm:py-3.5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <button
          type="submit"
          form="simple-tx-form"
          disabled={formik.isSubmitting || isLoading}
          className={cn(
            "w-full h-9 sm:h-10 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60",
            isMoneyIn
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
          )}
        >
          {formik.isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>LOG TRANSACTION &amp; POST JOURNAL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
