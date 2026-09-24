/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Layers,
  Calendar,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  FileSpreadsheet,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Receipt,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/tools/format";
import { formatBackendError } from "@/lib/error-handler";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useBulkCreateJournalBatches } from "@/hooks/journals/actions";
import SearchableSelect from "@/components/portal/SearchableSelect";
import { downloadCSV } from "@/tools/csvExport";

export interface BulkBatchLine {
  id: string;
  book: string;
  division: string;
  partner: string;
  debit: string;
  credit: string;
  notes: string;
}

export interface BulkBatchItem {
  id: string;
  date: string;
  journal_type: string;
  description: string;
  currency: string;
  default_division: string;
  lines: BulkBatchLine[];
  isOpen: boolean;
}

const createEmptyBatch = (
  defaults?: Partial<BulkBatchItem>,
  isOpen = true
): BulkBatchItem => ({
  id: Math.random().toString(36).substring(2, 9),
  date: defaults?.date || new Date().toISOString().split("T")[0],
  journal_type: defaults?.journal_type || "",
  description: defaults?.description || "",
  currency: defaults?.currency || "KES",
  default_division: defaults?.default_division || "",
  isOpen: isOpen,
  lines: [
    {
      id: "line-1",
      book: "",
      division: defaults?.default_division || "",
      partner: "",
      debit: "",
      credit: "0",
      notes: "",
    },
    {
      id: "line-2",
      book: "",
      division: defaults?.default_division || "",
      partner: "",
      debit: "0",
      credit: "",
      notes: "",
    },
  ],
});

