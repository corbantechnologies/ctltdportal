"use client";

import FinancialYearsList from "@/components/financialyears/FinancialYearsList";
import { CalendarRange, Plus } from "lucide-react";

export default function OperationsFiscalYearsPage() {
  return (
    <div className="space-y-6 pb-6 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <CalendarRange className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              Period Management
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter italic">
            Fiscal <span className="text-blue-600">Years</span>
          </h1>
          <p className="text-gray-400 font-semibold mt-0.5 text-xs max-w-md">
            Operational view of corporate fiscal periods. Review and audit financial timelines.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <FinancialYearsList rolePrefix="operations" />
      </div>
    </div>
  );
}
