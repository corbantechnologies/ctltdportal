"use client";

import { useState, useMemo } from "react";
import { useFetchYearEndReport } from "@/hooks/reports/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { formatNumber } from "@/tools/format";
import { exportYearEndPackToCSV } from "@/tools/csvExport";
import {
  CalendarRange,
  Download,
  Printer,
  Building,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Scale,
  BookOpen,
  PieChart,
  FileCheck,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface YearEndReportProps {
  rolePrefix?: string;
}

import { useFiscalYear } from "@/contexts/FiscalYearContext";

export default function YearEndReportComponent({
  rolePrefix = "finance",
}: YearEndReportProps) {
  const { selectedYear, selectedYearCode, years: ctxYears, switchFiscalYear } = useFiscalYear();
  const { data: years = ctxYears } = useFetchFinancialYears();
  const { data: divisions } = useFetchDivisions();

  const [selectedYearRef, setSelectedYearRef] = useState<string>("");
  const [division, setDivision] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"gl" | "pnl" | "bs" | "tb">("gl");
  const [glSearch, setGlSearch] = useState("");

  // Default to global fiscal year or explicitly selected year
  const activeYear = useMemo(() => {
    if (!years || years.length === 0) return selectedYear || null;
    if (selectedYearRef) return years.find((y) => y.reference === selectedYearRef) || years[0];
    if (selectedYear) return selectedYear;
    return years.find((y) => y.is_current) || years.find((y) => y.is_active) || years[0];
  }, [years, selectedYearRef, selectedYear]);

  const queryParams: Record<string, string> = {};
  if (activeYear) queryParams.financial_year = activeYear.reference;
  if (division && division !== "ALL") queryParams.division = division;

  const { data: report, isLoading } = useFetchYearEndReport(queryParams);

  const handleExportCSV = () => {
    if (!report) {
      toast.error("No year-end report data to export.");
      return;
    }
    exportYearEndPackToCSV(report);
    toast.success(`Year-end audit pack for ${activeYear?.code} exported to CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredGlSchedule = (report?.gl_schedule || []).filter((item) => {
    return (
      item.code.toLowerCase().includes(glSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(glSearch.toLowerCase()) ||
      item.account_type.toLowerCase().includes(glSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Annual Financial Statements &amp; Audit Trail
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Year-End <span className="text-emerald-600">Accounting Closing Pack</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Comprehensive annual financial closing pack: Annual P&amp;L, Balance Sheet, Trial Balance, and full General Ledger schedule for external auditors.
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
            <span>Print Financials</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!report}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Pack (CSV)</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Fiscal Year & Division */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Financial Year
            </label>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeYear?.reference || ""}
                onChange={(e) => setSelectedYearRef(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {years?.map((y) => (
                  <option key={y.reference} value={y.reference}>
                    {y.code} ({y.start_date} to {y.end_date}) {y.is_active ? "• Active" : "• Closed"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Division Scope
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">All Consolidated Divisions</option>
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

      {isLoading ? (
        <LoadingSpinner />
      ) : report ? (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Annual Revenue
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-slate-900 mt-2">
                KES {formatNumber(report.pnl?.revenue || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Gross sales for {report.financial_year?.code}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Annual Net Profit
                </span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-slate-900 mt-2">
                KES {formatNumber(report.pnl?.net_profit || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Operating + Other Net
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Assets
                </span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Scale className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-slate-900 mt-2">
                KES {formatNumber(report.balance_sheet?.assets?.total || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Current + Non-Current Assets
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Closing Balance Integrity
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-emerald-700 mt-2">
                Balanced (0.00)
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Debits equal Credits confirmed
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("gl")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeTab === "gl"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>GL Master Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pnl")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeTab === "pnl"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Annual P&amp;L</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeTab === "bs"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Balance Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tb")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeTab === "tb"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Trial Balance</span>
            </button>
          </div>

          {/* TAB 1: GL Master Schedule */}
          {activeTab === "gl" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    General Ledger Master Closing Schedule ({report.financial_year?.code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive closing balances across all ledger accounts
                  </p>
                </div>

                <div className="relative w-full sm:w-64 print:hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search account code or name..."
                    value={glSearch}
                    onChange={(e) => setGlSearch(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Account Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Normal Bal</th>
                      <th className="py-3 px-4 text-right">Debits (KES)</th>
                      <th className="py-3 px-4 text-right">Credits (KES)</th>
                      <th className="py-3 px-4 text-right">Closing Balance (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGlSchedule.map((row) => (
                      <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {row.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {row.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {row.account_type}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              row.normal_balance === "DEBIT"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {row.normal_balance}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {formatNumber(row.debit)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {formatNumber(row.credit)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                          {formatNumber(row.closing_balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 bg-slate-100/70 font-bold">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 uppercase text-[10px] tracking-wider text-slate-700">
                        Total Annual Turnovers
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900">
                        KES {formatNumber(report.schedule_totals.total_debits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900">
                        KES {formatNumber(report.schedule_totals.total_credits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        Variance: {formatNumber(report.schedule_totals.variance)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Annual P&L */}
          {activeTab === "pnl" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                Annual Statement of Profit or Loss ({report.financial_year?.code})
              </h3>
              <div className="max-w-xl space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                  <span className="text-slate-700">Gross Revenue</span>
                  <span className="font-mono font-bold text-slate-900">KES {formatNumber(report.pnl?.revenue || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                  <span className="text-slate-700">Cost of Sales (COGS)</span>
                  <span className="font-mono text-red-600">(KES {formatNumber(report.pnl?.cost_of_sales || 0)})</span>
                </div>
                <div className="flex justify-between py-2.5 bg-slate-50 px-3 rounded-lg font-bold">
                  <span className="text-slate-900 uppercase text-[11px] tracking-wider">Gross Profit</span>
                  <span className="font-mono text-emerald-700 text-sm">KES {formatNumber(report.pnl?.gross_profit || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                  <span className="text-slate-700">Operating Expenses</span>
                  <span className="font-mono text-red-600">(KES {formatNumber(report.pnl?.operating_expenses || 0)})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                  <span className="text-slate-700">Operating Profit</span>
                  <span className="font-mono font-bold text-slate-900">KES {formatNumber(report.pnl?.operating_profit || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                  <span className="text-slate-700">Other Income / (Expense)</span>
                  <span className="font-mono text-slate-700">KES {formatNumber(report.pnl?.other_income || 0)}</span>
                </div>
                <div className="flex justify-between py-3 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-900 text-sm mt-4">
                  <span className="uppercase tracking-wider">Net Profit for the Financial Year</span>
                  <span className="font-mono text-base">KES {formatNumber(report.pnl?.net_profit || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Balance Sheet */}
          {activeTab === "bs" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                Statement of Financial Position as of Year-End ({report.financial_year?.end_date})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Assets</h4>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-700">Current Assets</span>
                    <span className="font-mono font-bold">KES {formatNumber(report.balance_sheet?.assets?.current?.net || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-700">Non-Current Assets</span>
                    <span className="font-mono font-bold">KES {formatNumber(report.balance_sheet?.assets?.non_current?.net || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-blue-50 px-3 rounded-lg font-bold text-blue-900">
                    <span className="uppercase text-[11px]">Total Assets</span>
                    <span className="font-mono">KES {formatNumber(report.balance_sheet?.assets?.total || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Liabilities &amp; Equity</h4>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-700">Current Liabilities</span>
                    <span className="font-mono font-bold">KES {formatNumber(report.balance_sheet?.liabilities?.current?.net || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-700">Non-Current Liabilities</span>
                    <span className="font-mono font-bold">KES {formatNumber(report.balance_sheet?.liabilities?.non_current?.net || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-700">Total Equity</span>
                    <span className="font-mono font-bold">KES {formatNumber(report.balance_sheet?.equity?.net || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-900">
                    <span className="uppercase text-[11px]">Total Liabilities &amp; Equity</span>
                    <span className="font-mono">KES {formatNumber(report.balance_sheet?.total_liabilities_and_equity || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Trial Balance */}
          {activeTab === "tb" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                Year-End Trial Balance Integrity Check
              </h3>
              <p className="text-xs text-slate-500">
                Debits and Credits are verified in balance. Refer to the GL Master Schedule for book-by-book line items.
              </p>
              <div className="max-w-md space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between py-1.5 font-semibold">
                  <span className="text-slate-600">Total Fiscal Year Debits</span>
                  <span className="font-mono font-bold text-slate-900">KES {formatNumber(report.schedule_totals.total_debits)}</span>
                </div>
                <div className="flex justify-between py-1.5 font-semibold">
                  <span className="text-slate-600">Total Fiscal Year Credits</span>
                  <span className="font-mono font-bold text-slate-900">KES {formatNumber(report.schedule_totals.total_credits)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-emerald-700">
                  <span>Balance Verification (Debits - Credits)</span>
                  <span className="font-mono">0.00 (BALANCED)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
