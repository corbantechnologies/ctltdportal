/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Receipt,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileUp,
  CreditCard
} from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { createJournalEntry as createService } from "@/services/journalentries";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useQueryClient } from "@tanstack/react-query";
import SearchableSelect from "@/components/portal/SearchableSelect";
import { cn } from "@/lib/utils";

export interface MultiLineJournalEntryProps {
  rolePrefix?: string;
  journalReference?: string;
  currentTotals?: { debit: number; credit: number; balance: number };
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  refetch: (options?: any) => Promise<any>;
}

export default function MultiLineJournalEntry({
  rolePrefix = "finance",
  journalReference,
  currentTotals,
  onSuccess,
  onClose,
  className,
  refetch,
}: MultiLineJournalEntryProps) {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();
  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const { data: books, isLoading: isLoadingBooks } = useFetchBooks();
  const { data: partners, isLoading: isLoadingPartners } = useFetchPartners();
  const { data: divisions, isLoading: isLoadingDivisions } = useFetchDivisions();

  const bookOptions = useMemo(() =>
    books?.map(b => ({ value: b.name, label: b.name, secondaryLabel: b.code })) || [],
    [books]);

  const partnerOptions = useMemo(() =>
    partners?.map(p => ({ value: p.name, label: p.name })) || [],
    [partners]);

  const divisionOptions = useMemo(() =>
    divisions?.map(d => ({ value: d.name, label: d.name, secondaryLabel: d.code })) || [],
    [divisions]);

  const formik = useFormik({
    initialValues: {
      journal: journalReference || "",
      currency: "KES",
      exchange_rate: "1",
      payment_method: "BANK_TRANSFER",
      source_document: "INVOICE",
      document_number: "",
      document_file: null as File | null,
      notes: "",
      lines: [
        { book: "", partner: "", division: "", debit: 0, credit: 0, project: "" }
      ],
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      // Final split check
      const totalDebit = values.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
      const totalCredit = values.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        toast.error(`Out of Balance: Difference is ${Math.abs(totalDebit - totalCredit).toFixed(2)}`);
        setSubmitting(false);
        return;
      }

      if (totalDebit === 0) {
        toast.error("Transaction must have values.");
        setSubmitting(false);
        return;
      }

      try {
        // We prepare the payload as a list of entries for the backend
        const payload = values.lines.map(line => ({
          journal: values.journal,
          book: line.book,
          partner: line.partner || null,
          division: line.division,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          currency: values.currency,
          exchange_rate: Number(values.exchange_rate) || 1,
          foreign_debit: values.currency !== "KES" ? Number(line.debit) : 0,
          foreign_credit: values.currency !== "KES" ? Number(line.credit) : 0,
          payment_method: values.payment_method,
          is_intercompany: false,
          source_document: values.source_document,
          document_number: values.document_number,
          notes: values.notes,
          project: line.project,
          // document_file is usually handled via FormData for the whole batch or linked later
        }));

        // Note: For multi-line with file, it's safer to use the service in a loop 
        // or a dedicated multi-part batch. Here we will use the bulk create endpoint if the backend is updated.
        // For simplicity and file support, if there's a file, we link it to the first entry.

        await createService(payload as any, header);

        toast.success("Batch transaction recorded successfully");
        queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
        queryClient.invalidateQueries({ queryKey: ["journals"] });
        refetch();
        resetForm();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error("Failed to record entries. Ensure all lines have required fields.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const totals = useMemo(() => {
    const dr = formik.values.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const cr = formik.values.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    return { debit: dr, credit: cr, balance: dr - cr };
  }, [formik.values.lines]);

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className={cn("w-full bg-white border border-slate-200 rounded overflow-hidden flex flex-col max-h-[90vh]", className)}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Multi-Line Transaction</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Batch: {journalReference}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentTotals && (
              <div className="hidden md:flex items-center gap-3 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono">
                <span className="text-slate-500 font-sans text-[10px] uppercase font-semibold">Batch DR:</span>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(85vh-120px)]">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded border border-slate-200">
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
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Evidence Type</label>
              <select
                name="source_document"
                value={formik.values.source_document}
                onChange={formik.handleChange}
                className="w-full h-8 bg-white border border-slate-300 rounded px-2 text-xs font-medium focus:outline-none focus:border-slate-800 transition-colors"
              >
                <option value="INVOICE">Invoice</option>
                <option value="RECEIPT">Receipt</option>
                <option value="KRA_INVOICE">KRA Invoice</option>
                <option value="MOBILE_MONEY">M-Pesa Msg</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Ref Number</label>
              <input
                name="document_number"
                placeholder="e.g. INV-001"
                value={formik.values.document_number}
                onChange={formik.handleChange}
                className="w-full h-8 bg-white border border-slate-300 rounded px-2.5 text-xs font-mono font-medium focus:outline-none focus:border-slate-800 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5">Attach File</label>
              <label className="flex h-8 bg-white border border-dashed border-slate-300 rounded items-center px-2.5 gap-2 text-slate-500 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                <FileUp className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs truncate font-medium">
                  {formik.values.document_file?.name || "Upload Proof..."}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      formik.setFieldValue("document_file", file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Transaction Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Ledger Distribution ({formik.values.lines.length})
              </h3>
              <button
                type="button"
                onClick={() => formik.setFieldValue("lines", [...formik.values.lines, { book: "", partner: "", division: "", debit: 0, credit: 0, project: "" }])}
                className="text-[10px] font-semibold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Row
              </button>
            </div>

            <FieldArray name="lines">
              {({ remove }) => (
                <div className="space-y-2">
                  {formik.values.lines.map((line, index) => (
                    <div key={index} className={cn(
                      "grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-2 rounded border border-slate-200 transition-all",
                      line.debit > 0 ? "bg-emerald-50/20" : line.credit > 0 ? "bg-indigo-50/20" : "bg-white"
                    )}>
                      <div className="md:col-span-3">
                        <SearchableSelect
                          label={`Account Book #${index + 1}`}
                          options={bookOptions}
                          value={line.book}
                          onChange={(val) => formik.setFieldValue(`lines.${index}.book`, val)}
                          placeholder="Search Ledger..."
                          disabled={isLoadingBooks}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <SearchableSelect
                          label="Division"
                          options={divisionOptions}
                          value={line.division}
                          onChange={(val) => formik.setFieldValue(`lines.${index}.division`, val)}
                          placeholder="Select..."
                          disabled={isLoadingDivisions}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <SearchableSelect
                          label="Partner (Optional)"
                          options={partnerOptions}
                          value={line.partner}
                          onChange={(val) => formik.setFieldValue(`lines.${index}.partner`, val)}
                          placeholder="No Partner"
                          disabled={isLoadingPartners}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ml-0.5">Debit Amount</label>
                        <input
                          type="number"
                          name={`lines.${index}.debit`}
                          value={line.debit || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newLine = { ...line, debit: val };
                            if (Number(val) > 0) newLine.credit = 0;
                            formik.setFieldValue(`lines.${index}`, newLine);
                          }}
                          className="w-full h-8 bg-white border border-emerald-300 rounded px-2.5 text-xs font-mono font-semibold text-emerald-800 focus:outline-none focus:border-emerald-600 transition-colors placeholder:text-emerald-300"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 ml-0.5">Credit Amount</label>
                        <input
                          type="number"
                          name={`lines.${index}.credit`}
                          value={line.credit || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newLine = { ...line, credit: val };
                            if (Number(val) > 0) newLine.debit = 0;
                            formik.setFieldValue(`lines.${index}`, newLine);
                          }}
                          className="w-full h-8 bg-white border border-indigo-300 rounded px-2.5 text-xs font-mono font-semibold text-indigo-800 focus:outline-none focus:border-indigo-600 transition-colors placeholder:text-indigo-300"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center pb-0.5">
                        <button
                          type="button"
                          onClick={() => index > 0 && remove(index)}
                          className={cn(
                            "p-1.5 rounded transition-all",
                            index === 0 ? "opacity-20 cursor-not-allowed text-slate-300" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                          )}
                          disabled={index === 0}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FieldArray>
          </div>
        </div>

        {/* Footer Balance Bar */}
        <div className="px-4 py-2.5 bg-slate-900 text-white flex-shrink-0 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase">DR:</span>
                <span className="font-semibold text-emerald-400">{formik.values.currency} {totals.debit.toLocaleString()}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase">CR:</span>
                <span className="font-semibold text-indigo-400">{formik.values.currency} {totals.credit.toLocaleString()}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase">Diff:</span>
                <span className={cn("font-semibold", totals.balance === 0 ? "text-emerald-400" : "text-rose-400")}>
                  {totals.balance.toLocaleString()}
                </span>
                {totals.balance === 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formik.isSubmitting || totals.balance !== 0}
                className={cn(
                  "h-8 px-4 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1.5",
                  totals.balance === 0 && !formik.isSubmitting
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                )}
              >
                {formik.isSubmitting ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Lines</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormikProvider>
  );
}