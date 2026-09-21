/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  useFetchSimpleTransactions,
  useBulkDeleteSimpleTransactions,
  useBulkJournalRetrySimpleTransactions,
} from "@/hooks/simpletransactions/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import CreateSimpleTransaction from "@/forms/simpletransactions/CreateSimpleTransaction";
import BulkTransactionsModal from "@/forms/simpletransactions/BulkTransactionsModal";
import ReverseJournalModal from "@/components/journals/ReverseJournalModal";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  Download,
  Trash2,
  RefreshCw,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { formatNumber } from "@/tools/format";
import { exportTransactionsToCSV } from "@/tools/csvExport";
import { cn } from "@/lib/utils";
import { formatBackendError } from "@/lib/error-handler";
import { SimpleTransaction, reverseSimpleTransaction } from "@/services/simpletransactions";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SimpleTransactionsPage() {
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInitialTab, setBulkInitialTab] = useState<"grid" | "csv">("grid");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = "20";
  const debouncedSearch = useDebounce(searchQuery, 500);

  const activeFilters: Record<string, string> = { page: page.toString(), limit };
  if (debouncedSearch) activeFilters["search"] = debouncedSearch;

  const { data: response, isLoading } = useFetchSimpleTransactions(activeFilters);
  const transactions: SimpleTransaction[] = response?.results || [];
  const totalCount = response?.count || 0;
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  const bulkDeleteMutation = useBulkDeleteSimpleTransactions();
  const bulkRetryMutation = useBulkJournalRetrySimpleTransactions();

  const header = useAxiosAuth();
  const queryClient = useQueryClient();
  const [selectedTxForReversal, setSelectedTxForReversal] = useState<SimpleTransaction | null>(null);
  const [isReversingTx, setIsReversingTx] = useState(false);

  const totalIn = transactions
    .filter((t) => t.transaction_type === "MONEY_IN")
    .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
  const totalOut = transactions
    .filter((t) => t.transaction_type === "MONEY_OUT")
    .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

  // Selection helpers
  const isAllPageSelected =
    transactions.length > 0 &&
    transactions.every((t) => selectedRefs.has(t.reference));

  const isSomePageSelected =
    transactions.some((t) => selectedRefs.has(t.reference)) && !isAllPageSelected;

  const handleToggleSelectAll = () => {
    if (isAllPageSelected) {
      // Unselect all visible on current page
      const next = new Set(selectedRefs);
      transactions.forEach((t) => next.delete(t.reference));
      setSelectedRefs(next);
    } else {
      // Select all visible on current page
      const next = new Set(selectedRefs);
      transactions.forEach((t) => next.add(t.reference));
      setSelectedRefs(next);
    }
  };

  const handleToggleSelectRow = (reference: string) => {
    const next = new Set(selectedRefs);
    if (next.has(reference)) {
      next.delete(reference);
    } else {
      next.add(reference);
    }
    setSelectedRefs(next);
  };

  const handleClearSelection = () => {
    setSelectedRefs(new Set());
  };

  const selectedTransactions = transactions.filter((t) =>
    selectedRefs.has(t.reference)
  );

  const selectedPendingJournalsCount = selectedTransactions.filter(
    (t) => !t.journal
  ).length;

  // Bulk Actions
  const handleExportSelected = () => {
    if (selectedTransactions.length === 0) {
      toast.error("No transactions selected to export.");
      return;
    }
    exportTransactionsToCSV(
      selectedTransactions,
      `selected_transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success(`Exported ${selectedTransactions.length} transactions to CSV.`);
  };

  const handleExportAll = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }
    exportTransactionsToCSV(
      transactions,
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast.success(`Exported ${transactions.length} transactions to CSV.`);
  };

  const handleExecuteBulkDelete = async () => {
    const refs = Array.from(selectedRefs);
    if (refs.length === 0) return;

    try {
      const res = await bulkDeleteMutation.mutateAsync(refs);
      if (res.skipped && res.skipped.length > 0) {
        toast(
          `Deleted ${res.deleted_count} unposted transaction(s). Skipped ${res.skipped.length} posted/reversed (GL protected).`,
          { icon: "⚠️" }
        );
      } else {
        toast.success(`Successfully deleted ${res.deleted_count} transaction(s).`);
      }
      setSelectedRefs(new Set());
      setShowDeleteConfirm(false);
    } catch (err: any) {
      toast.error(formatBackendError(err, "Failed to delete selected transactions"));
    }
  };

  const handleBulkRetryJournals = async () => {
    const refs = Array.from(selectedRefs);
    if (refs.length === 0) return;

    try {
      const res = await bulkRetryMutation.mutateAsync(refs);
      toast.success(
        `Generated ${res.success_count} journal(s). (${res.failed_count} errors)`
      );
      handleClearSelection();
    } catch (err: any) {
      toast.error(formatBackendError(err, "Failed to retry journal generation"));
    }
  };

  const handleReverseTransaction = async (data: { reversal_date: string; reason: string }) => {
    if (!selectedTxForReversal) return;
    try {
      setIsReversingTx(true);
      const res = await reverseSimpleTransaction(selectedTxForReversal.reference, data, header);
      toast.success(res.message || "Transaction successfully reversed in General Ledger");
      setSelectedTxForReversal(null);
      queryClient.invalidateQueries({ queryKey: ["simple-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    } catch (err: any) {
      toast.error(formatBackendError(err, "Failed to reverse transaction"));
    } finally {
      setIsReversingTx(false);
    }
  };

  return (
    <div className="space-y-5 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-lg sm:text-xl text-slate-900 tracking-tight font-bold">
            Quick <span className="text-slate-600 font-normal">Transactions</span>
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm max-w-lg">
            Log single or bulk transactions. A double-entry Journal is auto-generated for each record.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportAll}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 sm:px-4 h-10 sm:h-11 rounded font-semibold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Export current page to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setBulkInitialTab("grid");
              setShowBulkModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300/80 px-3.5 sm:px-4 h-10 sm:h-11 rounded font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Bulk / Import</span>
          </button>

          <button
            onClick={() => setShowSingleForm(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 sm:px-5 h-10 sm:h-11 rounded font-bold text-xs sm:text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex-1 sm:flex-initial justify-center"
          >
            <Plus className="w-4 h-4" />
            Log Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-black/5 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-sm">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              In
            </p>
            <p className="text-sm sm:text-base font-bold text-emerald-600 font-mono mt-0.5">
              {formatNumber(totalIn)}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-black/5 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-sm">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Out
            </p>
            <p className="text-sm sm:text-base font-bold text-red-600 font-mono mt-0.5">
              {formatNumber(totalOut)}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-black/5 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-sm">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-slate-900/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Total
            </p>
            <p className="text-sm sm:text-base font-bold text-slate-900 font-mono mt-0.5">
              {totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/60 p-3 sm:p-4 rounded-lg border border-white/60 backdrop-blur-md shadow-sm flex gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input
            type="text"
            placeholder="Search by description, code, book, payment method, division, partner..."
            className="pl-10 sm:pl-11 h-10 sm:h-11 w-full bg-white/90 border border-black/5 rounded-md font-medium text-xs sm:text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setPage(1);
            }}
            className="h-10 sm:h-11 w-10 sm:w-11 flex items-center justify-center border border-black/5 rounded-md bg-white hover:bg-red-50 hover:text-red-500 transition-all text-black/40 shadow-sm flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List / Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : transactions.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 overflow-hidden shadow-xl shadow-black/5 rounded-lg">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-black/5">
                  {/* Select All Checkbox */}
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                      title={isAllPageSelected ? "Deselect page" : "Select page"}
                    >
                      {isAllPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : isSomePageSelected ? (
                        <MinusSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Date & Ref
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Book / Method
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Journal
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status / Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {transactions.map((t: SimpleTransaction) => {
                  const isSelected = selectedRefs.has(t.reference);
                  return (
                    <tr
                      key={t.reference}
                      className={cn(
                        "transition-all group cursor-pointer",
                        isSelected ? "bg-slate-100/90" : "hover:bg-white/90"
                      )}
                      onClick={() => handleToggleSelectRow(t.reference)}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(t.reference)}
                          className="text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Date & Ref */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-black flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3 h-3 text-black/30" />
                            {new Date(t.date).toLocaleDateString("en-KE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-black/40 mt-1 uppercase font-semibold">
                            {t.code}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-black font-semibold">{t.name}</span>
                          {t.partner && (
                            <span className="text-xs text-black/50 mt-0.5">{t.partner}</span>
                          )}
                          <span className="text-[10px] text-black/40 mt-0.5 uppercase font-medium">
                            {t.division}
                          </span>
                        </div>
                      </td>

                      {/* Book / Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs text-black/80 font-semibold">{t.ledger_book}</span>
                          <span className="text-[10px] text-black/40 mt-0.5">via {t.payment_method}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-mono font-bold",
                            t.transaction_type === "MONEY_IN"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          )}
                        >
                          {t.transaction_type === "MONEY_IN" ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          KES {formatNumber(parseFloat(t.amount))}
                        </div>
                      </td>

                      {/* Journal Ref */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {t.journal ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded uppercase">
                            <CheckCircle className="w-3 h-3" />
                            {t.journal}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded uppercase">
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action / Status */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {t.is_reversed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded uppercase font-mono">
                            <RotateCcw className="w-3 h-3 text-purple-600" />
                            REVERSED
                          </span>
                        ) : t.journal ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTxForReversal(t)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded uppercase transition-all shadow-sm active:scale-95 group/btn"
                            title="Reverse and void this transaction in the General Ledger"
                          >
                            <RotateCcw className="w-3 h-3 text-rose-500 group-hover/btn:rotate-180 transition-transform duration-300" />
                            Reverse
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase">
                            Draft
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-black/5">
            {transactions.map((t: SimpleTransaction) => {
              const isSelected = selectedRefs.has(t.reference);
              return (
                <div
                  key={t.reference}
                  className={cn(
                    "p-4 flex items-start justify-between gap-3 transition-colors",
                    isSelected ? "bg-slate-100" : ""
                  )}
                  onClick={() => handleToggleSelectRow(t.reference)}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectRow(t.reference);
                      }}
                      className="mt-1 text-slate-400"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div
                      className={cn(
                        "w-9 h-9 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
                        t.transaction_type === "MONEY_IN" ? "bg-emerald-50" : "bg-red-50"
                      )}
                    >
                      {t.transaction_type === "MONEY_IN" ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                        {t.ledger_book} · via {t.payment_method}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{t.code}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end">
                    <p
                      className={cn(
                        "font-mono font-bold text-sm",
                        t.transaction_type === "MONEY_IN" ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {t.transaction_type === "MONEY_IN" ? "+" : "-"}
                      {formatNumber(parseFloat(t.amount))}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(t.date).toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                    {t.is_reversed ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded uppercase mt-1">
                        <RotateCcw className="w-2.5 h-2.5" /> Reversed
                      </span>
                    ) : t.journal ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxForReversal(t);
                        }}
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded uppercase mt-1 transition-colors"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-rose-500" /> Reverse
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase mt-1">
                        <AlertCircle className="w-2.5 h-2.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="border-t border-black/5 bg-white/50 p-3 sm:p-4 flex justify-between items-center gap-3">
            <span className="text-xs font-semibold text-black/50 uppercase tracking-widest">
              {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-8 px-3 sm:px-4 rounded border border-black/10 bg-white font-semibold text-xs text-black/70 hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-xs font-semibold text-black/50 uppercase tracking-widest">
                {page}/{Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="h-8 px-3 sm:px-4 rounded border border-black/10 bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 sm:py-24 text-center bg-white/40 rounded border border-dashed border-black/10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded bg-black/5 flex items-center justify-center text-black/10 mx-auto mb-4 sm:mb-6">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-black tracking-tight mb-2 uppercase">
            No Transactions Yet
          </h3>
          <p className="text-black/30 font-semibold max-w-xs sm:max-w-sm mx-auto text-sm mb-5 sm:mb-6">
            Log single or batch transactions and double-entry journals will be automatically generated.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowSingleForm(true)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 sm:px-6 h-10 sm:h-11 rounded font-semibold text-sm hover:bg-slate-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              Log Transaction
            </button>
            <button
              onClick={() => {
                setBulkInitialTab("grid");
                setShowBulkModal(true);
              }}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 border border-slate-300 px-5 sm:px-6 h-10 sm:h-11 rounded font-semibold text-sm hover:bg-slate-200 transition-all"
            >
              <Layers className="w-4 h-4" />
              Batch Entry
            </button>
          </div>
        </div>
      )}

      {/* Floating Selection Toolbar */}
      {selectedRefs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-3 sm:pr-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono">{selectedRefs.size} selected</span>
          </div>

          <button
            type="button"
            onClick={handleExportSelected}
            className="flex items-center gap-1.5 text-xs font-semibold hover:text-emerald-400 transition-colors"
            title="Export selected transactions to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {selectedPendingJournalsCount > 0 && (
            <button
              type="button"
              onClick={handleBulkRetryJournals}
              disabled={bulkRetryMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              title="Generate journals for pending transactions"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", bulkRetryMutation.isPending ? "animate-spin" : "")} />
              <span className="hidden sm:inline">Retry Journals ({selectedPendingJournalsCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            title="Delete selected transactions"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Single Transaction Modal */}
      {showSingleForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full sm:max-w-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <CreateSimpleTransaction
              onSuccess={() => setShowSingleForm(false)}
              onClose={() => setShowSingleForm(false)}
            />
          </div>
        </div>
      )}

      {/* Bulk Transactions Fullscreen Studio Modal (Grid & CSV Import) */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 w-screen h-screen overflow-hidden animate-in fade-in duration-200">
          <BulkTransactionsModal
            initialTab={bulkInitialTab}
            onSuccess={() => setShowBulkModal(false)}
            onClose={() => setShowBulkModal(false)}
          />
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-lg p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Transactions</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 font-mono">{selectedRefs.size}</strong> selected transaction(s)?
              Associated draft journals and journal entries will also be permanently removed. Posted journals cannot be deleted.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center gap-1.5"
              >
                {bulkDeleteMutation.isPending ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Reversal Modal */}
      {selectedTxForReversal && (
        <ReverseJournalModal
          open={!!selectedTxForReversal}
          onClose={() => setSelectedTxForReversal(null)}
          title="Reverse & Void Transaction"
          originalCode={selectedTxForReversal.code}
          originalDate={selectedTxForReversal.date}
          amount={selectedTxForReversal.amount}
          description={selectedTxForReversal.name}
          onConfirm={handleReverseTransaction}
          isLoading={isReversingTx}
        />
      )}
    </div>
  );
}
