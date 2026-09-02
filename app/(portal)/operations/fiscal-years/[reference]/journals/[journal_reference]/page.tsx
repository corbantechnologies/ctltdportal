/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchJournal } from "@/hooks/journals/actions";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Receipt,
  Lock,
} from "lucide-react";

import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import JournalEntryDetailModal from "@/components/journals/JournalEntryDetailModal";
import { JournalEntry } from "@/services/journalentries";
import { cn } from "@/lib/utils";

export default function OperationsJournalsDetailPage() {
  const { reference, journal_reference } = useParams();
  const router = useRouter();
  const { data: fiscalYear } = useFetchFinancialYear(reference as string);
  const {
    isLoading,
    data: journal,
  } = useFetchJournal(journal_reference as string);

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Calculate totals
  const totalDebit =
    journal?.journal_entries?.reduce(
      (sum, entry) => sum + parseFloat(entry.debit),
      0,
    ) || 0;
  const totalCredit =
    journal?.journal_entries?.reduce(
      (sum, entry) => sum + parseFloat(entry.credit),
      0,
    ) || 0;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (isLoading) return <LoadingSpinner />;
  if (!journal)
    return (
      <div className="p-12 text-center font-semibold text-black/20">
        Journal not found.
      </div>
    );

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
          <li>
            <a href="/operations/dashboard" className="hover:text-black transition-colors">Dashboard</a>
          </li>
          <li><span className="text-black/10">/</span></li>
          <li>
            <a href="/operations/fiscal-years" className="hover:text-black transition-colors">Fiscal Years</a>
          </li>
          <li><span className="text-black/10">/</span></li>
          <li>
            <a href={`/operations/fiscal-years/${reference}`} className="hover:text-black transition-colors">{fiscalYear?.code}</a>
          </li>
          <li><span className="text-black/10">/</span></li>
          <li>
            <a href={`/operations/fiscal-years/${reference}/journals`} className="hover:text-black transition-colors">Journals</a>
          </li>
          <li><span className="text-black/10">/</span></li>
          <li>
            <span className="text-black">{journal.description}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 text-blue-600">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded border border-black/5 bg-white shadow-sm hover:bg-black/5 transition-colors text-black"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span
              className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest ${journal.is_posted
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600"
                }`}
            >
              {journal.is_posted ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> POSTED
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> PENDING
                </span>
              )}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tighter">
              {journal.description || "Untitled Batch"}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-black/40 mt-1 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(journal.date).toLocaleDateString()}
              </span>
              <span className="text-black/10">|</span>
              <span className="text-blue-600">
                {journal.journal_type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
        <div className="p-6 bg-white border border-black/5 rounded shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 mb-1">Total Debits</p>
          <p className="text-xl font-bold text-black font-mono">
            {new Intl.NumberFormat("en-KE", { style: "currency", currency: journal.currency }).format(totalDebit)}
          </p>
        </div>
        <div className="p-6 bg-white border border-black/5 rounded shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 mb-1">Total Credits</p>
          <p className="text-xl font-bold text-black font-mono">
            {new Intl.NumberFormat("en-KE", { style: "currency", currency: journal.currency }).format(totalCredit)}
          </p>
        </div>
        <div className={cn(
          "p-6 border rounded shadow-sm border-black/5 transition-all font-bold",
          isBalanced ? "bg-emerald-50/50" : "bg-red-50"
        )}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 mb-1">Balance Integrity</p>
          <div className="flex items-center gap-2">
            <span className={cn("text-xl font-bold uppercase tracking-tighter", isBalanced ? "text-emerald-700" : "text-red-700")}>
              {isBalanced ? "Balanced" : "Unbalanced"}
            </span>
            {!isBalanced && (
              <span className="text-[9px] font-bold px-2 py-0.5 bg-red-600 text-white rounded">
                Diff: {Math.abs(totalDebit - totalCredit).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white border border-black/5 rounded overflow-hidden shadow-sm">
        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-3">
            <Receipt className="w-4 h-4 text-blue-600" />
            Ledger Activity
          </h3>
          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
            {journal.journal_entries.length} Entries recorded
          </span>
        </div>
        <div className="overflow-x-auto font-medium">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-black/5">
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Account Book</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40">Partner / Division</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40 text-right">Debit</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-black/40 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {journal.journal_entries.map((entry) => (
                <tr key={entry.reference} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedEntry(entry)}>
                  <td className="py-4 px-6">
                    <div className="font-bold text-black transition-colors">{entry.book}</div>
                    <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-0.5">{entry.code}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-black">{entry.partner || "—"}</div>
                    <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-0.5">{entry.division}</div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-black/60">
                    {parseFloat(entry.debit) > 0 ? parseFloat(entry.debit).toLocaleString() : "—"}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-black/60">
                    {parseFloat(entry.credit) > 0 ? parseFloat(entry.credit).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <JournalEntryDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
