"use client";

import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { useFetchBook } from "@/hooks/books/actions";
import { useParams } from "next/navigation";
import {
  Book as BookIcon,
  History,
  ArrowUpRight,
  Receipt,
  ShieldCheck,
  Landmark,
  Activity,
  Calendar,
  Hash,
  ArrowUpDown,
  Wallet,
} from "lucide-react";


export default function FinanceBookDetailPage() {
  const { reference, book_reference } = useParams<{
    reference: string;
    book_reference: string;
  }>();

  const { isLoading: isLoadingBook, data: book } = useFetchBook(book_reference);

  if (isLoadingBook) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 pb-12">
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/finance/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href="/finance/coa" className="hover:text-black hover:underline">COA</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href={`/finance/coa/${reference}`} className="hover:text-black hover:underline">
              {book?.account_type}
            </a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href={`/finance/coa/${reference}/${book?.reference}`} className="font-semibold text-black">
              {book?.name}
            </a>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-[#045138] flex items-center justify-center text-white shadow-lg shadow-[#045138]/20">
              {book?.is_bank ? (
                <Landmark className="w-4 h-4" />
              ) : (
                <BookIcon className="w-4 h-4" />
              )}
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#045138]">
              Ledger Account Deep-Dive
            </p>
          </div>
          <h2 className="text-xl font-semibold">
            {book?.name}
          </h2>
          <p className="text-black/40 font-semibold mt-1 text-sm">
            Classification:{" "}
            <span className="text-black uppercase">{book?.account_type}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {book?.is_active ? (
            <span className="bg-green-500/10 text-green-600 border-none font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded">
              Active Ledger
            </span>
          ) : (
            <span className="bg-black/5 text-black/40 border-none font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded">
              Retired
            </span>
          )}
        </div>
      </div>

      {/* Meta Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  {book?.created_at && new Date(book.created_at).toLocaleDateString()}
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
                  Book Code
                </p>
                <p className="text-base font-semibold text-black tracking-tight font-mono">
                  {book?.code}
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
                  {(book as any).normal_balance}
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
                  {parseFloat((book as any).balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History (Journal Entries) */}
      <div className="border border-black/5 bg-white/50 backdrop-blur-xl rounded overflow-hidden shadow-xl shadow-black/5">
        <div className="p-4 border-b border-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-[#045138]/10 flex items-center justify-center text-[#045138]">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black tracking-tight">
                  Ledger History
                </h3>
                <p className="text-black/30 font-semibold uppercase text-[9px] mt-0.5">
                  Chronological Transaction Records
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 bg-black/5">
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Post Date
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Partner / Branch
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Debit
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Credit
                  </th>
                  {/* <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60 text-center">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {book?.journal_entries && book.journal_entries.length > 0 ? (
                  book.journal_entries.map((entry) => (
                    <tr
                      key={entry.reference}
                      className="hover:bg-green-50/20 transition-colors group"
                    >
                      <td className="py-2.5 px-4 border-b border-black/5">
                        <p className="text-sm font-medium text-black">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] font-semibold text-black/30 uppercase mt-0.5">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5">
                        <span className="text-sm">
                          {entry.division || "Entity Core"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5 text-right">
                        <p className="text-sm font-medium text-green-600">
                          {entry.currency}{" "}
                          {parseFloat(entry.debit).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5 text-right">
                        <p className="text-sm font-medium text-[#045138]">
                          {entry.currency}{" "}
                          {parseFloat(entry.credit).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                      {/* TODO: Opens a modal with the details of the receipts */}
                      {/* <td className="py-2.5 px-4 border-b border-black/5">
                        <div className="flex justify-center">
                          <button className="w-7 h-7 rounded bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#045138]">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/20 mb-3">
                          <History className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-semibold text-black/30 uppercase tracking-widest">
                          No financial history detected
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
