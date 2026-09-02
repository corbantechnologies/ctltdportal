"use client";

import COAList from "@/components/coa/COAList";
import CreateCOA from "@/forms/coa/CreateCOA";
import { Database, Plus } from "lucide-react";
import { useState } from "react";

export default function COAPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-md shadow-[#D0402B]/20">
              <Database className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D0402B]">
              Financial Architecture
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter italic">
            Chart of <span className="text-[#D0402B]">Accounts</span>
          </h1>
          <p className="text-black/40 font-semibold mt-0.5 text-xs max-w-md">
            The foundational structure of your financial entity. Organize and
            oversee all general ledger accounts.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-10 px-4 bg-[#D0402B] hover:bg-black text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#D0402B]/20 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          Initialize New Account
        </button>
      </div>

      <div className="pt-4 border-t border-black/5">
        <COAList rolePrefix="director" />
      </div>

      {/* Elegant Modal Implementation */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300">
            <CreateCOA
              rolePrefix="director"
              onSuccess={() => setOpen(false)}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
