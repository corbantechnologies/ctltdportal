"use client";

import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import FiscalYearJournals from "@/components/financialyears/FiscalYearJournals";
import FinancialMonthsList from "@/components/financialmonths/FinancialMonthsList";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import SimpleTransactionsPage from "@/components/simpletransactions/SimpleTransactionsPage";
import { useFiscalYear } from "@/contexts/FiscalYearContext";
import { CalendarRange, Calendar, Activity, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function FiscalYearDetail() {
  const { reference } = useParams();
  const router = useRouter();
  const { isLoading, data: fiscalYear, refetch: refetchFiscalYear } = useFetchFinancialYear(
    reference as string,
  );
  const { years, switchFiscalYear } = useFiscalYear();
  const [activeTab, setActiveTab] = useState<'journals' | 'months' | 'reports' | 'transactions'>('journals');

  if (isLoading) return <LoadingSpinner />;
  if (!fiscalYear)
    return (
      <div className="p-12 text-center font-semibold text-gray-300">
        Fiscal Year not found.
      </div>
    );

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs & Actions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <nav>
            <ol className="flex items-center gap-2 text-sm text-black/60">
              <li>
                <Link href="/director/dashboard" className="hover:text-black hover:underline">Dashboard</Link>
              </li>
              <li><span className="text-black/30">/</span></li>
              <li>
                <Link href="/director/fiscal-years" className="hover:text-black hover:underline">Fiscal Periods &amp; Closing</Link>
              </li>
              <li><span className="text-black/30">/</span></li>
              <li>
                <span className="font-semibold text-black">{fiscalYear.code}</span>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-md shadow-[#D0402B]/20">
              <CalendarRange className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-black tracking-tight leading-none">
                  {fiscalYear.code}
                </h1>
                {/* Inline Fast Year Switcher */}
                {years && years.length > 0 && (
                  <div className="relative inline-flex items-center">
                    <select
                      value={fiscalYear.code}
                      onChange={(e) => {
                        const target = years.find((y) => y.code === e.target.value);
                        if (target) {
                          switchFiscalYear(target.code);
                          router.push(`/director/fiscal-years/${target.reference}`);
                        }
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold outline-none cursor-pointer transition-colors pr-6 appearance-none"
                      title="Switch to another fiscal year"
                    >
                      {years.map((y) => (
                        <option key={y.reference} value={y.code}>
                          FY {y.code} {y.is_current ? "★ Current" : y.is_active ? "● Open" : "○ Closed"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 pointer-events-none" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {fiscalYear.estimated_profit && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-black/40">
                    Target Profit: {fiscalYear.estimated_profit}
                  </span>
                )}

                {/* 3-Tier Status Indicator */}
                {fiscalYear.is_current ? (
                  <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <Sparkles className="w-2.5 h-2.5 text-[#D0402B]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Current Operating Year
                    </span>
                  </div>
                ) : fiscalYear.is_active ? (
                  <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <div className="w-1.5 h-1.5 rounded bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider">
                      Open / Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded bg-slate-400" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider">
                      Closed / Archived
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side controls: All Years Directory */}
        <div className="flex items-center gap-2">
          <Link
            href="/director/fiscal-years"
            className="flex items-center justify-center h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] uppercase font-bold tracking-wider transition-all border border-slate-200 gap-1.5"
            title="Browse all historical and configured fiscal years"
          >
            <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
            <span>All Years Directory</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-black/5 flex items-center justify-center text-black/40">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                Fiscal Start
              </p>
              <p className="text-sm font-semibold text-black tracking-tight">
                {new Date(fiscalYear.start_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-black/5 flex items-center justify-center text-black/40">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                Fiscal End
              </p>
              <p className="text-sm font-semibold text-black tracking-tight">
                {new Date(fiscalYear.end_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded flex items-center justify-center ${
                fiscalYear.is_current
                  ? "bg-red-500/10 text-[#D0402B]"
                  : fiscalYear.is_active
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-black/5 text-black/40"
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                Posting Status
              </p>
              <p
                className={`text-sm font-semibold tracking-tight ${
                  fiscalYear.is_current
                    ? "text-[#D0402B]"
                    : fiscalYear.is_active
                    ? "text-blue-600"
                    : "text-black/60"
                }`}
              >
                {fiscalYear.is_current ? "Current Operating Year" : fiscalYear.is_active ? "Open for Posting" : "Closed / Archived"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="space-y-4 pt-1">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
           <button
             onClick={() => setActiveTab('journals')}
             className={`px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'journals' ? 'border-[#D0402B] text-[#D0402B]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Journals
           </button>
           <button
             onClick={() => setActiveTab('months')}
             className={`px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'months' ? 'border-[#D0402B] text-[#D0402B]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Months
           </button>
           <button
             onClick={() => setActiveTab('reports')}
             className={`px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'reports' ? 'border-[#D0402B] text-[#D0402B]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Reports
           </button>
           <button
             onClick={() => setActiveTab('transactions')}
             className={`px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'transactions' ? 'border-[#D0402B] text-[#D0402B]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Transactions
           </button>
        </div>

        {activeTab === 'journals' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
                Period Journal Entries
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <FiscalYearJournals
              journals={fiscalYear.journals || []}
              rolePrefix="director"
              fiscalYearReference={reference as string}
            />
          </div>
        ) : activeTab === 'months' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
                Financial Periods
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <FinancialMonthsList
              months={fiscalYear.months || []}
              rolePrefix="director"
              fiscalYearReference={reference as string}
            />
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ReportsDashboard rolePrefix="director" fixedYearCode={fiscalYear.code} />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <SimpleTransactionsPage hideHeader />
          </div>
        )}
      </div>
    </div>
  );
}
