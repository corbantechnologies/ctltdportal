"use client";

import { useFetchCOA } from "@/hooks/coa/actions";
import BooksList from "@/components/coa/BooksList";
import UpdateCOA from "@/forms/coa/UpdateCOA";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  Database,
  ChevronRight,
  Edit3,
  Hash,
  ArrowUpDown,
  Activity,
  ArrowLeft,
  BookPlus,
  Calendar,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import CreateBook from "@/forms/books/CreateBook";
import { useParams } from "next/navigation";
import { useState } from "react";


export default function FinanceCOADetailPage() {
  const { reference } = useParams();
  const { isLoading, data: coa, refetch: refetchCOA } = useFetchCOA(reference as string);
  const [open, setOpen] = useState(false);
  const [openCreateBook, setOpenCreateBook] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (!coa)
    return (
      <div className="p-12 text-center font-semibold text-black/20">
        Account not found.
      </div>
    );

  return (
    <div className="space-y-12 pb-12">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-black/40">
            <Link
              href="/finance/coa"
              className="hover:text-[#045138] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Chart of Accounts
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-black/20">{coa.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#045138] flex items-center justify-center text-white shadow-xl shadow-[#045138]/20">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-semibold leading-none">
                {coa.name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-black text-white border-none font-semibold text-[10px] uppercase tracking-widest px-2 py-1 rounded">
                  CODE: {coa.code}
                </span>
                {coa.is_active ? (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-black/40 bg-black/5 px-3 py-1 rounded border border-black/10">
                    <div className="w-1.5 h-1.5 rounded bg-black/20" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Inactive
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenCreateBook(true)}
            className="flex items-center justify-center h-10 px-4 bg-white border border-black/5 hover:bg-black/5 text-black rounded font-semibold text-sm transition-all shadow-sm active:scale-95 group"
          >
            <BookPlus className="w-5 h-5 mr-2 group-hover:text-[#045138] transition-colors" />
            Add Ledger Book
          </button>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center h-10 px-4 bg-black hover:bg-[#045138] text-white rounded font-semibold text-sm transition-all shadow-xl active:scale-95 group"
          >
            <Edit3 className="w-5 h-5 mr-2" />
            Update Account
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Created
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {new Date(coa.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Account Code
                </p>
                <p className="text-base font-semibold text-black tracking-tight font-mono">
                  {coa.code}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-black/5 flex items-center justify-center text-black/40">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Normal Balance
                </p>
                <p className="text-base font-semibold text-black tracking-tight uppercase">
                  {(coa as any).normal_balance}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center text-green-600">
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

      {/* Associated Books Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-black/5" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-black/20">
            Associated Ledger Books
          </h2>
          <div className="flex-1 h-px bg-black/5" />
        </div>

        <BooksList
          books={coa.books || []}
          rolePrefix="finance"
          coaReference={coa.reference}
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
              rolePrefix="finance"
              onSuccess={() => setOpen(false)}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
 
      {/* Elegant Modal Implementation for Create Book */}
      {openCreateBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setOpenCreateBook(false)}
          />
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300">
            <CreateBook
              rolePrefix="finance"
              initialCOA={coa.name}
              onSuccess={() => setOpenCreateBook(false)}
              onClose={() => setOpenCreateBook(false)}
              refetch={refetchCOA}
            />
          </div>
        </div>
      )}
    </div>
  );
}
