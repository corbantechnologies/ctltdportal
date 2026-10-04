"use client";

import FinancialYearsList from "@/components/financialyears/FinancialYearsList";
import CreateFiscalYear from "@/forms/financialyears/CreateFiscalYear";
import { useFiscalYear } from "@/contexts/FiscalYearContext";
import { CalendarRange, Plus, Sparkles, ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FiscalYearsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedYear, years } = useFiscalYear();

  // Find the current operating year (is_current === true), or fallback to selectedYear
  const currentYear = years.find((y) => y.is_current) || selectedYear || years[0];
  const otherActiveYears = years.filter((y) => y.is_active && !y.is_current);

  return (
    <div className="space-y-6 pb-12 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-md shadow-[#D0402B]/20">
              <CalendarRange className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D0402B]">
              Period Management &amp; Closing
            </p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fiscal Periods &amp; <span className="text-[#D0402B]">Closing</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-xs max-w-xl">
            Executive financial governance. Review fiscal periods, approve year closings, and audit historical performance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-5 rounded bg-[#D0402B] text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Initialize Fiscal Year
        </button>
      </div>

      {/* Hero: Active Working Year Quick Access */}
      {currentYear && (
        <div className="relative overflow-hidden rounded-xl border border-red-200/80 bg-gradient-to-br from-red-50/50 via-white to-slate-50 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#D0402B] animate-pulse" />
                  Primary Operating Year
                </span>
                {currentYear.is_active && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Open for Posting
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>FY {currentYear.code}</span>
                  <span className="text-xs font-normal text-slate-400">(REF: {currentYear.reference})</span>
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(currentYear.start_date).toLocaleDateString()} — {new Date(currentYear.end_date).toLocaleDateString()}
                  </span>
                  {currentYear.estimated_profit && (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      Target Profit: {currentYear.estimated_profit}
                    </span>
                  )}
                </div>
              </div>

              {otherActiveYears.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Other Open Years:</span>
                  {otherActiveYears.map((oy) => (
                    <Link
                      key={oy.reference}
                      href={`/director/fiscal-years/${oy.reference}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold transition-colors shadow-2xs"
                    >
                      <Clock className="w-2.5 h-2.5 text-blue-500" />
                      FY {oy.code} (Open)
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Link
                href={`/director/fiscal-years/${currentYear.reference}`}
                className="h-10 px-5 rounded bg-[#D0402B] hover:bg-black text-white flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Manage Periods (FY {currentYear.code})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Directory Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              All Fiscal Years Directory
            </h3>
            <p className="text-xs text-slate-500">
              Complete historical record and multi-year status ledger
            </p>
          </div>
        </div>

        <FinancialYearsList rolePrefix="director" />
      </div>

      {/* Initialize Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300">
            <CreateFiscalYear 
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
