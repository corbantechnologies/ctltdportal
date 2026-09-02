"use client";

import { Calendar, CheckCircle2, ChevronRight, FileText, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { FinancialMonth } from "@/services/financialmonths";

interface FinancialMonthsListProps {
  months: FinancialMonth[];
  fiscalYearReference: string;
  rolePrefix: string;
}

export default function FinancialMonthsList({
  months,
  fiscalYearReference,
  rolePrefix,
}: FinancialMonthsListProps) {
  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  if (!months || months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded border border-dashed border-gray-200">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest text-center">
          No months generated for this fiscal year yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map((month) => {
        const isLocked = month.is_closed;
        const allPosted = month.unposted_journals_count === 0;

        return (
          <Link
            key={month.reference}
            href={`/${rolePrefix}/fiscal-years/${fiscalYearReference}/months/${month.reference}`}
            className="group block"
          >
            <div className="h-full bg-white border border-gray-100 rounded p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group-hover:border-black/5">
              <div className="flex justify-between items-start mb-3">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center text-white shadow-md shadow-black/5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {isLocked ? (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase py-0.5 px-2 rounded bg-gray-100 text-gray-400 border border-black/5">
                      <Lock className="w-2.5 h-2.5" />
                      Closed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase py-0.5 px-2 rounded bg-green-50 text-green-600 border border-green-100">
                      <div className="w-1 h-1 rounded bg-green-500 animate-pulse" />
                      Active
                    </div>
                  )}
                  {month.unposted_journals_count > 0 && !isLocked && (
                    <div className="text-[8px] font-black uppercase text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded animate-pulse">
                      {month.unposted_journals_count} Unposted
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-black tracking-tight mb-1 uppercase italic">
                  {month.name}
                </h3>
                <p className="text-[10px] font-semibold text-black/40 uppercase tracking-widest">
                  {new Date(month.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(month.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-black/30">Journals</span>
                    <span className="text-xs font-bold text-black">{month.journals_count}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
