"use client";

import FinancialYearsList from "@/components/financialyears/FinancialYearsList";
import CreateFiscalYear from "@/forms/financialyears/CreateFiscalYear";
import { CalendarRange, Plus } from "lucide-react";
import { useState } from "react";

export default function FiscalYearsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-6 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#045138] flex items-center justify-center text-white shadow-md shadow-[#045138]/20">
              <CalendarRange className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#045138]">
              Period Management
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter italic">
            Fiscal <span className="text-[#045138]">Years</span>
          </h1>
          <p className="text-gray-400 font-semibold mt-0.5 text-xs max-w-md">
            The temporal backbone of financial reporting. View and manage fiscal
            periods.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-6 rounded bg-[#045138] text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#045138]/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Initialize Fiscal Year
        </button>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <FinancialYearsList rolePrefix="finance" />
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
              primaryColor="#045138"
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
