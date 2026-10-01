"use client";

import { useState, useMemo } from "react";
import { useFetchTaxFilingReport } from "@/hooks/reports/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFiscalYear } from "@/contexts/FiscalYearContext";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { formatNumber } from "@/tools/format";
import { exportTaxFilingToCSV, exportAllTransactionsTaxToCSV } from "@/tools/csvExport";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TaxFilingReportProps {
  rolePrefix?: string;
}

export default function TaxFilingReportComponent({
  rolePrefix = "finance",
}: TaxFilingReportProps) {
  const { selectedYearCode, years, switchFiscalYear } = useFiscalYear();

  const [activeTab, setActiveTab] = useState<"TAX_SCHEDULE" | "ALL_TRANSACTIONS">("TAX_SCHEDULE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [division, setDivision] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INPUT_VAT" | "OUTPUT_VAT">("ALL");

  const { data: divisions } = useFetchDivisions();

  // Stabilize query params and protect against partial invalid dates
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (selectedYearCode) p.year = selectedYearCode;
    // Only pass dates if valid 10-char format YYYY-MM-DD
    if (startDate && startDate.trim().length === 10) p.start_date = startDate.trim();
    if (endDate && endDate.trim().length === 10) p.end_date = endDate.trim();
    if (division && division !== "ALL") p.division = division;
    return p;
  }, [selectedYearCode, startDate, endDate, division]);

  const { data: report, isLoading, isFetching } = useFetchTaxFilingReport(queryParams);

  const handleExportTaxScheduleCSV = () => {
    if (!report || !report.vat_schedule || report.vat_schedule.length === 0) {
      toast.error("No tax schedule transactions available to export.");
      return;
    }
    exportTaxFilingToCSV(report);
    toast.success("Tax filing return schedule exported to CSV!");
  };

  const handleExportAllTransactionsCSV = () => {
    const txs = (report as any)?.all_transactions;
    if (!txs || txs.length === 0) {
      toast.error("No statutory transactions available to export for this period.");
      return;
    }
    exportAllTransactionsTaxToCSV(txs);
    toast.success(`Exported ${txs.length} transactions to CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter VAT / WHT schedule
  const filteredScheduleItems = useMemo(() => {
    const list = report?.vat_schedule || [];
    if (!searchQuery && typeFilter === "ALL") return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const matchesSearch =
        !q ||
        (item.partner_name && item.partner_name.toLowerCase().includes(q)) ||
        (item.partner_pin && item.partner_pin.toLowerCase().includes(q)) ||
        (item.journal_code && item.journal_code.toLowerCase().includes(q)) ||
        (item.document_number && item.document_number.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.book_name && item.book_name.toLowerCase().includes(q));

      const matchesType = typeFilter === "ALL" || item.tax_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [report, searchQuery, typeFilter]);

  // Filter all general ledger transactions
  const filteredAllTransactions = useMemo(() => {
    const list = (report as any)?.all_transactions || [];
    if (!searchQuery) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((item: any) => {
      return (
        (item.partner_name && item.partner_name.toLowerCase().includes(q)) ||
        (item.partner_pin && item.partner_pin.toLowerCase().includes(q)) ||
        (item.journal_code && item.journal_code.toLowerCase().includes(q)) ||
        (item.document_number && item.document_number.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.book_name && item.book_name.toLowerCase().includes(q)) ||
        (item.book_code && item.book_code.toLowerCase().includes(q))
      );
    });
  }, [report, searchQuery]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statutory Compliance &amp; Tax Authority Returns
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Tax Filing <span className="text-emerald-600">Schedule &amp; Returns</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Input VAT, Output VAT, Withholding Tax (WHT) returns, and complete period transaction ledgers formatted for tax audits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Pack</span>
          </button>

          <button
            type="button"
            onClick={handleExportTaxScheduleCSV}
            disabled={!report || (report.vat_schedule || []).length === 0}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Export itemized VAT return schedule"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tax Return</span>
          </button>

          <button
            type="button"
            onClick={handleExportAllTransactionsCSV}
            disabled={!report || ((report as any)?.all_transactions || []).length === 0}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Download complete ledger transactions in this period"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>All Transactions ({((report as any)?.all_transactions || []).length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar with Fiscal Year Intelligence */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Fiscal Year Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Fiscal Year
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedYearCode}
                onChange={(e) => switchFiscalYear(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-emerald-50/40 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y.reference} value={y.code}>
                    FY {y.code} {y.is_current ? "★ Current" : y.is_active ? "● Active" : "○ Closed"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Custom Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Custom End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Division */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Division
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">All Divisions</option>
                {divisions?.map((d) => (
                  <option key={d.reference} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading && !report ? (
        <LoadingSpinner />
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Gross Sales Base
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-slate-900 mt-2">
                KES {formatNumber(report.summary.gross_sales)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Output VAT: <span className="font-mono font-bold text-emerald-600">KES {formatNumber(report.summary.output_vat)}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Gross Purchases Base
                </span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-slate-900 mt-2">
                KES {formatNumber(report.summary.gross_purchases)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Input VAT: <span className="font-mono font-bold text-blue-600">KES {formatNumber(report.summary.input_vat)}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Net VAT Payable / (Claim)
                </span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-purple-700 mt-2">
                KES {formatNumber(report.summary.net_vat_payable)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {report.summary.net_vat_payable >= 0 ? "Payable to Tax Authority" : "Credit Carried Forward"}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Withholding Tax (WHT)
                </span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-slate-900 mt-2">
                KES {formatNumber(report.summary.total_wht_deducted)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Total withheld at source
              </div>
            </div>
          </div>

          {/* View Mode Tabs & Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              {/* Tab Selector */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("TAX_SCHEDULE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "TAX_SCHEDULE"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tax Return Schedule ({filteredScheduleItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL_TRANSACTIONS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "ALL_TRANSACTIONS"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Transactions ({filteredAllTransactions.length})
                </button>
              </div>

              {/* Controls (Tax Type filter + Search) */}
              <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
                {activeTab === "TAX_SCHEDULE" && (
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="ALL">All Tax Types</option>
                    <option value="OUTPUT_VAT">Output VAT (Sales)</option>
                    <option value="INPUT_VAT">Input VAT (Purchases)</option>
                  </select>
                )}

                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search partner, PIN, invoice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* TAB 1: Itemized Tax Return Schedule Table */}
            {activeTab === "TAX_SCHEDULE" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Journal Code</th>
                      <th className="py-3 px-4">Invoice / Doc #</th>
                      <th className="py-3 px-4">Partner Name</th>
                      <th className="py-3 px-4">Tax PIN</th>
                      <th className="py-3 px-4">Tax Type</th>
                      <th className="py-3 px-4">Ledger Book</th>
                      <th className="py-3 px-4 text-right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredScheduleItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {item.journal_code}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {item.document_number || "–"}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {item.partner_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {item.partner_pin || "–"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              item.tax_type === "OUTPUT_VAT"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.tax_type === "OUTPUT_VAT" ? "Output VAT" : "Input VAT"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {item.book_name}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          KES {formatNumber(item.tax_amount)}
                        </td>
                      </tr>
                    ))}

                    {filteredScheduleItems.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-xs font-semibold text-slate-400 bg-slate-50/50"
                        >
                          No qualifying tax transactions found for the selected period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: All Statutory Transactions Table */}
            {activeTab === "ALL_TRANSACTIONS" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Journal Code</th>
                      <th className="py-3 px-4">Invoice / Doc #</th>
                      <th className="py-3 px-4">Partner Name</th>
                      <th className="py-3 px-4">Tax PIN</th>
                      <th className="py-3 px-4">Ledger Account</th>
                      <th className="py-3 px-4 text-right">Debit</th>
                      <th className="py-3 px-4 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAllTransactions.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {item.journal_code}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {item.document_number || "–"}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {item.partner_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {item.partner_pin || "–"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {item.book_code} — {item.book_name}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-900">
                          {item.debit > 0 ? `KES ${formatNumber(item.debit)}` : "–"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-900">
                          {item.credit > 0 ? `KES ${formatNumber(item.credit)}` : "–"}
                        </td>
                      </tr>
                    ))}

                    {filteredAllTransactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-xs font-semibold text-slate-400 bg-slate-50/50"
                        >
                          No transactions found for the selected period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
