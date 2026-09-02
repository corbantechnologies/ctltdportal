/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Zap,
  X,
  Plus,
  Trash2,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBackendError } from "@/lib/error-handler";
import { formatNumber } from "@/tools/format";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPaymentMethods } from "@/hooks/paymentmethods/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useBulkCreateSimpleTransactions } from "@/hooks/simpletransactions/actions";
import { CreateSimpleTransaction } from "@/services/simpletransactions";

interface BulkRowItem {
  id: string;
  name: string;
  transaction_type: "MONEY_IN" | "MONEY_OUT";
  amount: string;
  date: string;
  ledger_book: string;
  payment_method: string;
  division: string;
  journal_type: string;
  partner: string;
  source_document: string;
  document_number: string;
}

interface BulkCreateSimpleTransactionProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const createEmptyRow = (defaults?: Partial<BulkRowItem>): BulkRowItem => ({
  id: Math.random().toString(36).substring(2, 9),
  name: "",
  transaction_type: defaults?.transaction_type || "MONEY_OUT",
  amount: "",
  date: defaults?.date || new Date().toISOString().split("T")[0],
  ledger_book: defaults?.ledger_book || "",
  payment_method: defaults?.payment_method || "",
  division: defaults?.division || "",
  journal_type: defaults?.journal_type || "",
  partner: defaults?.partner || "",
  source_document: "",
  document_number: "",
});