export default function BulkJournalStudio({
  fiscalYearRef,
  onSuccess,
  onCancel,
}: {
  fiscalYearRef?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: books, isLoading: loadingBooks } = useFetchBooks();
  const { data: divisions, isLoading: loadingDivisions } = useFetchDivisions();
  const { data: journalTypes, isLoading: loadingJournalTypes } = useFetchJournalTypes();
  const { data: partners } = useFetchPartners();

  const bulkCreateMutation = useBulkCreateJournalBatches();

  // Quick-fill defaults bar
  const [quickDefaults, setQuickDefaults] = useState({
    date: new Date().toISOString().split("T")[0],
    journal_type: "",
    default_division: "",
    currency: "KES",
  });
  const [showDefaultsBar, setShowDefaultsBar] = useState(false);

  // Batches state
  const [batches, setBatches] = useState<BulkBatchItem[]>([
    createEmptyBatch({}, true),
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Options
  const bookOptions = useMemo(
    () =>
      books?.map((b) => ({
        value: b.name,
        label: b.code ? `[${b.code}] ${b.name}` : b.name,
        code: b.code,
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

  // Overall totals across all batches
  const overallTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    let unbalancedCount = 0;

    batches.forEach((b) => {
      const bDebit = b.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
      const bCredit = b.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
      totalDebit += bDebit;
      totalCredit += bCredit;

      if (Math.abs(bDebit - bCredit) > 0.01 || bDebit === 0) {
        unbalancedCount += 1;
      }
    });

    return { totalDebit, totalCredit, unbalancedCount };
  }, [batches]);

  // Batch Manipulation
  const handleUpdateBatchHeader = (batchId: string, field: keyof BulkBatchItem, value: any) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, [field]: value } : b))
    );
  };

  const handleUpdateBatchLine = (
    batchId: string,
    lineId: string,
    field: keyof BulkBatchLine,
    value: string
  ) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          lines: b.lines.map((l) => {
            if (l.id !== lineId) return l;
            const updated = { ...l, [field]: value };
            if (field === "debit" && parseFloat(value) > 0) updated.credit = "0";
            if (field === "credit" && parseFloat(value) > 0) updated.debit = "0";
            return updated;
          }),
        };
      })
    );
  };

  const handleAddLineToBatch = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const bDebit = b.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
        const bCredit = b.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);

        let suggestedDebit = "0";
        let suggestedCredit = "0";
        if (bDebit > bCredit) suggestedCredit = (bDebit - bCredit).toFixed(2);
        else if (bCredit > bDebit) suggestedDebit = (bCredit - bDebit).toFixed(2);

        const newLine: BulkBatchLine = {
          id: Math.random().toString(36).substring(2, 9),
          book: "",
          division: b.default_division || (divisions?.[0]?.name ?? ""),
          partner: "",
          debit: suggestedDebit !== "0" ? suggestedDebit : "",
          credit: suggestedCredit !== "0" ? suggestedCredit : "",
          notes: "",
        };

        return { ...b, lines: [...b.lines, newLine] };
      })
    );
  };

  const handleRemoveLineFromBatch = (batchId: string, lineId: string) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        if (b.lines.length <= 2) {
          toast.error("Every journal batch requires at least two lines.");
          return b;
        }
        return { ...b, lines: b.lines.filter((l) => l.id !== lineId) };
      })
    );
  };

  const handleToggleAccordion = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, isOpen: !b.isOpen } : b))
    );
  };

  const handleAddBatch = () => {
    // Collapse existing batches to keep clean layout
    setBatches((prev) => [
      ...prev.map((b) => ({ ...b, isOpen: false })),
      createEmptyBatch(
        {
          date: quickDefaults.date,
          journal_type: quickDefaults.journal_type,
          default_division: quickDefaults.default_division,
          currency: quickDefaults.currency,
        },
        true
      ),
    ]);
  };

  const handleDuplicateBatch = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = batches.find((b) => b.id === batchId);
    if (!source) return;

    const duplicated: BulkBatchItem = {
      ...source,
      id: Math.random().toString(36).substring(2, 9),
      description: source.description ? `${source.description} (Copy)` : "",
      isOpen: true,
      lines: source.lines.map((l) => ({
        ...l,
        id: Math.random().toString(36).substring(2, 9),
      })),
    };

    setBatches((prev) => [
      ...prev.map((b) => ({ ...b, isOpen: false })),
      duplicated,
    ]);
    toast.success("Batch duplicated");
  };

  const handleRemoveBatch = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (batches.length === 1) {
      toast.error("At least one journal batch is required.");
      return;
    }
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  const handleExpandAll = () => {
    setBatches((prev) => prev.map((b) => ({ ...b, isOpen: true })));
  };

  const handleCollapseAll = () => {
    setBatches((prev) => prev.map((b) => ({ ...b, isOpen: false })));
  };

  // CSV Template & Import
  const handleDownloadTemplate = () => {
    const headers = [
      "batch_date",
      "journal_category",
      "batch_narrative",
      "currency",
      "book",
      "division",
      "debit",
      "credit",
      "partner",
      "notes",
    ];
    const sampleRows = [
      [
        new Date().toISOString().split("T")[0],
        "General Journal",
        "Monthly Software Subscriptions",
        "KES",
        books?.[0]?.name || "Software Licenses",
        divisions?.[0]?.name || "Nairobi",
        "25000",
        "0",
        "",
        "AWS Cloud Hosting",
      ],
      [
        new Date().toISOString().split("T")[0],
        "General Journal",
        "Monthly Software Subscriptions",
        "KES",
        books?.[1]?.name || "Operating Bank",
        divisions?.[0]?.name || "Nairobi",
        "0",
        "25000",
        "",
        "Corporate Card Payment",
      ],
    ];

    const csvContent =
      headers.join(",") +
      "\n" +
      sampleRows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    downloadCSV(csvContent, "journal_batches_template.csv");
    toast.success("Downloaded sample CSV template");
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const linesArr = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (linesArr.length < 2) {
          toast.error("CSV file is empty or missing data rows.");
          return;
        }

        // Group rows by batch_narrative or date+narrative
        const groups: Record<string, any[]> = {};
        for (let i = 1; i < linesArr.length; i++) {
          const cols = linesArr[i]
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map((c) => c.replace(/^"|"$/g, "").trim());

          if (cols.length < 6) continue;
          const [
            bDate,
            bCat,
            bDesc,
            bCurr,
            book,
            division,
            debit,
            credit,
            partner,
            notes,
          ] = cols;

          const groupKey = bDesc || `Batch ${i}`;
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push({
            date: bDate || new Date().toISOString().split("T")[0],
            journal_type: bCat || "General Journal",
            description: bDesc || "Imported Journal Batch",
            currency: bCurr || "KES",
            book: book || "",
            division: division || "",
            debit: debit || "0",
            credit: credit || "0",
            partner: partner || "",
            notes: notes || "",
          });
        }

        const newBatches: BulkBatchItem[] = Object.keys(groups).map((desc, idx) => {
          const groupEntries = groups[desc];
          const first = groupEntries[0];

          return {
            id: Math.random().toString(36).substring(2, 9),
            date: first.date,
            journal_type: first.journal_type,
            description: first.description,
            currency: first.currency,
            default_division: first.division,
            isOpen: idx === 0, // open first one
            lines: groupEntries.map((e: any) => ({
              id: Math.random().toString(36).substring(2, 9),
              book: e.book,
              division: e.division,
              partner: e.partner,
              debit: e.debit,
              credit: e.credit,
              notes: e.notes,
            })),
          };
        });

        if (newBatches.length > 0) {
          setBatches(newBatches);
          toast.success(`Imported ${newBatches.length} batch(es) from CSV.`);
        } else {
          toast.error("Could not parse any valid batches from CSV.");
        }
      } catch (err: any) {
        toast.error("Failed to parse CSV file: " + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Validation
  const validateAll = (isPosting: boolean) => {
    const errors: Record<string, string[]> = {};

    batches.forEach((b, idx) => {
      const bErrs: string[] = [];
      if (!b.date) bErrs.push("Transaction Date is required");
      if (!b.journal_type) bErrs.push("Journal Category is required");
      if (!b.description.trim()) bErrs.push("Batch Narrative is required");

      const validLines = b.lines.filter(
        (l) => l.book && ((parseFloat(l.debit) || 0) > 0 || (parseFloat(l.credit) || 0) > 0)
      );
      if (validLines.length < 2) {
        bErrs.push("Requires at least 2 valid lines with assigned book and amount");
      }

      const bDebit = b.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
      const bCredit = b.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);

      if (isPosting && Math.abs(bDebit - bCredit) > 0.01) {
        bErrs.push(`Unbalanced (Debit: ${formatNumber(bDebit)} != Credit: ${formatNumber(bCredit)})`);
      }

      if (bErrs.length > 0) {
        errors[b.id] = bErrs;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (postNow: boolean) => {
    if (!validateAll(postNow)) {
      // Auto-open batches with errors
      setBatches((prev) =>
        prev.map((b) => (validationErrors[b.id] ? { ...b, isOpen: true } : b))
      );
      toast.error(`Please fix validation errors in ${Object.keys(validationErrors).length} batch(es).`);
      return;
    }

    try {
      const payloadBatches = batches.map((b) => ({
        date: b.date,
        journal_type: b.journal_type,
        description: b.description.trim(),
        currency: b.currency,
        post_now: postNow,
        entries: b.lines
          .filter((l) => l.book)
          .map((l) => ({
            book: l.book,
            division: l.division || b.default_division || undefined,
            partner: l.partner || undefined,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            notes: l.notes || undefined,
          })),
      }));

      const res = await bulkCreateMutation.mutateAsync(payloadBatches);
      toast.success(
        postNow
          ? `Successfully created & posted ${res.count} journal batch(es) to GL!`
          : `Successfully created ${res.count} draft journal batch(es)!`
      );

      if (onSuccess) {
        onSuccess();
      } else if (fiscalYearRef) {
        router.push(`/finance/fiscal-years/${fiscalYearRef}/journals`);
      } else {
        router.push(`/finance/journal-entries`);
      }
    } catch (error: any) {
      toast.error(formatBackendError(error, "Failed to create journal batches"));
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto w-full">
      {/* Studio Header */}
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
                Bulk Batch Studio
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Multi-Batch Double-Entry &amp; CSV Import
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Bulk Journal Batches
            </h1>
          </div>
        </div>

        {/* Top Action Buttons (CSV Import & Template) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDefaultsBar(!showDefaultsBar)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{showDefaultsBar ? "Hide Defaults" : "Batch Presets"}</span>
          </button>
        </div>
      </div>

      {/* Quick-Fill Defaults Bar */}
      {showDefaultsBar && (
        <div className="p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Batch Quick-Fill Presets
              </h3>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Applied automatically to newly added batches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">Default Date</label>
              <input
                type="date"
                value={quickDefaults.date}
                onChange={(e) => setQuickDefaults((p) => ({ ...p, date: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-amber-300 bg-white text-xs font-semibold"
              />
            </div>
            <div>
              <SearchableSelect
                label="Default Category"
                options={journalTypeOptions}
                value={quickDefaults.journal_type}
                onChange={(val) => setQuickDefaults((p) => ({ ...p, journal_type: val }))}
                placeholder="Category..."
              />
            </div>
            <div>
              <SearchableSelect
                label="Default Division"
                options={divisionOptions}
                value={quickDefaults.default_division}
                onChange={(val) => setQuickDefaults((p) => ({ ...p, default_division: val }))}
                placeholder="Division..."
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setBatches((prev) =>
                    prev.map((b) => ({
                      ...b,
                      date: quickDefaults.date || b.date,
                      journal_type: quickDefaults.journal_type || b.journal_type,
                      default_division: quickDefaults.default_division || b.default_division,
                    }))
                  );
                  toast.success("Applied defaults to all batches");
                }}
                className="w-full h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accordion Controls Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {batches.length} Batch{batches.length > 1 ? "es" : ""} Staged
          </span>
          {overallTotals.unbalancedCount > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
              {overallTotals.unbalancedCount} Unbalanced
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
              All Balanced ✓
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExpandAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expand All</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Batches Accordion Cards List */}
      <div className="space-y-4">
        {batches.map((batch, batchIdx) => {
          const isOpen = batch.isOpen;
          const errors = validationErrors[batch.id];
          const hasErrors = Boolean(errors && errors.length > 0);

          const bDebit = batch.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
          const bCredit = batch.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
          const bDiff = Math.abs(bDebit - bCredit);
          const isBatchBalanced = bDiff < 0.01 && bDebit > 0;

          return (
            <div
              key={batch.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden bg-white shadow-xs",
                isOpen
                  ? "border-slate-300 ring-2 ring-slate-900/5 shadow-md"
                  : hasErrors
                  ? "border-rose-300 bg-rose-50/20"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              {/* Accordion Header Bar */}
              <div
                onClick={() => handleToggleAccordion(batch.id)}
                className={cn(
                  "p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b",
                  isOpen
                    ? "bg-slate-900 text-white border-slate-800"
                    : "bg-white hover:bg-slate-50 text-slate-900 border-slate-100"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Batch Index */}
                  <span
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0",
                      isOpen ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    #{batchIdx + 1}
                  </span>

                  {/* Category Pill */}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0",
                      isOpen
                        ? "bg-white/10 text-slate-200 border border-white/20"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    )}
                  >
                    {batch.journal_type || "Uncategorized"}
                  </span>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1 truncate">
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-bold truncate",
                        isOpen ? "text-white" : "text-slate-900"
                      )}
                    >
                      {batch.description ? (
                        batch.description
                      ) : (
                        <span className="text-slate-400 italic font-normal">
                          Untitled Journal Batch
                        </span>
                      )}
                    </p>
                    {!isOpen && (
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                        <span>{batch.date}</span>
                        <span>&bull; {batch.lines.length} Line(s)</span>
                        {batch.default_division && (
                          <span>&bull; {batch.default_division}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Amount / Balance Indicator */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-mono font-bold block",
                        isOpen ? "text-white" : "text-slate-900"
                      )}
                    >
                      KES {formatNumber(bDebit)}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isBatchBalanced
                          ? "text-emerald-400"
                          : isOpen
                          ? "text-amber-400"
                          : "text-rose-600"
                      )}
                    >
                      {isBatchBalanced ? "Balanced ✓" : `Diff: ${formatNumber(bDiff)}`}
                    </span>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    title="Duplicate Batch"
                    onClick={(e) => handleDuplicateBatch(batch.id, e)}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      isOpen
                        ? "hover:bg-white/20 text-slate-300 hover:text-white"
                        : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Delete Batch"
                    onClick={(e) => handleRemoveBatch(batch.id, e)}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      isOpen
                        ? "hover:bg-rose-500/30 text-rose-300 hover:text-rose-100"
                        : "hover:bg-rose-100 text-slate-400 hover:text-rose-600"
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

              {/* Accordion Expanded Body */}
              {isOpen && (
                <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200 bg-white">
                  {/* Validation Error Banner */}
                  {hasErrors && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Required fields for Batch #{batchIdx + 1}:</p>
                        <ul className="list-disc list-inside mt-1 text-[11px] space-y-0.5">
                          {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Batch Header Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Transaction Date *
                      </label>
                      <input
                        type="date"
                        value={batch.date}
                        onChange={(e) =>
                          handleUpdateBatchHeader(batch.id, "date", e.target.value)
                        }
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold outline-none"
                      />
                    </div>

                    {/* Journal Category */}
                    <div className="space-y-1">
                      <SearchableSelect
                        label="Journal Category *"
                        options={journalTypeOptions}
                        value={batch.journal_type}
                        onChange={(val) =>
                          handleUpdateBatchHeader(batch.id, "journal_type", val)
                        }
                        placeholder="Category..."
                        disabled={loadingJournalTypes}
                      />
                    </div>

                    {/* Base Currency */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Currency
                      </label>
                      <select
                        value={batch.currency}
                        onChange={(e) =>
                          handleUpdateBatchHeader(batch.id, "currency", e.target.value)
                        }
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold outline-none"
                      >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>

                    {/* Default Division */}
                    <div className="space-y-1">
                      <SearchableSelect
                        label="Default Division"
                        options={divisionOptions}
                        value={batch.default_division}
                        onChange={(val) =>
                          handleUpdateBatchHeader(batch.id, "default_division", val)
                        }
                        placeholder="Division..."
                        disabled={loadingDivisions}
                      />
                    </div>
                  </div>

                  {/* Batch Narrative */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Batch Narrative / Description *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. End of month depreciation, Petty cash settlement..."
                      value={batch.description}
                      onChange={(e) =>
                        handleUpdateBatchHeader(batch.id, "description", e.target.value)
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium outline-none"
                    />
                  </div>

                  {/* Child Lines Section */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Double-Entry Lines ({batch.lines.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddLineToBatch(batch.id)}
                        className="h-8 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Line</span>
                      </button>
                    </div>

                    {/* Lines List */}
                    <div className="space-y-2">
                      {batch.lines.map((line, lIdx) => {
                        const hasDebit = (parseFloat(line.debit) || 0) > 0;
                        const hasCredit = (parseFloat(line.credit) || 0) > 0;

                        return (
                          <div
                            key={line.id}
                            className={cn(
                              "p-3 rounded-lg border transition-all space-y-2",
                              hasDebit
                                ? "bg-emerald-50/20 border-emerald-200"
                                : hasCredit
                                ? "bg-rose-50/20 border-rose-200"
                                : "bg-slate-50/50 border-slate-200"
                            )}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-400">Line #{lIdx + 1}</span>
                              <span
                                className={cn(
                                  "px-1.5 py-0.2 rounded text-[9px] uppercase",
                                  hasDebit
                                    ? "bg-emerald-600 text-white"
                                    : hasCredit
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-200 text-slate-600"
                                )}
                              >
                                {hasDebit ? "DR" : hasCredit ? "CR" : "—"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                              {/* Account Book - 4 cols */}
                              <div className="sm:col-span-4">
                                <SearchableSelect
                                  label="Book [Code] *"
                                  options={bookOptions}
                                  value={line.book}
                                  onChange={(val) =>
                                    handleUpdateBatchLine(batch.id, line.id, "book", val)
                                  }
                                  placeholder="Book..."
                                  disabled={loadingBooks}
                                />
                              </div>

                              {/* Division - 2 cols */}
                              <div className="sm:col-span-2">
                                <SearchableSelect
                                  label="Division"
                                  options={divisionOptions}
                                  value={line.division}
                                  onChange={(val) =>
                                    handleUpdateBatchLine(batch.id, line.id, "division", val)
                                  }
                                  placeholder="Division..."
                                  disabled={loadingDivisions}
                                />
                              </div>

                              {/* Debit - 2 cols */}
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">
                                  Debit
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={line.debit}
                                  onChange={(e) =>
                                    handleUpdateBatchLine(batch.id, line.id, "debit", e.target.value)
                                  }
                                  className="w-full h-9 px-2 rounded border border-slate-200 text-xs font-mono font-bold outline-none"
                                />
                              </div>

                              {/* Credit - 2 cols */}
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">
                                  Credit
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={line.credit}
                                  onChange={(e) =>
                                    handleUpdateBatchLine(batch.id, line.id, "credit", e.target.value)
                                  }
                                  className="w-full h-9 px-2 rounded border border-slate-200 text-xs font-mono font-bold outline-none"
                                />
                              </div>

                              {/* Delete Line - 2 cols */}
                              <div className="sm:col-span-2 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLineFromBatch(batch.id, line.id)}
                                  className="h-9 px-2.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Batch Button */}
      <button
        type="button"
        onClick={handleAddBatch}
        className="w-full py-3.5 border-2 border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Add Another Journal Batch</span>
      </button>

      {/* Sticky Bottom Summary & Submission Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 sm:p-5 bg-slate-900 text-white shadow-2xl border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Totals */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Batches
              </p>
              <p className="text-base sm:text-lg font-mono font-bold text-white">
                {batches.length}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Debits
              </p>
              <p className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                KES {formatNumber(overallTotals.totalDebit)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Credits
              </p>
              <p className="text-base sm:text-lg font-mono font-bold text-rose-400">
                KES {formatNumber(overallTotals.totalCredit)}
              </p>
            </div>

            <div className="border-l border-slate-700 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Balancing Status
              </p>
              <p
                className={cn(
                  "text-xs sm:text-sm font-bold",
                  overallTotals.unbalancedCount === 0
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {overallTotals.unbalancedCount === 0
                  ? "All Batches Balanced ✓"
                  : `${overallTotals.unbalancedCount} Batch(es) Out of Balance`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={bulkCreateMutation.isPending}
              onClick={() => handleSubmit(false)}
              className="h-11 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 disabled:opacity-50"
            >
              Save All as Drafts
            </button>

            <button
              type="button"
              disabled={bulkCreateMutation.isPending || overallTotals.unbalancedCount > 0}
              onClick={() => handleSubmit(true)}
              className={cn(
                "h-11 px-6 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50",
                overallTotals.unbalancedCount === 0
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              <Lock className="w-4 h-4" />
              <span>Post All to GL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
