"use client";

import QuotationsList from "@/components/financials/QuotationsList";
import { FileBadge, Plus, Zap, ClipboardList } from "lucide-react";
import CreateQuotationModal from "@/forms/quotations/CreateQuotationModal";

export default function FinanceQuotationsPage() {
  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded bg-slate-900 flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 group">
            <Zap className="w-10 h-10 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Billing & Proposals
              </p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                <FileBadge className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Treasury Review</span>
              </div>
            </div>
            <h1 className="text-5xl font-semibold text-slate-900 tracking-tighter italic">
              Financial <span className="text-emerald-600 font-bold">Quotations</span>
            </h1>
          </div>
        </div>

        <CreateQuotationModal 
          rolePrefix="finance"
          trigger={
            <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group">
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
               Draft Quotation
            </button>
          }
        />
      </div>

      {/* Main Content with Premium Framing */}
      <div className="bg-white/40 backdrop-blur-3xl p-1 rounded border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="bg-white p-12 rounded shadow-inner">
          <QuotationsList rolePrefix="finance" />
        </div>
      </div>
    </div>
  );
}
