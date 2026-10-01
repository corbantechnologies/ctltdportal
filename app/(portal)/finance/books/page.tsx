"use client";

import { useState, useMemo } from "react";
import { useFetchBooks } from "@/hooks/books/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  BookOpen,
  Search,
  ArrowRight,
  Wallet,
  Building2,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Download,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { formatNumber } from "@/tools/format";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function BooksPage() {
  const { data: books, isLoading } = useFetchBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CASH" | "BANK" | "TAX" | "OTHER">("ALL");
  const [sortField, setSortField] = useState<"code" | "name" | "balance">("code");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books
      .filter((b) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          (b.account_type && b.account_type.toLowerCase().includes(q));

        let matchesType = true;
        if (filterType === "CASH") matchesType = Boolean(b.is_cash);
        if (filterType === "BANK") matchesType = Boolean(b.is_bank);
        if (filterType === "TAX") matchesType = Boolean(b.is_tax);
        if (filterType === "OTHER") matchesType = !b.is_cash && !b.is_bank && !b.is_tax;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortField === "code") {
          return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
        }
        if (sortField === "name") {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (sortField === "balance") {
          const balA = Number(a.balance || 0);
          const balB = Number(b.balance || 0);
          return sortAsc ? balA - balB : balB - balA;
        }
        return 0;
      });
  }, [books, searchQuery, filterType, sortField, sortAsc]);

  const handleSort = (field: "code" | "name" | "balance") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    if (!filteredBooks.length) {
      toast.error("No books available to export.");
      return;
    }
    const headers = ["Account Code", "Ledger Name", "Account Type", "Type", "Status", "Current Balance (KES)"];
    const rows = filteredBooks.map((b) => [
      b.code,
      `"${b.name}"`,
      `"${b.account_type || ""}"`,
      b.is_bank ? "Bank" : b.is_cash ? "Cash" : b.is_tax ? "Tax" : "General",
      b.is_active ? "Active" : "Inactive",
      Number(b.balance || 0).toFixed(2),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `corban_ledger_books_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Ledger books exported to CSV!");
  };

  // Metrics
  const totalBalance = useMemo(() => {
    return filteredBooks.reduce((sum, b) => sum + Number(b.balance || 0), 0);
  }, [filteredBooks]);

  const cashBankCount = useMemo(() => {
    return (books || []).filter((b) => b.is_cash || b.is_bank).length;
  }, [books]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              General Ledger Chart &amp; Cash Books
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Financial <span className="text-emerald-600">Books &amp; Ledgers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Complete account directory, active cash books, bank accounts, and running ledger balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export List</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Books
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
              {books?.length || 0}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Cash &amp; Bank Books
            </span>
            <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
              {cashBankCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Filtered Result
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
              {filteredBooks.length} <span className="text-xs text-slate-400 font-sans font-normal">ledgers</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Running Total
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
              KES {formatNumber(totalBalance)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by account code, ledger name, category..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600 transition-all cursor-pointer"
          >
            <option value="ALL">All Account Books</option>
            <option value="CASH">Cash Books (Petty Cash / Tills)</option>
            <option value="BANK">Bank Accounts (Current / Savings)</option>
            <option value="TAX">Tax &amp; VAT Ledgers</option>
            <option value="OTHER">Other Operating Ledgers</option>
          </select>
        </div>
      </div>

      {/* Structured List / Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 select-none">
                <th
                  onClick={() => handleSort("code")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Code</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ledger Account Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Account Type / Category</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Status</th>
                <th
                  onClick={() => handleSort("balance")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Current Balance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book) => {
                const bal = Number(book.balance || 0);

                return (
                  <tr
                    key={book.reference}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Account Code */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {book.code}
                      </span>
                    </td>

                    {/* Ledger Name */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          {book.is_bank ? (
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          ) : book.is_cash ? (
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                        <span className="truncate max-w-xs">{book.name}</span>
                      </div>
                    </td>

                    {/* Account Type */}
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {book.account_type || "–"}
                    </td>

                    {/* Classification Badges */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {book.is_bank && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          Bank
                        </span>
                      )}
                      {book.is_cash && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Cash
                        </span>
                      )}
                      {book.is_tax && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                          Tax / VAT
                        </span>
                      )}
                      {!book.is_bank && !book.is_cash && !book.is_tax && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          General
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {book.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Closed
                        </span>
                      )}
                    </td>

                    {/* Current Balance */}
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={bal < 0 ? "text-red-600" : "text-slate-900"}>
                        KES {formatNumber(bal)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/finance/reports/gl-statement?book_reference=${book.reference}`}
                          className="h-7 px-2.5 rounded border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 transition-all shadow-sm"
                          title="View GL Statement for this book"
                        >
                          <span>Statement</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBooks.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-xs font-semibold text-slate-400 bg-slate-50/50"
                  >
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">No ledger books found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No accounts match your search or filter criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
