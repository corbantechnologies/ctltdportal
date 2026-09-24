/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  FileUp,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  BookOpen,
  DollarSign,
  Receipt,
  Users,
  Maximize2,
  Minimize2,
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

export interface BulkRowItem {
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
  document_file: File | null;
  isOpen: boolean;
}

interface BulkCreateSimpleTransactionProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const createEmptyRow = (defaults?: Partial<BulkRowItem>, isOpen = true): BulkRowItem => ({
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
  document_file: null,
  isOpen: isOpen,
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
  const [showDefaultsBar, setShowDefaultsBar] = useState(false);

  // Initialize with 1 expanded entry and 1 collapsed entry
  const [rows, setRows] = useState<BulkRowItem[]>([
    createEmptyRow({}, true),
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isFullWidth, setIsFullWidth] = useState(true);

  const isDataLoading =
    loadingBooks || loadingDivisions || loadingJournalTypes || loadingPaymentMethods;

  // Options
  const bookOptions = useMemo(
    () =>
      books?.map((b) => ({
        value: b.name,
        label: b.code ? `[${b.code}] ${b.name}` : b.name,
        code: b.code,
        type: b.account_type,
      })) || [],
    [books]
  );

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

  const toggleRowAccordion = (id: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, isOpen: !row.isOpen } : row))
    );
  };

  const handleExpandAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, isOpen: true })));
  };

  const handleCollapseAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, isOpen: false })));
  };

  const handleAddRow = () => {
    // Collapse all existing rows so the workspace stays clean
    setRows((prev) => [
      ...prev.map((r) => ({ ...r, isOpen: false })),
      createEmptyRow(
        {
          date: quickDefaults.date,
          division: quickDefaults.division,
          payment_method: quickDefaults.payment_method,
          ledger_book: quickDefaults.ledger_book,
          journal_type: quickDefaults.journal_type,
          transaction_type: quickDefaults.transaction_type,
        },
        true // newly added row is open
      ),
    ]);
  };

  const handleDuplicateRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = rows.find((r) => r.id === id);
    if (!source) return;
    const newRow = createEmptyRow(
      {
        name: source.name ? `${source.name} (Copy)` : "",
        transaction_type: source.transaction_type,
        amount: source.amount,
        date: source.date,
        ledger_book: source.ledger_book,
        payment_method: source.payment_method,
        division: source.division,
        journal_type: source.journal_type,
        partner: source.partner,
        source_document: source.source_document,
        document_number: source.document_number,
      },
      true
    );
    setRows((prev) => [
      ...prev.map((r) => ({ ...r, isOpen: false })),
      newRow,
    ]);
    toast.success("Entry duplicated and expanded");
  };

  const handleRemoveRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rows.length === 1) {
      toast.error("At least one transaction entry is required.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const applyDefaults = (onlyEmpty = true) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        date: (!onlyEmpty || !row.date) && quickDefaults.date ? quickDefaults.date : row.date,
        division: (!onlyEmpty || !row.division) && quickDefaults.division ? quickDefaults.division : row.division,
        payment_method: (!onlyEmpty || !row.payment_method) && quickDefaults.payment_method ? quickDefaults.payment_method : row.payment_method,
        ledger_book: (!onlyEmpty || !row.ledger_book) && quickDefaults.ledger_book ? quickDefaults.ledger_book : row.ledger_book,
        journal_type: (!onlyEmpty || !row.journal_type) && quickDefaults.journal_type ? quickDefaults.journal_type : row.journal_type,
      }))
    );
    toast.success(onlyEmpty ? "Applied defaults to empty fields" : "Applied defaults to all rows");
  };

  // Validation
  const validateRows = () => {
    const errors: Record<string, string[]> = {};
    rows.forEach((row, idx) => {
      const rowErrs: string[] = [];
      if (!row.name.trim()) rowErrs.push("Description is required");
      if (!row.amount || parseFloat(row.amount) <= 0)
        rowErrs.push("Amount must be greater than 0");
      if (!row.date) rowErrs.push("Date is required");
      if (!row.ledger_book) rowErrs.push("Ledger Book is required");
      if (!row.payment_method) rowErrs.push("Payment Method is required");
      if (!row.division) rowErrs.push("Division is required");
      if (!row.journal_type) rowErrs.push("Journal Type is required");

      if (rowErrs.length > 0) {
        errors[row.id] = rowErrs;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateRows()) {
      const errorCount = Object.keys(validationErrors).length || 1;
      // Auto-open rows with errors so user can fix them immediately
      setRows((prev) =>
        prev.map((r) => (validationErrors[r.id] ? { ...r, isOpen: true } : r))
      );
      toast.error(`Please correct errors in ${errorCount} transaction entry(s).`);
      return;
    }

    try {
      // Check if any row has a file attached
      const hasFiles = rows.some((r) => r.document_file !== null);

      if (hasFiles) {
        // Send as FormData with files attached by index
        const formData = new FormData();
        const jsonRows = rows.map((row, idx) => {
          if (row.document_file) {
            formData.append(`document_file_${idx}`, row.document_file);
          }
          return {
            name: row.name.trim(),
            transaction_type: row.transaction_type,
            amount: parseFloat(row.amount),
            date: row.date,
            ledger_book: row.ledger_book,
            payment_method: row.payment_method,
            division: row.division,
            journal_type: row.journal_type,
            partner: row.partner || null,
            source_document: row.source_document || null,
            document_number: row.document_number || null,
          };
        });

        formData.append("transactions", JSON.stringify(jsonRows));
        const res = await bulkCreateMutation.mutateAsync(formData as any);
        toast.success(
          `Successfully posted ${res.count} transactions with auto-generated double-entry journals!`
        );
      } else {
        // Send as clean JSON
        const payload = rows.map((row) => ({
          name: row.name.trim(),
          transaction_type: row.transaction_type,
          amount: parseFloat(row.amount),
          date: row.date,
          ledger_book: row.ledger_book,
          payment_method: row.payment_method,
          division: row.division,
          journal_type: row.journal_type,
          partner: row.partner || undefined,
          source_document: row.source_document || undefined,
          document_number: row.document_number || undefined,
        }));

        const res = await bulkCreateMutation.mutateAsync(payload);
        toast.success(
          `Successfully logged ${res.count} transactions with auto-generated journals!`
        );
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(
        formatBackendError(err, "Failed to submit batch transactions")
      );
    }
  };

  const isRowValid = (row: BulkRowItem) => {
    return (
      Boolean(row.name.trim()) &&
      Boolean(row.amount && parseFloat(row.amount) > 0) &&
      Boolean(row.date) &&
      Boolean(row.ledger_book) &&
      Boolean(row.payment_method) &&
      Boolean(row.division) &&
      Boolean(row.journal_type)
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-hidden w-full h-full">
      {/* Top Controls & Defaults Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col gap-2.5 flex-shrink-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Batch Entries:
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
              {rows.length} {rows.length === 1 ? "entry" : "entries"}
            </span>

            <button
              type="button"
              onClick={() => setShowDefaultsBar(!showDefaultsBar)}
              className={cn(
                "ml-2 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5",
                showDefaultsBar
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showDefaultsBar ? "Hide Quick Defaults" : "Quick Defaults"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
              title={isFullWidth ? "Switch to Centered Boxed View" : "Expand to Full Screen Width"}
            >
              {isFullWidth ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>Boxed View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>Full Width</span>
                </>
              )}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleExpandAll}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Expand All</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Collapse All</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Collapsible Quick Defaults Panel */}
        {showDefaultsBar && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Configure Common Values to Speed Up Entry:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyDefaults(true)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-[11px] font-bold transition-all shadow-xs"
                >
                  Apply to Empty Fields
                </button>
                <button
                  type="button"
                  onClick={() => applyDefaults(false)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-bold transition-all shadow-xs"
                >
                  Overwrite All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Date</label>
                <input
                  type="date"
                  value={quickDefaults.date}
                  onChange={(e) => setQuickDefaults({ ...quickDefaults, date: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-slate-200 bg-white font-medium text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Division</label>
                <select
                  value={quickDefaults.division}
                  onChange={(e) => setQuickDefaults({ ...quickDefaults, division: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-slate-200 bg-white font-medium text-xs outline-none"
                >
                  <option value="">-- Division --</option>
                  {divisions?.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Payment Method</label>
                <select
                  value={quickDefaults.payment_method}
                  onChange={(e) => setQuickDefaults({ ...quickDefaults, payment_method: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-slate-200 bg-white font-medium text-xs outline-none"
                >
                  <option value="">-- Method --</option>
                  {paymentMethods?.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Ledger Book</label>
                <select
                  value={quickDefaults.ledger_book}
                  onChange={(e) => setQuickDefaults({ ...quickDefaults, ledger_book: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-slate-200 bg-white font-medium text-xs outline-none"
                >
                  <option value="">-- Book --</option>
                  {bookOptions.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Journal Type</label>
                <select
                  value={quickDefaults.journal_type}
                  onChange={(e) => setQuickDefaults({ ...quickDefaults, journal_type: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-slate-200 bg-white font-medium text-xs outline-none"
                >
                  <option value="">-- Journal Type --</option>
                  {journalTypes?.map((j) => (
                    <option key={j.name} value={j.name}>{j.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Cards Container */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 w-full transition-all duration-200",
          !isFullWidth && "max-w-5xl mx-auto"
        )}
      >
        {rows.map((row, index) => {
          const isOpen = row.isOpen;
          const isMoneyIn = row.transaction_type === "MONEY_IN";
          const errors = validationErrors[row.id];
          const hasErrors = Boolean(errors && errors.length > 0);
          const isValid = isRowValid(row);

          return (
            <div
              key={row.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden bg-white shadow-sm",
                isOpen
                  ? "border-slate-300 ring-2 ring-slate-900/5 shadow-md"
                  : hasErrors
                    ? "border-rose-300 bg-rose-50/20"
                    : "border-slate-200 hover:border-slate-300"
              )}
            >
              {/* Accordion Header / Summary Bar */}
              <div
                onClick={() => toggleRowAccordion(row.id)}
                className={cn(
                  "p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b",
                  isOpen
                    ? "bg-slate-900 text-white border-slate-800"
                    : "bg-white hover:bg-slate-50 text-slate-900 border-slate-100"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Entry Index Pill */}
                  <span
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0",
                      isOpen
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    #{index + 1}
                  </span>

                  {/* Transaction Type Badge */}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0",
                      isMoneyIn
                        ? isOpen
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isOpen
                          ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                    )}
                  >
                    {isMoneyIn ? (
                      <ArrowDownLeft className="w-3 h-3" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                    <span>{isMoneyIn ? "Money In" : "Money Out"}</span>
                  </span>

                  {/* Description & Summary */}
                  <div className="min-w-0 flex-1 truncate">
                    <p className={cn("text-xs sm:text-sm font-bold truncate", isOpen ? "text-white" : "text-slate-900")}>
                      {row.name ? row.name : <span className="text-slate-400 italic font-normal">Untitled Transaction</span>}
                    </p>
                    {!isOpen && (
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                        <span>{row.date}</span>
                        {row.ledger_book && <span>&bull; {row.ledger_book}</span>}
                        {row.division && <span>&bull; {row.division}</span>}
                      </p>
                    )}
                  </div>

                  {/* Amount Display */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-mono font-bold block",
                        isOpen
                          ? "text-white"
                          : isMoneyIn
                            ? "text-emerald-600"
                            : "text-slate-900"
                      )}
                    >
                      {row.amount && parseFloat(row.amount) > 0
                        ? `KES ${formatNumber(parseFloat(row.amount))}`
                        : "KES 0.00"}
                    </span>
                  </div>

                  {/* File Attachment Pill */}
                  {row.document_file && (
                    <span
                      className={cn(
                        "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0",
                        isOpen
                          ? "bg-white/10 text-slate-200 border border-white/20"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}
                    >
                      <Paperclip className="w-3 h-3 text-emerald-500" />
                      <span className="max-w-[120px] truncate">{row.document_file.name}</span>
                    </span>
                  )}

                  {/* Validation Icon */}
                  <div className="flex-shrink-0 ml-1">
                    {hasErrors ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : isValid ? (
                      <CheckCircle2 className={cn("w-4 h-4", isOpen ? "text-emerald-400" : "text-emerald-600")} />
                    ) : null}
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    title="Duplicate entry"
                    onClick={(e) => handleDuplicateRow(row.id, e)}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      isOpen ? "hover:bg-white/20 text-slate-300 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Delete entry"
                    onClick={(e) => handleRemoveRow(row.id, e)}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      isOpen ? "hover:bg-rose-500/30 text-rose-300 hover:text-rose-100" : "hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="ml-1">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-white/70" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Expanded Body - Matching Single Transaction Form */}
              {isOpen && (
                <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200 bg-white">
                  {/* Validation Error Banner if any */}
                  {hasErrors && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Please complete required fields for Entry #{index + 1}:</p>
                        <ul className="list-disc list-inside mt-1 text-[11px] space-y-0.5">
                          {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 1. Transaction Type Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Transaction Type *
                    </label>
                    <div className="grid grid-cols-2 max-w-2xl gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(row.id, "transaction_type", "MONEY_OUT")}
                        className={cn(
                          "h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all shadow-xs",
                          !isMoneyIn
                            ? "bg-rose-600 border-rose-600 text-white shadow-rose-600/20"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Money Out (Expense / Payment)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateRow(row.id, "transaction_type", "MONEY_IN")}
                        className={cn(
                          "h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all shadow-xs",
                          isMoneyIn
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>Money In (Revenue / Inflow)</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Core Grid: Description & Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Description (7 cols) */}
                    <div className="sm:col-span-7 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Transaction Description *</span>
                        <span className="text-[10px] text-slate-400 font-normal">e.g. Bought printer ink, Client retainer</span>
                      </label>
                      <input
                        type="text"
                        placeholder="What was this transaction for?"
                        value={row.name}
                        onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all",
                          !row.name.trim() && hasErrors
                            ? "border-rose-500 bg-rose-50/30 focus:ring-rose-500"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-slate-900 focus:border-slate-900"
                        )}
                      />
                    </div>

                    {/* Amount (5 cols) - Prominent, Unconstrained */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Amount (KES) *</span>
                        <span className="text-[10px] text-slate-400 font-normal">Unconstrained</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          KES
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) => handleUpdateRow(row.id, "amount", e.target.value)}
                          className={cn(
                            "w-full h-10 pl-11 pr-3 rounded-lg border text-sm sm:text-base font-mono font-bold focus:outline-none focus:ring-1 transition-all",
                            (!row.amount || parseFloat(row.amount) <= 0) && hasErrors
                              ? "border-rose-500 bg-rose-50/30 focus:ring-rose-500"
                              : "border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-slate-900 focus:border-slate-900"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Date, Ledger Book & Payment Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Transaction Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => handleUpdateRow(row.id, "date", e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>

                    {/* Ledger Book with [code] */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Ledger Account / Book *</span>
                        <span className="text-[10px] text-slate-400 font-normal">[Code] Name</span>
                      </label>
                      <select
                        value={row.ledger_book}
                        onChange={(e) => handleUpdateRow(row.id, "ledger_book", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 transition-all bg-slate-50/50 focus:bg-white",
                          !row.ledger_book && hasErrors
                            ? "border-rose-500 bg-rose-50/30 focus:ring-rose-500"
                            : "border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                        )}
                      >
                        <option value="">-- Select Ledger Account --</option>
                        {bookOptions.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label} ({b.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Payment Method *</label>
                      <select
                        value={row.payment_method}
                        onChange={(e) => handleUpdateRow(row.id, "payment_method", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 transition-all bg-slate-50/50 focus:bg-white",
                          !row.payment_method && hasErrors
                            ? "border-rose-500 bg-rose-50/30 focus:ring-rose-500"
                            : "border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                        )}
                      >
                        <option value="">-- Select Payment Method --</option>
                        {paymentMethods?.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4. Division, Journal Type & Partner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Division */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Division *</label>
                      <select
                        value={row.division}
                        onChange={(e) => handleUpdateRow(row.id, "division", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 transition-all bg-slate-50/50 focus:bg-white",
                          !row.division && hasErrors
                            ? "border-rose-500 bg-rose-50/30 focus:ring-rose-500"
                            : "border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                        )}
                      >
                        <option value="">-- Select Division --</option>
                        {divisions?.map((d) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Journal Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Journal Type *</label>
                      <select
                        value={row.journal_type}
                        onChange={(e) => handleUpdateRow(row.id, "journal_type", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 transition-all bg-slate-50/50 focus:bg-white",
                          !row.journal_type && hasErrors
                            ? "border-rose-500 bg-rose-50/30 focus:ring-rose-500"
                            : "border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                        )}
                      >
                        <option value="">-- Select Journal Type --</option>
                        {journalTypes?.map((j) => (
                          <option key={j.name} value={j.name}>{j.name} ({j.code})</option>
                        ))}
                      </select>
                    </div>

                    {/* Partner (Optional) */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Partner / Customer</span>
                        <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                      </label>
                      <select
                        value={row.partner}
                        onChange={(e) => handleUpdateRow(row.id, "partner", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-medium outline-none"
                      >
                        <option value="">-- None (Internal / Walk-in) --</option>
                        {partners?.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 5. Documentation & File Upload (Key user requirement!) */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Supporting Documentation &amp; Audit Trail
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Source Document */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Source Document</label>
                        <input
                          type="text"
                          placeholder="e.g. Invoice, Tax Receipt"
                          value={row.source_document}
                          onChange={(e) => handleUpdateRow(row.id, "source_document", e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-medium outline-none"
                        />
                      </div>

                      {/* Document Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Document / Ref Number</label>
                        <input
                          type="text"
                          placeholder="e.g. INV-2026-092, E-TIMS 99"
                          value={row.document_number}
                          onChange={(e) => handleUpdateRow(row.id, "document_number", e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-medium outline-none"
                        />
                      </div>

                      {/* File Upload Input - Retained & Prominent! */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>Attachment / Receipt File</span>
                          {row.document_file && (
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, "document_file", null)}
                              className="text-[10px] text-rose-600 hover:underline"
                            >
                              Remove file
                            </button>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            id={`file_input_${row.id}`}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUpdateRow(row.id, "document_file", e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor={`file_input_${row.id}`}
                            className={cn(
                              "flex items-center gap-2 px-3 h-10 border border-dashed rounded-lg cursor-pointer transition-colors",
                              row.document_file
                                ? "bg-emerald-50/60 border-emerald-300 text-emerald-800"
                                : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-100"
                            )}
                          >
                            <FileUp className={cn("w-4 h-4 flex-shrink-0", row.document_file ? "text-emerald-600" : "text-slate-400")} />
                            <span className="text-xs truncate font-medium flex-1">
                              {row.document_file ? row.document_file.name : "Upload invoice or receipt..."}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Another Transaction Button */}
        <button
          type="button"
          onClick={handleAddRow}
          className="w-full py-3.5 border-2 border-dashed border-slate-300 hover:border-slate-900 hover:bg-white rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Transaction Entry</span>
        </button>
      </div>

      {/* Sticky Responsive Summary Footer */}
      <div className="bg-white border-t border-slate-200 p-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 shadow-lg">
        {/* Financial Totals */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Money Out:</span>
            <span className="font-mono font-bold text-rose-600">
              KES {formatNumber(totalOut)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Money In:</span>
            <span className="font-mono font-bold text-emerald-600">
              KES {formatNumber(totalIn)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
            <span className="text-slate-700 font-bold">Net Balance:</span>
            <span
              className={cn(
                "font-mono font-extrabold text-sm",
                netBalance >= 0 ? "text-emerald-700" : "text-rose-700"
              )}
            >
              KES {formatNumber(netBalance)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors flex-1 sm:flex-none text-center"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={bulkCreateMutation.isPending || isDataLoading}
            onClick={handleSubmit}
            className="h-10 px-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 flex-1 sm:flex-none"
          >
            {bulkCreateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Posting Batch Entries...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Post {rows.length} Batch {rows.length === 1 ? "Entry" : "Entries"} &amp; Post Journals</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
