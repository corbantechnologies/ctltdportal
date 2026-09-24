/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  FileText,
  DollarSign,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
  Users,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/tools/format";
import { formatBackendError } from "@/lib/error-handler";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useCreateJournalStudio } from "@/hooks/journals/actions";
import SearchableSelect from "@/components/portal/SearchableSelect";

export interface JournalLineItem {
  id: string;
  book: string;
  division: string;
  partner: string;
  debit: string;
  credit: string;
  notes: string;
}

interface JournalBatchStudioProps {
  fiscalYearRef?: string;
  rolePrefix?: string;
  onSuccess?: (createdJournal: any) => void;
  onCancel?: () => void;
}

export default function JournalBatchStudio({
  fiscalYearRef,
  rolePrefix = "finance",
  onSuccess,
  onCancel,
}: JournalBatchStudioProps) {
  const router = useRouter();

  const { data: books, isLoading: loadingBooks } = useFetchBooks();
  const { data: divisions, isLoading: loadingDivisions } = useFetchDivisions();
  const { data: journalTypes, isLoading: loadingJournalTypes } = useFetchJournalTypes();
  const { data: partners } = useFetchPartners();

  const createStudioMutation = useCreateJournalStudio();

  // Header State
  const [headerState, setHeaderState] = useState({
    date: new Date().toISOString().split("T")[0],
    journal_type: "",
    description: "",
    currency: "KES",
    default_division: "",
  });

  // Entry Lines State - Initialize with balanced 2 lines by default
  const [lines, setLines] = useState<JournalLineItem[]>([
    {
      id: "line-1",
      book: "",
      division: "",
      partner: "",
      debit: "",
      credit: "0",
      notes: "",
    },
    {
      id: "line-2",
      book: "",
      division: "",
      partner: "",
      debit: "0",
      credit: "",
      notes: "",
    },
  ]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Options
  const bookOptions = useMemo(
    () =>
      books?.map((b) => ({
        value: b.name,
        label: b.code ? `[${b.code}] ${b.name}` : b.name,
        secondaryLabel: b.account_type,
      })) || [],
    [books]
  );

  const divisionOptions = useMemo(
    () => divisions?.map((d) => ({ value: d.name, label: d.name })) || [],
    [divisions]
  );

  const journalTypeOptions = useMemo(
    () =>
      journalTypes?.map((j) => ({
        value: j.name,
        label: j.name,
        secondaryLabel: j.code,
      })) || [],
    [journalTypes]
  );

  const partnerOptions = useMemo(
    () => partners?.map((p) => ({ value: p.name, label: p.name })) || [],
    [partners]
  );

  // Live Totals
  const totalDebit = lines.reduce(
    (sum, l) => sum + (parseFloat(l.debit) || 0),
    0
  );
  const totalCredit = lines.reduce(
    (sum, l) => sum + (parseFloat(l.credit) || 0),
    0
  );
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  // Row Manipulation
  const handleUpdateLine = (id: string, field: keyof JournalLineItem, value: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        // If entering a debit amount > 0, auto-zero credit for clarity
        if (field === "debit" && parseFloat(value) > 0) {
          updated.credit = "0";
        }
        // If entering a credit amount > 0, auto-zero debit
        if (field === "credit" && parseFloat(value) > 0) {
          updated.debit = "0";
        }
        return updated;
      })
    );
  };

  const handleAddLine = () => {
    // If there is an imbalance, prefill the next line with the missing side!
    let suggestedDebit = "0";
    let suggestedCredit = "0";
    if (totalDebit > totalCredit) {
      suggestedCredit = (totalDebit - totalCredit).toFixed(2);
    } else if (totalCredit > totalDebit) {
      suggestedDebit = (totalCredit - totalDebit).toFixed(2);
    }

    const newLine: JournalLineItem = {
      id: Math.random().toString(36).substring(2, 9),
      book: "",
      division: headerState.default_division || (divisions?.[0]?.name ?? ""),
      partner: "",
      debit: suggestedDebit !== "0" ? suggestedDebit : "",
      credit: suggestedCredit !== "0" ? suggestedCredit : "",
      notes: "",
    };
    setLines((prev) => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 2) {
      toast.error("A double-entry journal requires at least two lines.");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDuplicateLine = (id: string) => {
    const target = lines.find((l) => l.id === id);
    if (!target) return;
    const duplicated: JournalLineItem = {
      ...target,
      id: Math.random().toString(36).substring(2, 9),
    };
    setLines((prev) => [...prev, duplicated]);
    toast.success("Line duplicated");
  };

  // Validation
  const validateForm = (isPosting: boolean) => {
    const errors: string[] = [];
    if (!headerState.date) errors.push("Transaction Date is required.");
    if (!headerState.journal_type) errors.push("Journal Category is required.");
    if (!headerState.description.trim()) errors.push("Batch Narrative/Description is required.");

    const validLines = lines.filter((l) => l.book && ((parseFloat(l.debit) || 0) > 0 || (parseFloat(l.credit) || 0) > 0));
    if (validLines.length < 2) {
      errors.push("At least two valid line entries with assigned books and amounts are required.");
    }

    if (isPosting) {
      if (!isBalanced) {
        errors.push(`Journal is out of balance. Total Debit (KES ${formatNumber(totalDebit)}) does not equal Total Credit (KES ${formatNumber(totalCredit)}).`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (postNow: boolean) => {
    if (!validateForm(postNow)) {
      toast.error(validationErrors[0] || "Please resolve form validation errors.");
      return;
    }

    try {
      const payload = {
        date: headerState.date,
        journal_type: headerState.journal_type,
        description: headerState.description.trim(),
        currency: headerState.currency,
        post_now: postNow,
        entries: lines
          .filter((l) => l.book)
          .map((l) => ({
            book: l.book,
            division: l.division || headerState.default_division || undefined,
            partner: l.partner || undefined,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            notes: l.notes || undefined,
          })),
      };

      const res = await createStudioMutation.mutateAsync(payload);
      toast.success(
        postNow
          ? `Journal ${res.code} created & posted to General Ledger!`
          : `Journal ${res.code} created as Draft.`
      );

      if (onSuccess) {
        onSuccess(res);
      } else if (fiscalYearRef) {
        router.push(`/finance/fiscal-years/${fiscalYearRef}/journals/${res.reference}`);
      } else {
        router.push(`/finance/journal-entries`);
      }
    } catch (error: any) {
      toast.error(formatBackendError(error, "Failed to create journal batch"));
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto w-full">
      {/* Studio Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            className="w-10 h-10 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600 shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                Journal Studio
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Unified Double-Entry Workbench
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Create Journal Batch
            </h1>
          </div>
        </div>

        {/* Live Balance Status Badge */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs",
            isBalanced
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : "bg-rose-50 text-rose-700 border-rose-300"
          )}
        >
          {isBalanced ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>BALANCED (Diff: KES 0.00)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>OUT OF BALANCE (Diff: KES {formatNumber(diff)})</span>
            </>
          )}
        </div>
      </div>

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Please complete the following requirements:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 ml-2 font-medium">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Batch Header Reconciliation Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Batch Header Specification
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Auto-linked to active Financial Month
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Transaction Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={headerState.date}
                onChange={(e) => setHeaderState((p) => ({ ...p, date: e.target.value }))}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Journal Category */}
          <div className="space-y-1.5">
            <SearchableSelect
              label="Journal Category *"
              options={journalTypeOptions}
              value={headerState.journal_type}
              onChange={(val) => setHeaderState((p) => ({ ...p, journal_type: val }))}
              placeholder="Select Category..."
              required
              disabled={loadingJournalTypes}
            />
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Base Currency <span className="text-rose-500">*</span>
            </label>
            <select
              value={headerState.currency}
              onChange={(e) => setHeaderState((p) => ({ ...p, currency: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          {/* Default Division */}
          <div className="space-y-1.5">
            <SearchableSelect
              label="Default Division (Optional)"
              options={divisionOptions}
              value={headerState.default_division}
              onChange={(val) => {
                setHeaderState((p) => ({ ...p, default_division: val }));
                // Propagate to lines that don't have a division set yet
                setLines((prev) =>
                  prev.map((l) => (!l.division ? { ...l, division: val } : l))
                );
              }}
              placeholder="Select Division..."
              disabled={loadingDivisions}
            />
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Batch Narrative / Description *</span>
            <span className="text-[10px] text-slate-400 font-normal">
              e.g. Month-end depreciation adjustment, Monthly software licenses
            </span>
          </label>
          <input
            type="text"
            required
            placeholder="Provide a descriptive summary of this journal batch..."
            value={headerState.description}
            onChange={(e) => setHeaderState((p) => ({ ...p, description: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Section 2: Interactive Double-Entry Lines Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Journal Line Entries
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Enter balanced debits and credits. Every transaction must sum to zero difference.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddLine}
            className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry Line</span>
          </button>
        </div>

        {/* Lines Container: Desktop Table & Mobile Cards */}
        <div className="space-y-3">
          {lines.map((line, idx) => {
            const hasDebit = (parseFloat(line.debit) || 0) > 0;
            const hasCredit = (parseFloat(line.credit) || 0) > 0;

            return (
              <div
                key={line.id}
                className={cn(
                  "p-3 sm:p-4 rounded-xl border transition-all space-y-3",
                  hasDebit
                    ? "bg-emerald-50/20 border-emerald-200"
                    : hasCredit
                    ? "bg-rose-50/20 border-rose-200"
                    : "bg-slate-50/50 border-slate-200"
                )}
              >
                {/* Line Index & Side Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                        hasDebit
                          ? "bg-emerald-600 text-white"
                          : hasCredit
                          ? "bg-rose-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {hasDebit ? "DEBIT (DR)" : hasCredit ? "CREDIT (CR)" : "UNASSIGNED"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Duplicate Line"
                      onClick={() => handleDuplicateLine(line.id)}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Line"
                      onClick={() => handleRemoveLine(line.id)}
                      className="p-1.5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Line Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Ledger Book (Account) - 4 cols */}
                  <div className="sm:col-span-4 space-y-1">
                    <SearchableSelect
                      label="Ledger Book [Code] *"
                      options={bookOptions}
                      value={line.book}
                      onChange={(val) => handleUpdateLine(line.id, "book", val)}
                      placeholder="Select Account Book..."
                      required
                      disabled={loadingBooks}
                    />
                  </div>

                  {/* Division - 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <SearchableSelect
                      label="Division"
                      options={divisionOptions}
                      value={line.division}
                      onChange={(val) => handleUpdateLine(line.id, "division", val)}
                      placeholder="Division..."
                      disabled={loadingDivisions}
                    />
                  </div>

                  {/* Partner (Optional) - 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <SearchableSelect
                      label="Partner (Opt)"
                      options={partnerOptions}
                      value={line.partner}
                      onChange={(val) => handleUpdateLine(line.id, "partner", val)}
                      placeholder="Partner..."
                    />
                  </div>

                  {/* Debit Amount - 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Debit (DR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={line.debit}
                        onChange={(e) => handleUpdateLine(line.id, "debit", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-1 transition-all",
                          hasDebit
                            ? "bg-white border-emerald-400 text-emerald-800 focus:ring-emerald-600"
                            : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-slate-900"
                        )}
                      />
                    </div>
                  </div>

                  {/* Credit Amount - 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Credit (CR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={line.credit}
                        onChange={(e) => handleUpdateLine(line.id, "credit", e.target.value)}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-1 transition-all",
                          hasCredit
                            ? "bg-white border-rose-400 text-rose-800 focus:ring-rose-600"
                            : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-slate-900"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Line Notes (Optional) */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Line notes or item reference (optional)..."
                    value={line.notes}
                    onChange={(e) => handleUpdateLine(line.id, "notes", e.target.value)}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white/70 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Reconciliation & Submission Bar */}
      <div className="sticky bottom-0 z-30 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Live Reconciliation Stats */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Debits
              </p>
              <p className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                KES {formatNumber(totalDebit)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Credits
              </p>
              <p className="text-base sm:text-lg font-mono font-bold text-rose-400">
                KES {formatNumber(totalCredit)}
              </p>
            </div>

            <div className="border-l border-slate-700 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Reconciliation Balance
              </p>
              <p
                className={cn(
                  "text-base sm:text-lg font-mono font-black",
                  isBalanced ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {isBalanced
                  ? "KES 0.00 (Balanced ✓)"
                  : `Diff: KES ${formatNumber(diff)}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={createStudioMutation.isPending}
              onClick={() => handleSubmit(false)}
              className="h-11 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={createStudioMutation.isPending || !isBalanced}
              onClick={() => handleSubmit(true)}
              className={cn(
                "h-11 px-6 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50",
                isBalanced
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              <Lock className="w-4 h-4" />
              <span>Save &amp; Post to GL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