export default function BulkCreateSimpleTransaction({
  onSuccess,
  onClose,
}: BulkCreateSimpleTransactionProps) {
  const { data: books, isLoading: loadingBooks } = useFetchBooks();
  const { data: divisions, isLoading: loadingDivisions } = useFetchDivisions();
  const { data: journalTypes, isLoading: loadingJournalTypes } = useFetchJournalTypes();
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useFetchPaymentMethods();
  const { data: partners } = useFetchPartners();

  const bulkCreateMutation = useBulkCreateSimpleTransactions();

  // Shared quick-fill defaults
  const [quickDefaults, setQuickDefaults] = useState({
    date: new Date().toISOString().split("T")[0],
    division: "",
    payment_method: "",
    ledger_book: "",
    journal_type: "",
    transaction_type: "MONEY_OUT" as "MONEY_IN" | "MONEY_OUT",
  });

  const [rows, setRows] = useState<BulkRowItem[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const isDataLoading =
    loadingBooks || loadingDivisions || loadingJournalTypes || loadingPaymentMethods;

  // Live totals calculation
  const totalIn = rows
    .filter((r) => r.transaction_type === "MONEY_IN")
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const totalOut = rows
    .filter((r) => r.transaction_type === "MONEY_OUT")
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const netBalance = totalIn - totalOut;

  // Row Manipulation Helpers
  const handleUpdateRow = (id: string, field: keyof BulkRowItem, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    // Clear validation error on edit
    if (validationErrors[id]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow(quickDefaults)]);
  };

  const handleAddMultipleRows = (count: number) => {
    const newItems = Array.from({ length: count }).map(() => createEmptyRow(quickDefaults));
    setRows((prev) => [...prev, ...newItems]);
  };

  const handleDuplicateRow = (index: number) => {
    const source = rows[index];
    const duplicated: BulkRowItem = {
      ...source,
      id: Math.random().toString(36).substring(2, 9),
    };
    const next = [...rows];
    next.splice(index + 1, 0, duplicated);
    setRows(next);
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      toast.error("You must have at least one transaction row.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleApplyDefaults = (onlyEmpty = false) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        date: (!onlyEmpty || !row.date) && quickDefaults.date ? quickDefaults.date : row.date,
        division:
          (!onlyEmpty || !row.division) && quickDefaults.division
            ? quickDefaults.division
            : row.division,
        payment_method:
          (!onlyEmpty || !row.payment_method) && quickDefaults.payment_method
            ? quickDefaults.payment_method
            : row.payment_method,
        ledger_book:
          (!onlyEmpty || !row.ledger_book) && quickDefaults.ledger_book
            ? quickDefaults.ledger_book
            : row.ledger_book,
        journal_type:
          (!onlyEmpty || !row.journal_type) && quickDefaults.journal_type
            ? quickDefaults.journal_type
            : row.journal_type,
        transaction_type:
          (!onlyEmpty || !row.transaction_type) && quickDefaults.transaction_type
            ? quickDefaults.transaction_type
            : row.transaction_type,
      }))
    );
    toast.success(
      onlyEmpty
        ? "Applied quick defaults to empty fields."
        : "Applied quick defaults to all rows."
    );
  };

  const handleBulkSubmit = async () => {
    // Validate each row
    const errors: Record<string, string[]> = {};
    const validPayload: CreateSimpleTransaction[] = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const rowErrs: string[] = [];

      if (!row.name.trim()) rowErrs.push("Description is required");
      const numAmt = parseFloat(row.amount);
      if (!row.amount || isNaN(numAmt) || numAmt <= 0) {
        rowErrs.push("Valid amount (> 0) is required");
      }
      if (!row.date) rowErrs.push("Date is required");
      if (!row.ledger_book) rowErrs.push("Ledger Book is required");
      if (!row.payment_method) rowErrs.push("Payment Method is required");
      if (!row.division) rowErrs.push("Division is required");
      if (!row.journal_type) rowErrs.push("Journal Type is required");

      if (rowErrs.length > 0) {
        errors[row.id] = rowErrs.map((err) => `Row #${rowNum}: ${err}`);
      } else {
        validPayload.push({
          name: row.name.trim(),
          transaction_type: row.transaction_type,
          amount: numAmt,
          date: row.date,
          ledger_book: row.ledger_book,
          payment_method: row.payment_method,
          division: row.division,
          journal_type: row.journal_type,
          partner: row.partner || null,
          source_document: row.source_document || null,
          document_number: row.document_number || null,
        });
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstErrorRow = Object.values(errors)[0][0];
      toast.error(`Please fix validation errors. (${firstErrorRow})`);
      return;
    }

    try {
      const res = await bulkCreateMutation.mutateAsync(validPayload);
      toast.success(
        `Successfully logged ${res.count} transactions with auto-generated journals!`
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(formatBackendError(err, "Failed to create batch transactions"));
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        {/* Quick-Fill Defaults Toolbar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Fill Defaults (Batch Apply)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyDefaults(true)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
              >
                Fill Empty Only
              </button>
              <button
                type="button"
                onClick={() => handleApplyDefaults(false)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Apply to All Rows
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Default Date
              </label>
              <input
                type="date"
                value={quickDefaults.date}
                onChange={(e) => setQuickDefaults({ ...quickDefaults, date: e.target.value })}
                className="w-full h-8 text-xs font-semibold px-2 rounded border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Default Type
              </label>
              <select
                value={quickDefaults.transaction_type}
                onChange={(e) =>
                  setQuickDefaults({
                    ...quickDefaults,
                    transaction_type: e.target.value as "MONEY_IN" | "MONEY_OUT",
                  })
                }
                className="w-full h-8 text-xs font-semibold px-2 rounded border border-slate-200 bg-white"
              >
                <option value="MONEY_OUT">Money Out</option>
                <option value="MONEY_IN">Money In</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Default Division
              </label>
              <select
                value={quickDefaults.division}
                onChange={(e) => setQuickDefaults({ ...quickDefaults, division: e.target.value })}
                className="w-full h-8 text-xs font-semibold px-2 rounded border border-slate-200 bg-white"
              >
                <option value="">-- Choose Division --</option>
                {divisions?.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Default Payment Method
              </label>
              <select
                value={quickDefaults.payment_method}
                onChange={(e) =>
                  setQuickDefaults({ ...quickDefaults, payment_method: e.target.value })
                }
                className="w-full h-8 text-xs font-semibold px-2 rounded border border-slate-200 bg-white"
              >
                <option value="">-- Choose Method --</option>
                {paymentMethods?.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Default Ledger Book
              </label>
              <select
                value={quickDefaults.ledger_book}
                onChange={(e) => setQuickDefaults({ ...quickDefaults, ledger_book: e.target.value })}
                className="w-full h-8 text-xs font-semibold px-2 rounded border border-slate-200 bg-white"
              >
                <option value="">-- Choose Book --</option>
                {books?.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Default Journal Type
              </label>
              <select
                value={quickDefaults.journal_type}
                onChange={(e) =>
                  setQuickDefaults({ ...quickDefaults, journal_type: e.target.value })
                }
                className="w-full h-8 text-xs font-semibold px-2 rounded border border-slate-200 bg-white"
              >
                <option value="">-- Choose Type --</option>
                {journalTypes?.map((j) => (
                  <option key={j.name} value={j.name}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Rows
            </span>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-800 mt-0.5">
              {rows.length}
            </p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider flex items-center justify-center gap-1">
              <ArrowDownLeft className="w-3 h-3" /> Total In
            </span>
            <p className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-0.5">
              KES {formatNumber(totalIn)}
            </p>
          </div>
          <div className="bg-red-50/70 border border-red-200/60 rounded p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider flex items-center justify-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Total Out
            </span>
            <p className="text-base sm:text-lg font-bold font-mono text-red-700 mt-0.5">
              KES {formatNumber(totalOut)}
            </p>
          </div>
          <div className="bg-slate-900 text-white rounded p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Net Balance
            </span>
            <p
              className={cn(
                "text-base sm:text-lg font-bold font-mono mt-0.5",
                netBalance >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              KES {formatNumber(netBalance)}
            </p>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs min-w-[1000px]">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3 w-28">Type</th>
                <th className="py-2.5 px-3 min-w-[180px]">Description *</th>
                <th className="py-2.5 px-3 w-32">Amount (KES) *</th>
                <th className="py-2.5 px-3 w-32">Date *</th>
                <th className="py-2.5 px-3 min-w-[150px]">Ledger Book *</th>
                <th className="py-2.5 px-3 min-w-[140px]">Payment Method *</th>
                <th className="py-2.5 px-3 min-w-[130px]">Division *</th>
                <th className="py-2.5 px-3 min-w-[130px]">Journal Type *</th>
                <th className="py-2.5 px-3 min-w-[130px]">Partner</th>
                <th className="py-2.5 px-3 min-w-[110px]">Doc / Ref #</th>
                <th className="py-2.5 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => {
                const hasError = !!validationErrors[row.id];
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      hasError ? "bg-red-50/40" : ""
                    )}
                  >
                    {/* Index */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-400 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Type */}
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateRow(
                            row.id,
                            "transaction_type",
                            row.transaction_type === "MONEY_IN" ? "MONEY_OUT" : "MONEY_IN"
                          )
                        }
                        className={cn(
                          "w-full h-8 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all",
                          row.transaction_type === "MONEY_IN"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        )}
                      >
                        {row.transaction_type === "MONEY_IN" ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            IN
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-red-600" />
                            OUT
                          </>
                        )}
                      </button>
                    </td>

                    {/* Description */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="e.g. Server hosting, Fuel..."
                        value={row.name}
                        onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                        className={cn(
                          "w-full h-8 px-2.5 rounded border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900",
                          !row.name.trim() && hasError
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white"
                        )}
                      />
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) => handleUpdateRow(row.id, "amount", e.target.value)}
                        className={cn(
                          "w-full h-8 px-2.5 rounded border text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 text-right",
                          (!row.amount || parseFloat(row.amount) <= 0) && hasError
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white"
                        )}
                      />
                    </td>

                    {/* Date */}
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleUpdateRow(row.id, "date", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-semibold"
                      />
                    </td>

                    {/* Ledger Book */}
                    <td className="py-2 px-3">
                      <select
                        value={row.ledger_book}
                        onChange={(e) => handleUpdateRow(row.id, "ledger_book", e.target.value)}
                        className={cn(
                          "w-full h-8 px-2 rounded border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900",
                          !row.ledger_book && hasError
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white"
                        )}
                      >
                        <option value="">-- Select Book --</option>
                        {books?.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Method */}
                    <td className="py-2 px-3">
                      <select
                        value={row.payment_method}
                        onChange={(e) =>
                          handleUpdateRow(row.id, "payment_method", e.target.value)
                        }
                        className={cn(
                          "w-full h-8 px-2 rounded border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900",
                          !row.payment_method && hasError
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white"
                        )}
                      >
                        <option value="">-- Select Method --</option>
                        {paymentMethods?.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Division */}
                    <td className="py-2 px-3">
                      <select
                        value={row.division}
                        onChange={(e) => handleUpdateRow(row.id, "division", e.target.value)}
                        className={cn(
                          "w-full h-8 px-2 rounded border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900",
                          !row.division && hasError
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white"
                        )}
                      >
                        <option value="">-- Select Division --</option>
                        {divisions?.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Journal Type */}
                    <td className="py-2 px-3">
                      <select
                        value={row.journal_type}
                        onChange={(e) => handleUpdateRow(row.id, "journal_type", e.target.value)}
                        className={cn(
                          "w-full h-8 px-2 rounded border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900",
                          !row.journal_type && hasError
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white"
                        )}
                      >
                        <option value="">-- Select Type --</option>
                        {journalTypes?.map((j) => (
                          <option key={j.name} value={j.name}>
                            {j.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Partner (Optional) */}
                    <td className="py-2 px-3">
                      <select
                        value={row.partner}
                        onChange={(e) => handleUpdateRow(row.id, "partner", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium"
                      >
                        <option value="">(None / Optional)</option>
                        {partners?.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Doc Number (Optional) */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="INV-001 / RCT"
                        value={row.document_number}
                        onChange={(e) =>
                          handleUpdateRow(row.id, "document_number", e.target.value)
                        }
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-mono"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(index)}
                          title="Duplicate row"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          title="Delete row"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Row Addition Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add 1 Row
            </button>
            <button
              type="button"
              onClick={() => handleAddMultipleRows(5)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add 5 Rows
            </button>
          </div>

          <button
            type="button"
            onClick={() => setRows([createEmptyRow(quickDefaults)])}
            className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors"
          >
            Reset All Rows
          </button>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          Ready to commit <span className="font-bold text-slate-900">{rows.length}</span> transaction(s) to ledger.
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-11 rounded border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleBulkSubmit}
            disabled={bulkCreateMutation.isPending || isDataLoading}
            className="w-full sm:w-auto px-6 h-11 rounded font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {bulkCreateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-400" />
                Commit {rows.length} Transaction(s)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
