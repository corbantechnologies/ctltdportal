/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchSimpleTransactions } from "@/hooks/simpletransactions/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import KpiStatCard from "@/components/portal/KpiStatCard";
import FilterTabs from "@/components/portal/FilterTabs";
import {
  Wallet,
  ArrowDownRight,
  TrendingDown,
  Search,
  Plus,
  Calendar,
  Building2,
  FileText,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExpensesListProps {
  rolePrefix: "finance" | "director" | "operations";
}

export default function ExpensesList({ rolePrefix }: ExpensesListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: response, isLoading } = useFetchSimpleTransactions({ limit: "100" });
  const allTransactions = response?.results || [];

  // Filter only MONEY_OUT (Expenses)
  const expenses = useMemo(() => {
    return allTransactions.filter((tx: any) => tx.transaction_type === "MONEY_OUT");
  }, [allTransactions]);

  // Real-time KPI calculations
  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum: number, tx: any) => sum + (parseFloat(tx.amount) || 0), 0);
  }, [expenses]);

  const nonReversedCount = useMemo(() => {
    return expenses.filter((tx: any) => !tx.is_reversed).length;
  }, [expenses]);

  const activeExpenseAmount = useMemo(() => {
    return expenses
      .filter((tx: any) => !tx.is_reversed)
      .reduce((sum: number, tx: any) => sum + (parseFloat(tx.amount) || 0), 0);
  }, [expenses]);

  // Filtered & Searched List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((tx: any) => {
      // Tab filter
      if (activeTab === "active" && tx.is_reversed) return false;
      if (activeTab === "reversed" && !tx.is_reversed) return false;
      if (activeTab === "attached" && !tx.document_file && !tx.document_number) return false;

      // Search filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.name?.toLowerCase().includes(q) ||
        tx.code?.toLowerCase().includes(q) ||
        tx.ledger_book_name?.toLowerCase().includes(q) ||
        tx.payment_method_name?.toLowerCase().includes(q) ||
        tx.document_number?.toLowerCase().includes(q)
      );
    });
  }, [expenses, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const filterTabs = [
    { id: "all", label: "All Expenses", count: expenses.length },
    { id: "active", label: "Active & Posted", count: nonReversedCount },
    { id: "attached", label: "With Receipts", count: expenses.filter((tx: any) => tx.document_file || tx.document_number).length },
    { id: "reversed", label: "Reversed Vouchers", count: expenses.filter((tx: any) => tx.is_reversed).length },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Title & New Expense Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Expenses &amp; Disbursements Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track operational expenses, vendor bills, and disbursements linked to the General Ledger
          </p>
        </div>

        <button
          onClick={() => router.push(`/${rolePrefix}/expenses/new`)}
          className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Record Expense Outflow
        </button>
      </div>

      {/* Real-time KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          title="Total Recorded Expenses"
          value={`KES ${totalExpenseAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle={`${expenses.length} total expense vouchers`}
          icon={ArrowDownRight}
          accentColor="rose"
        />
        <KpiStatCard
          title="Active Operational Outflows"
          value={`KES ${activeExpenseAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle="Non-reversed general ledger postings"
          icon={Wallet}
          accentColor="amber"
        />
        <KpiStatCard
          title="Active Vouchers"
          value={nonReversedCount}
          subtitle="Committed to Chart of Accounts"
          icon={ShieldCheck}
          accentColor="slate"
        />
        <KpiStatCard
          title="Reversed Vouchers"
          value={expenses.length - nonReversedCount}
          subtitle="Audited and reversed transactions"
          icon={RotateCcw}
          accentColor="blue"
        />
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by expense title, account, code, or bill #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold shadow-sm transition-all"
          />
        </div>

        <FilterTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Expense / Voucher</th>
                <th className="py-4 px-6">Expense Account (DR)</th>
                <th className="py-4 px-6">Payment Source (CR)</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Amount (KES)</th>
                <th className="py-4 px-6 text-right">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30 text-rose-500" />
                    <p className="text-xs font-bold uppercase tracking-wider">No expense records found</p>
                    <p className="text-slate-400 text-xs mt-1">Click "Record Expense Outflow" to log vendor payments</p>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((tx: any) => (
                  <tr
                    key={tx.reference}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{tx.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span>{tx.code}</span>
                            {tx.document_number && (
                              <span>• Doc #{tx.document_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-semibold truncate max-w-[180px]">
                          {tx.ledger_book_name || tx.ledger_book || "Operating Expense"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 font-medium">
                          {tx.payment_method_name || tx.payment_method || "Commercial Bank"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(tx.date).toLocaleDateString("en-GB")}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 text-sm">
                      KES {parseFloat(tx.amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {tx.is_reversed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <RotateCcw className="w-3 h-3" /> Reversed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Posted to GL
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              Showing {paginatedExpenses.length} of {filteredExpenses.length} expense records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-slate-900 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
