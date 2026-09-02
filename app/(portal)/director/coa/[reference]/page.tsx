"use client";

import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { useFetchCOA } from "@/hooks/coa/actions";
import { useParams, useRouter } from "next/navigation";
import {
  Database,
  Book as BookIcon,
  ShieldCheck,
  Hash,
  ArrowUpDown,
  Wallet,
  Edit3,
  ArrowLeft,
  ChevronRight,
  PieChart,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import BooksList from "@/components/coa/BooksList";
import UpdateCOA from "@/forms/coa/UpdateCOA";

export default function COADetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { isLoading: isLoadingCOA, data: coa, refetch } = useFetchCOA(reference);

  if (isLoadingCOA) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-black/40">
            <Link
              href="/director/coa"
              className="hover:text-[#D0402B] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Chart of Accounts
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-black/20">{coa?.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-xl shadow-[#D0402B]/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-black tracking-tighter">
                {coa?.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="bg-black text-white border-none font-semibold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded">
                  CODE: {coa?.code}
                </span>
                {coa?.is_active ? (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-green-600">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-black/40 bg-black/5 px-3 py-1 rounded border border-black/10">
                    <div className="w-1.5 h-1.5 rounded bg-black/20" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Deactivated
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center h-10 px-4 bg-[#D0402B] hover:bg-black text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#D0402B]/20 active:scale-95 group"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Update classification
          </button>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-black/5 bg-white/50 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#D0402B]/5 flex items-center justify-center text-[#D0402B]">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Normal Balance
                </p>
                <p className="text-base font-semibold text-black tracking-tight uppercase">
                  {coa?.normal_balance}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/50 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#D0402B]/5 flex items-center justify-center text-[#D0402B]">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Report Role
                </p>
                <p className="text-base font-semibold text-black tracking-tight uppercase">
                  {coa?.report_role}
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
                  Total Exposure
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
                Associated Ledger <span className="text-[#D0402B]">Books</span>
              </h2>
              <p className="text-[10px] font-semibold text-black/30 uppercase tracking-widest mt-0.5">
                Segmented accounts under {coa?.name}
              </p>
            </div>
          </div>
        </div>

        <BooksList
          books={coa?.books || []}
          rolePrefix="director"
          coaReference={reference}
        />
      </div>

      {/* Elegant Modal Implementation for Update */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300">
            <UpdateCOA
              coa={coa as any}
              rolePrefix="director"
              onSuccess={() => {
                setOpen(false);
                refetch();
              }}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
