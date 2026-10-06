/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchJournal } from "@/hooks/journals/actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="space-y-4 pb-12">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/operations/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <Link href="/operations/fiscal-years" className="hover:text-slate-900 transition-colors">Fiscal Years</Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <Link href={`/operations/fiscal-years/${reference}`} className="hover:text-slate-900 transition-colors">
              {fiscalYear?.code || reference}
            </Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <Link href={`/operations/fiscal-years/${reference}/journals`} className="hover:text-slate-900 transition-colors">
              Journals
            </Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <span className="font-semibold text-slate-900 truncate max-w-xs">{journal.description || journal.code}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 border border-slate-200 rounded">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors flex-shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                {journal.description || "Untitled Journal Batch"}
              </h1>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1",
                  journal.is_posted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                )}
              >
                {journal.is_posted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> POSTED
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-blue-600" /> PENDING
                  </>
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                {new Date(journal.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-slate-300">•</span>
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase">
                {journal.journal_type}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-slate-600">Batch: {journal.code}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="h-8 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
        >
          Print Summary
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-slate-200 bg-white rounded p-3 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Debit</p>
          <p className="text-base font-semibold text-emerald-700 font-mono">
            {new Intl.NumberFormat("en-KE", { style: "currency", currency: journal.currency }).format(totalDebit)}
          </p>
        </div>
        <div className="border border-slate-200 bg-white rounded p-3 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Credit</p>
          <p className="text-base font-semibold text-indigo-700 font-mono">
            {new Intl.NumberFormat("en-KE", { style: "currency", currency: journal.currency }).format(totalCredit)}
          </p>
        </div>
        <div className={cn(
          "border rounded p-3 shadow-xs transition-colors",
          isBalanced ? "bg-emerald-50/20 border-emerald-200" : "bg-rose-50/20 border-rose-200"
        )}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Balance Integrity</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded",
              isBalanced ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            )}>
              {isBalanced ? "Balanced" : "Out of Balance"}
            </span>
            {!isBalanced && (
              <span className="text-xs font-mono font-semibold text-rose-700">
                Diff: {Math.abs(totalDebit - totalCredit).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="border border-slate-200 bg-white rounded shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            Transaction Entries ({journal.journal_entries.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Click row to view details
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2.5 px-3">Account Book</th>
                <th className="py-2.5 px-3">Partner / Division</th>
                <th className="py-2.5 px-3 text-right">Debit</th>
                <th className="py-2.5 px-3 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {journal.journal_entries.map((entry) => (
                <tr
                  key={entry.reference}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{entry.book}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{entry.code}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {entry.partner ? (
                      <Link
                        href={
                          entry.partner_reference
                            ? `/operations/partners/${entry.partner_reference}`
                            : `/operations/partners`
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline inline-block"
                      >
                        {entry.partner}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                    <div className="text-[11px] text-slate-500">{entry.division}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                    {parseFloat(entry.debit) > 0
                      ? new Intl.NumberFormat("en-KE", { style: "decimal", minimumFractionDigits: 2 }).format(parseFloat(entry.debit))
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-indigo-700">
                    {parseFloat(entry.credit) > 0
                      ? new Intl.NumberFormat("en-KE", { style: "decimal", minimumFractionDigits: 2 }).format(parseFloat(entry.credit))
                      : "—"}
                  </td>
                </tr>
              ))}
              {journal.journal_entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    No transaction lines recorded in this batch.
                  </td>
                </tr>
              )}
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
