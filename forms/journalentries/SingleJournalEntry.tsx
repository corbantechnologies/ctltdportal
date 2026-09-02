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
    <div className={cn("mx-auto w-full border border-slate-200 shadow-2xl rounded overflow-hidden bg-white flex flex-col", className)}>
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center text-white shadow-lg flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">Record Single Transaction</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Batch: {journalReference}</p>
            </div>
          </div>

          {onClose && (
            <button type="button" onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded text-slate-300 transition-colors active:scale-95 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {currentTotals && (
          <div className="mt-3 flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-200 rounded shadow-sm w-full">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">DR</span>
              <span className="text-xs font-bold text-emerald-600">{currentTotals.debit.toLocaleString()}</span>
            </div>
            <div className="w-px h-6 bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">CR</span>
              <span className="text-xs font-bold text-indigo-600">{currentTotals.credit.toLocaleString()}</span>
            </div>
            <div className="w-px h-6 bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Diff</span>
              <span className={cn("text-xs font-bold", currentTotals.balance === 0 ? "text-slate-400" : "text-red-500")}>
                {Math.abs(currentTotals.balance).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <form id="single-entry-form" onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Mapping Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Classification & Mapping</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financial Recognition</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Currency</label>
                <select
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:bg-white focus:border-emerald-600 transition-all appearance-none"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 ml-1">Debit Amount (KES)</label>
                <input
                  type="number"
                  name="debit"
                  placeholder="0.00"
                  value={formik.values.debit || ""}
                  onChange={(e) => {
                    formik.setFieldValue("debit", e.target.value);
                    if (Number(e.target.value) > 0) formik.setFieldValue("credit", 0);
                  }}
                  className="w-full h-14 bg-emerald-50/30 border border-emerald-100 rounded px-5 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all placeholder:text-emerald-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-rose-600 ml-1">Credit Amount (KES)</label>
                <input
                  type="number"
                  name="credit"
                  placeholder="0.00"
                  value={formik.values.credit || ""}
                  onChange={(e) => {
                    formik.setFieldValue("credit", e.target.value);
                    if (Number(e.target.value) > 0) formik.setFieldValue("debit", 0);
                  }}
                  className="w-full h-14 bg-rose-50/30 border border-rose-100 rounded px-5 text-sm font-bold text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-600/10 transition-all placeholder:text-rose-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 truncate">Exchange Rate</label>
                <input
                  type="number"
                  name="exchange_rate"
                  step="0.0001"
                  value={formik.values.exchange_rate}
                  onChange={formik.handleChange}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-slate-600/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Documentation Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileUp className="w-4 h-4 text-slate-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Evidence & Notes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Evidence Type</label>
                <select
                  name="source_document"
                  value={formik.values.source_document}
                  onChange={formik.handleChange}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all outline-none"
                >
                  <option value="">Select Evidence...</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="RECEIPT">Receipt</option>
                  <option value="KRA_INVOICE">KRA Invoice</option>
                  <option value="MOBILE_MONEY">M-Pesa Msg</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Method</label>
                <select
                  name="payment_method"
                  value={formik.values.payment_method}
                  onChange={formik.handleChange}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-5 text-sm font-semibold transition-all outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">M-Pesa / Mobile</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Document #</label>
                <input
                  name="document_number"
                  placeholder="REF-001"
                  value={formik.values.document_number}
                  onChange={formik.handleChange}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded px-5 text-sm font-semibold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Attach Link/File</label>
                <div className="relative">
                  <input
                    type="file"
                    id="single-file-upload"
                    className="hidden"
                    onChange={(e) => formik.setFieldValue("document_file", e.currentTarget.files?.[0])}
                  />
                  <label
                    htmlFor="single-file-upload"
                    className="flex h-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded items-center px-5 gap-3 text-slate-400 hover:border-emerald-600/30 hover:bg-emerald-50/20 transition-all cursor-pointer group"
                  >
                    <FileUp className="w-4 h-4 group-hover:text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase truncate group-hover:text-emerald-600">
                      {formik.values.document_file?.name || "Upload Proof"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <textarea
              name="notes"
              placeholder="Narrative summary for this entry..."
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded p-5 text-sm font-semibold outline-none focus:ring-4 focus:ring-slate-600/10 focus:bg-white focus:border-slate-400 transition-all resize-none"
            />
          </div>
        </form>
      </div>

      <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
        <button
          type="submit"
          form="single-entry-form"
          disabled={formik.isSubmitting}
          className="w-full h-12 sm:h-14 bg-slate-900 border border-black text-white rounded font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {formik.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <Plus className="w-4 h-4" />
              RECORD TRANSACTION
            </>
          )}
        </button>
      </div>
    </div>
  );
}
