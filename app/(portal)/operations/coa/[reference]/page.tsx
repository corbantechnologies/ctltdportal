"use client";

import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { useFetchCOA } from "@/hooks/coa/actions";
import { useParams } from "next/navigation";
import {
  Database,
  Book as BookIcon,
  ShieldCheck,
  Hash,
  ArrowUpDown,
  Wallet,
} from "lucide-react";

import BooksList from "@/components/coa/BooksList";

export default function COADetailPage() {
  const { reference } = useParams<{ reference: string }>();

  const { isLoading: isLoadingCOA, data: coa } = useFetchCOA(reference);

  if (isLoadingCOA) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 pb-12">
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/operations/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href="/operations/coa" className="hover:text-black hover:underline">COA</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <span className="font-semibold text-black">{coa?.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-[#2563EB]/20">
              <Hash className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#2563EB]">
              Account Classification
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter">
            {coa?.name}
          </h1>
          <p className="text-black/40 font-semibold mt-1 text-sm italic">
            Registry Code: <span className="text-black">{coa?.code}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {coa?.is_active ? (
            <span className="bg-green-500/10 text-green-600 border-none font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded inline-block">
              Active Classification
            </span>
          ) : (
            <span className="bg-black/5 text-black/40 border-none font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded inline-block">
              Deactivated
            </span>
          )}
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-black/5 bg-white/50 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#2563EB]/5 flex items-center justify-center text-[#2563EB]">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Normal Balance
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {coa?.normal_balance} Side
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-green-500/10 flex items-center justify-center text-green-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Current Balance
                </p>
                <p className="text-base font-semibold text-green-600 tracking-tight">
                  KES{" "}
                  {parseFloat((coa as any).balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-black/5">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-black/5 flex items-center justify-center text-black/40">
              <BookIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black tracking-tight italic">
                Associated Ledger <span className="text-[#2563EB]">Books</span>
              </h2>
              <p className="text-[10px] font-semibold text-black/30 uppercase tracking-widest mt-0.5">
                Segmented accounts under {coa?.name}
              </p>
            </div>
          </div>
        </div>

        <BooksList
          books={coa?.books || []}
          rolePrefix="operations"
          coaReference={reference}
        />
      </div>
    </div>
  );
}
