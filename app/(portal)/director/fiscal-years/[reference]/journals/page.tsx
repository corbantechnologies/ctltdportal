"use client";


import { useParams } from "next/navigation";
import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import FiscalYearJournals from "@/components/financialyears/FiscalYearJournals";

export default function FinanceJournalsPage() {
  const { reference } = useParams();
  const { data: fiscalYear } = useFetchFinancialYear(reference as string);

  return (
    <div className="space-y-8 pb-12">
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/director/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href="/director/fiscal-years" className="hover:text-black hover:underline">Fiscal Years</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href={`/director/fiscal-years/${reference}`} className="hover:text-black hover:underline">{fiscalYear?.code}</a>
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
      </div>

      <FiscalYearJournals
        journals={fiscalYear?.journals || []}
        rolePrefix="director"
        fiscalYearReference={reference as string}
      />
    </div>
  );
}
