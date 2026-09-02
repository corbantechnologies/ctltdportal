"use client";

import InvoicesList from "@/components/financials/InvoicesList";
import { Landmark, FileText, ShieldCheck, Plus } from "lucide-react";
import CreateInvoiceModal from "@/forms/financials/CreateInvoiceModal";

export default function DirectorInvoicesPage() {
  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded bg-black flex items-center justify-center text-white shadow-2xl transition-transform hover:rotate-6 active:scale-95 group">
            <Landmark className="w-10 h-10 group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D0402B]">
                Financial Oversight
              </p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Audit Ready</span>
              </div>
            </div>
            <h1 className="text-5xl font-semibold text-black tracking-tighter italic">
              Invoice <span className="text-[#D0402B] font-bold">Registry</span>
            </h1>
          </div>
        </div>

        <CreateInvoiceModal 
          rolePrefix="director"
          trigger={
            <button className="flex items-center gap-3 px-8 py-4 bg-black hover:bg-[#D0402B] text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-black/20 active:scale-95 group">
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
               New Invoice
            </button>
          }
        />
      </div>

      {/* Main Content with Premium Framing */}
      <div className="bg-white/40 backdrop-blur-3xl p-1 rounded border border-black/5 shadow-2xl shadow-black/5">
        <div className="bg-white p-12 rounded shadow-inner">
          <InvoicesList rolePrefix="director" />
        </div>
      </div>
    </div>
  );
}
