"use client";

import ReceiptsList from "@/components/financials/ReceiptsList";
import { FileCheck, Plus } from "lucide-react";
import Link from "next/link";

export default function OperationsReceiptsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 mb-1">
              Payment Clearing &amp; Vault
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight italic">
              Official <span className="text-emerald-600">Receipts</span>
            </h1>
          </div>
        </div>

        <Link
          href="/operations/receipts/new"
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-95 group"
        >
          <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
          Issue Payment Receipt
        </Link>
      </div>

      <div className="bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm">
          <ReceiptsList rolePrefix="operations" />
        </div>
      </div>
    </div>
  );
}
