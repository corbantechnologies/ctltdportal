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
            <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/20">
              <Database className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              Operational Lifecycle
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter italic">
            Chart of <span className="text-[#2563EB]">Accounts</span>
          </h1>
          <p className="text-black/40 font-semibold mt-0.5 text-xs max-w-md">
            The foundational structure of your operations. Organize and
            oversee all general ledger accounts.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded text-[10px] font-semibold uppercase tracking-widest shadow-lg shadow-[#2563EB]/20 hover:bg-[#1d4ed8] transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Account
        </button>
      </div>

      <div className="pt-4 border-t border-black/5">
        <COAList rolePrefix="operations" />
      </div>

      {/* Manual Modal Implementation */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-300">
            <CreateCOA
              rolePrefix="operations"
              onSuccess={() => setOpen(false)}
              onClose={() => setOpen(false)}
              className="border-none shadow-none rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
