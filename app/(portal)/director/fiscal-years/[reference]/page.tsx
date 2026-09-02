"use client";

import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import FiscalYearJournals from "@/components/financialyears/FiscalYearJournals";
import FinancialMonthsList from "@/components/financialmonths/FinancialMonthsList";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { CalendarRange, Calendar, Activity } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";


export default function FiscalYearDetail() {
  const { reference } = useParams();
  const { isLoading, data: fiscalYear } = useFetchFinancialYear(
    reference as string,
  );
  const [activeTab, setActiveTab] = useState<'journals' | 'months'>('journals');

  if (isLoading) return <LoadingSpinner />;
  if (!fiscalYear)
    return (
      <div className="p-12 text-center font-semibold text-gray-300">
        Fiscal Year not found.
      </div>
    );

  return (
    <div className="space-y-12 pb-12">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <nav>
            <ol className="flex items-center gap-2 text-sm text-black/60">
              <li>
                <a href="/director/dashboard" className="hover:text-black hover:underline">Dashboard</a>
              </li>
              <li><span className="text-black/30">/</span></li>
              <li>
                <a href="/director/fiscal-years" className="hover:text-black hover:underline">Fiscal Years</a>
              </li>
              <li><span className="text-black/30">/</span></li>
              <li>
                <span className="font-semibold text-black">{fiscalYear.code}</span>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-[#045138] flex items-center justify-center text-white shadow-xl shadow-[#045138]/20">
              <CalendarRange className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-black tracking-tighter italic leading-none">
                {fiscalYear.code}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-black text-white border-none font-semibold text-[10px] uppercase tracking-widest px-3 py-1 rounded inline-block">
                  REF: {fiscalYear.reference}
                </span>
                {fiscalYear.is_active ? (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded border border-green-100">
                    <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-1 rounded border border-gray-100">
                    <div className="w-1.5 h-1.5 rounded bg-gray-300" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Closed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Fiscal Start
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {new Date(fiscalYear.start_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Fiscal End
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {new Date(fiscalYear.end_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded flex items-center justify-center ${fiscalYear.is_active
                  ? "bg-green-500/10 text-green-600"
                  : "bg-black/5 text-black/40"
                  }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Status
                </p>
                <p
                  className={`text-base font-semibold tracking-tight ${fiscalYear.is_active ? "text-green-600" : "text-black/60"
                    }`}
                >
                  {fiscalYear.is_active ? "Active Period" : "Closed Period"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="space-y-6 pt-2">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100">
           <button
             onClick={() => setActiveTab('journals')}
             className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 ${activeTab === 'journals' ? 'border-[#D0402B] text-[#D0402B]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Journals
           </button>
           <button
             onClick={() => setActiveTab('months')}
             className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 ${activeTab === 'months' ? 'border-[#D0402B] text-[#D0402B]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Months
           </button>
        </div>

        {activeTab === 'journals' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-black">
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
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-black">
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
        )}
      </div>
    </div>
  );
}
