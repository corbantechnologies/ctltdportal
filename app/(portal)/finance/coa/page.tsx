"use client";

import COAList from "@/components/coa/COAList";
import CreateCOA from "@/forms/coa/CreateCOA";
import { Database, Plus } from "lucide-react";
import { useState } from "react";

export default function FinanceCOAPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#045138] flex items-center justify-center text-white shadow-md shadow-[#045138]/20">
              <Database className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase text-[#045138]">
              Ledger Management
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black">
            Chart of <span className="text-[#045138]">Accounts</span>
          </h1>
          <p className="text-black/40 font-semibold mt-0.5 text-xs max-w-md">
            The technical backbone of fiscal operations. Create and manage the
            financial classification system.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-9 px-2 bg-black hover:bg-[#045138] text-white rounded text-xs transition-all shadow-md active:scale-95 group"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-90 transition-transform" />
          Register New Account
        </button>
      </div>

      <div className="pt-4 border-t border-black/5">
        <COAList rolePrefix="finance" />
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
              rolePrefix="finance"
              onSuccess={() => setOpen(false)}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
