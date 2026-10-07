/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Receipt,
  Plus,
  X,
  FileUp,
  CreditCard,
  Building2,
  Users
} from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { createJournalEntry as createService } from "@/services/journalentries";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useQueryClient } from "@tanstack/react-query";
import SearchableSelect from "@/components/portal/SearchableSelect";
import { cn } from "@/lib/utils";

export interface SingleJournalEntryProps {
  rolePrefix?: string;
  journalReference?: string;
  currentTotals?: { debit: number; credit: number; balance: number };
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  refetch: (options?: any) => Promise<any>;
}

export default function SingleJournalEntry({
  rolePrefix = "finance",
  journalReference,
  currentTotals,
  onSuccess,
  onClose,
  className,
  refetch,
}: SingleJournalEntryProps) {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();
  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const { data: books, isLoading: isLoadingBooks } = useFetchBooks();
  const { data: partners, isLoading: isLoadingPartners } = useFetchPartners();
  const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();

  const formik = useFormik({
    initialValues: {
      journal: journalReference || "",
      book: "",
      partner: "",
      division: "",
      debit: 0,
      credit: 0,
      currency: "KES",
      exchange_rate: "1",
      payment_method: "BANK_TRANSFER",
      source_document: "",
      document_number: "",
      document_file: null as File | null,
      notes: "",
      project: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (Number(values.debit) === 0 && Number(values.credit) === 0) {
        toast.error("Please enter either a Debit or Credit amount.");
        setSubmitting(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("journal", values.journal);
        formData.append("book", values.book);
        formData.append("partner", values.partner || "");
        formData.append("division", values.division);
        formData.append("debit", values.debit.toString());
        formData.append("credit", values.credit.toString());
        formData.append("currency", values.currency);
        formData.append("exchange_rate", values.exchange_rate);
        formData.append("payment_method", values.payment_method);
        formData.append("source_document", values.source_document);
        formData.append("document_number", values.document_number);
        formData.append("notes", values.notes);
        formData.append("project", values.project || "");
        if (values.document_file) {
          formData.append("document_file", values.document_file);
        }

        await createService(formData, header);
        toast.success("Single entry recorded successfully");
        queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
        queryClient.invalidateQueries({ queryKey: ["journals"] });
        refetch();
        resetForm();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to record entry.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const bookOptions = books?.map(b => ({ value: b.name, label: b.name, secondaryLabel: b.code })) || [];
  const partnerOptions = partners?.map(p => ({ value: p.name, label: p.name })) || [];
  const divisionOptions = divisions?.map(d => ({ value: d.name, label: d.name, secondaryLabel: d.code })) || [];

  return (
    <div className={cn("mx-auto w-full border border-slate-200 rounded overflow-hidden bg-white flex flex-col", className)}>
      {/* Modal Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Record Journal Line</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Batch: {journalReference}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentTotals && (
              <div className="hidden sm:flex items-center gap-3 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono">
                <span className="text-slate-500 font-sans text-[10px] uppercase font-semibold">Current DR:</span>
                <span className="font-semibold text-emerald-700">{currentTotals.debit.toLocaleString()}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-sans text-[10px] uppercase font-semibold">CR:</span>
                <span className="font-semibold text-indigo-700">{currentTotals.credit.toLocaleString()}</span>
                <span className="text-slate-300">|</span>
                <span className={cn("font-semibold", currentTotals.balance === 0 ? "text-slate-400" : "text-amber-700")}>
                  {currentTotals.balance === 0 ? "Balanced" : `Diff: ${Math.abs(currentTotals.balance).toLocaleString()}`}
                </span>
              </div>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(85vh-110px)]">
        <form id="single-entry-form" onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Classification Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Classification & Mapping</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <SearchableSelect
                label="Account Book"
                required
                options={bookOptions}
                value={formik.values.book}
                onChange={(val) => formik.setFieldValue("book", val)}
                placeholder="Select Ledger..."
                disabled={isLoadingBooks}
              />
              <SearchableSelect
                label="Division"
                required
                options={divisionOptions}
                value={formik.values.division}
                onChange={(val) => formik.setFieldValue("division", val)}
                placeholder="Select Division..."
                disabled={isLoadingDivisions}
              />
              <SearchableSelect
                label="Partner (Optional)"
                options={partnerOptions}
                value={formik.values.partner}
                onChange={(val) => formik.setFieldValue("partner", val)}
                placeholder="No Partner"
                disabled={isLoadingPartners}
              />
            </div>
          </div>

          {/* Financials Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Amounts & Recognition</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Currency</label>
                <select
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  className="w-full h-8 bg-white border border-slate-300 rounded px-2 text-xs font-medium focus:outline-none focus:border-slate-800 transition-colors"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ml-0.5">Debit (DR)</label>
                <input
                  type="number"
                  name="debit"
                  placeholder="0.00"
                  step="0.01"
                  value={formik.values.debit || ""}
                  onChange={(e) => {
                    formik.setFieldValue("debit", e.target.value);
                    if (Number(e.target.value) > 0) formik.setFieldValue("credit", 0);
                  }}
                  className="w-full h-8 bg-emerald-50/20 border border-emerald-300 rounded px-2.5 text-xs font-mono font-semibold text-emerald-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 transition-all placeholder:text-emerald-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 ml-0.5">Credit (CR)</label>
                <input
                  type="number"
                  name="credit"
                  placeholder="0.00"
                  step="0.01"
                  value={formik.values.credit || ""}
                  onChange={(e) => {
                    formik.setFieldValue("credit", e.target.value);
                    if (Number(e.target.value) > 0) formik.setFieldValue("debit", 0);
                  }}
                  className="w-full h-8 bg-indigo-50/20 border border-indigo-300 rounded px-2.5 text-xs font-mono font-semibold text-indigo-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all placeholder:text-indigo-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5 truncate">Rate</label>
                <input
                  type="number"
                  name="exchange_rate"
                  step="0.0001"
                  value={formik.values.exchange_rate}
                  onChange={formik.handleChange}
                  className="w-full h-8 bg-white border border-slate-300 rounded px-2 text-xs font-mono font-medium focus:outline-none focus:border-slate-800 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Documentation Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <FileUp className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidence & Notes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Evidence Type</label>
                <select
                  name="source_document"
                  value={formik.values.source_document}
                  onChange={formik.handleChange}
                  className="w-full h-8 bg-white border border-slate-300 rounded px-2 text-xs font-medium focus:outline-none focus:border-slate-800 transition-colors"
                >
                  <option value="">None / Other</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="RECEIPT">Receipt</option>
                  <option value="KRA_INVOICE">KRA Invoice</option>
                  <option value="MOBILE_MONEY">M-Pesa Statement</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Payment Method</label>
                <select
                  name="payment_method"
                  value={formik.values.payment_method}
                  onChange={formik.handleChange}
                  className="w-full h-8 bg-white border border-slate-300 rounded px-2 text-xs font-medium focus:outline-none focus:border-slate-800 transition-colors"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">M-Pesa / Mobile</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Doc # / Ref</label>
                <input
                  name="document_number"
                  placeholder="e.g. INV-2026-001"
                  value={formik.values.document_number}
                  onChange={formik.handleChange}
                  className="w-full h-8 bg-white border border-slate-300 rounded px-2.5 text-xs font-mono font-medium focus:outline-none focus:border-slate-800 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Supporting Document</label>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="single-file-upload"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 cursor-pointer transition-colors"
                >
                  <FileUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formik.values.document_file ? formik.values.document_file.name : "Choose File..."}</span>
                </label>
                {formik.values.document_file && (
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue("document_file", null)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <input
                  type="file"
                  id="single-file-upload"
                  className="hidden"
                  onChange={(e) => formik.setFieldValue("document_file", e.currentTarget.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Narrative Notes</label>
              <textarea
                name="notes"
                placeholder="Narrative summary for this entry..."
                rows={2}
                value={formik.values.notes}
                onChange={formik.handleChange}
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-medium focus:outline-none focus:border-slate-800 transition-colors resize-none"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          form="single-entry-form"
          disabled={formik.isSubmitting}
          className="h-8 px-4 bg-slate-900 hover:bg-black text-white rounded text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {formik.isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Record Entry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
