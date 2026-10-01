"use client";

import { useState } from "react";
import { useFetchTaxFilingReport } from "@/hooks/reports/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { formatNumber } from "@/tools/format";
import { exportTaxFilingToCSV } from "@/tools/csvExport";
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
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TaxFilingReportProps {
  rolePrefix?: string;
}

export default function TaxFilingReportComponent({
  rolePrefix = "finance",
}: TaxFilingReportProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [division, setDivision] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INPUT_VAT" | "OUTPUT_VAT">("ALL");

  const { data: divisions } = useFetchDivisions();

  const queryParams: Record<string, string> = {};
  if (startDate) queryParams.start_date = startDate;
  if (endDate) queryParams.end_date = endDate;
  if (division && division !== "ALL") queryParams.division = division;

  const { data: report, isLoading } = useFetchTaxFilingReport(queryParams);

  const handleExportCSV = () => {
    if (!report || !report.vat_schedule || report.vat_schedule.length === 0) {
      toast.error("No tax schedule transactions available to export.");
      return;
    }
    exportTaxFilingToCSV(report);
    toast.success("Tax filing return schedule exported to CSV!");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = (report?.vat_schedule || []).filter((item) => {
    const matchesSearch =
      item.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partner_pin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.journal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.document_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "ALL" || item.tax_type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statutory Compliance &amp; Tax Returns
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Tax Filing <span className="text-emerald-600">Schedule &amp; Returns</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Input VAT, Output VAT, and Withholding Tax (WHT) return schedules formatted for tax authority filing and audits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
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
            onClick={handleExportCSV}
            disabled={!report || report.vat_schedule.length === 0}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Start Date
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

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              End Date
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

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tax Direction
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">All Movements (Input &amp; Output)</option>
              <option value="OUTPUT_VAT">Output VAT (Sales / Payable)</option>
              <option value="INPUT_VAT">Input VAT (Purchases / Claimable)</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
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

          {/* Schedule Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Itemized Tax Return Ledger Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredItems.length} transactions with tax impact
                </p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden">
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
                  {filteredItems.map((item) => (
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

                  {filteredItems.length === 0 && (
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
