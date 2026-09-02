"use client";

import { useState } from "react";
import CreateJournal from "@/forms/journals/CreateJournal";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import FiscalYearJournals from "@/components/financialyears/FiscalYearJournals";

export default function FinanceJournalsPage() {
  const { reference } = useParams();
  const { data: fiscalYear, refetch: refetchFiscalYear } = useFetchFinancialYear(reference as string);
  const [openCreateJournal, setOpenCreateJournal] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/finance/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href="/finance/fiscal-years" className="hover:text-black hover:underline">Fiscal Years</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href={`/finance/fiscal-years/${reference}`} className="hover:text-black hover:underline">
              {fiscalYear?.code}
            </a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <span className="font-semibold text-black">Journals</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black tracking-tighter">
            Transaction Journals
          </h1>
          <p className="text-black/60 font-medium mt-1">
            Manage daily journal batches and financial entries
          </p>
        </div>
        <button
          onClick={() => setOpenCreateJournal(true)}
          className="flex items-center justify-center h-12 px-6 bg-[#045138] hover:bg-black text-white rounded font-semibold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Journal Batch
        </button>
      </div>

      <FiscalYearJournals
        journals={fiscalYear?.journals || []}
        rolePrefix="finance"
        fiscalYearReference={reference as string}
      />

      {/* Manual Modal Implementation for Create Journal */}
      {openCreateJournal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-200">
          <CreateJournal
            refetch={refetchFiscalYear}
            fiscalYear={fiscalYear?.code}
            rolePrefix="finance"
            onSuccess={() => setOpenCreateJournal(false)}
            onClose={() => setOpenCreateJournal(false)}
            className="min-h-screen border-none shadow-none rounded"
          />
        </div>
      )}
    </div>
  );
}
