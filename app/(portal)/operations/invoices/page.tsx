"use client";

import InvoicesList from "@/components/financials/InvoicesList";
import { FileText, Plus } from "lucide-react";
import CreateInvoiceModal from "@/forms/financials/CreateInvoiceModal";

export default function OperationsInvoicesPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-1">
              Revenue Control
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight italic">
              Invoices <span className="text-blue-600">Archival</span>
            </h1>
          </div>
        </div>

        <CreateInvoiceModal 
          rolePrefix="operations"
          trigger={
            <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/10 active:scale-95 group">
              <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
              Create New Invoice
            </button>
          }
        />
      </div>

      <div className="bg-slate-50/50 p-1 rounded border border-slate-100">
        <div className="bg-white p-10 rounded shadow-sm">
          <InvoicesList rolePrefix="operations" />
        </div>
      </div>
    </div>
  );
}
