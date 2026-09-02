/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useFetchJournal } from "@/hooks/journals/actions";
import { postJournal } from "@/services/journals";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SingleJournalEntry from "@/forms/journalentries/SingleJournalEntry";
import UpdateJournal from "@/forms/journals/UpdateJournal";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  Edit2,
  Lock,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import JournalEntryDetailModal from "@/components/journals/JournalEntryDetailModal";
import { JournalEntry } from "@/services/journalentries";
import { cn } from "@/lib/utils";

export default function JournalsDetailPage() {
  const { reference, journal_reference } = useParams();
  const router = useRouter();
  const header = useAxiosAuth();
  const { data: fiscalYear } = useFetchFinancialYear(reference as string);
  const {
    isLoading,
    data: journal,
    refetch: refetchJournal,
  } = useFetchJournal(journal_reference as string);

  const [entryMode, setEntryMode] = useState<"single" | null>(null);
  const [openUpdateJournal, setOpenUpdateJournal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isPosting, setIsPosting] = useState(false);

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

  const handlePostJournal = async () => {
    if (!journal) return;
    if (!isBalanced) {
      toast.error("Journal MUST be balanced before posting");
      return;
    }
    if (journal.journal_entries.length === 0) {
      toast.error("Cannot post an empty journal");
      return;
    }

    try {
      setIsPosting(true);
      await postJournal(journal.reference, header);
      toast.success("Journal posted successfully");
      refetchJournal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to post journal");
    } finally {
      setIsPosting(false);
    }
  };

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
        <ol className="flex flex-wrap items-center gap-2 text-sm text-black/60">
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
            <a href={`/finance/fiscal-years/${reference}/journals`} className="hover:text-black hover:underline">
              Journals
            </a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <span className="font-semibold text-black">{journal.description}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded border border-black/5 bg-white shadow-sm hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span
              className={`px-4 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest border-none ${journal.is_posted
                ? "bg-green-500/10 text-green-600 shadow-sm shadow-green-500/10"
                : "bg-orange-500/10 text-orange-600 shadow-sm shadow-orange-500/10"
                }`}
            >
              {journal.is_posted ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> POSTED
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> PENDING
                </div>
              )}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-black tracking-tighter mb-2">
              {journal.description || "Untitled Journal Batch"}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-black/40">
              <span className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded border border-black/5">
                <Calendar className="w-4 h-4" />
                {new Date(journal.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="bg-[#045138]/10 text-[#045138] px-3 py-1 rounded">
                {journal.journal_type}
              </span>
              {journal.source_transaction && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded flex items-center gap-1.5 border border-slate-200">
                    <Receipt className="w-3.5 h-3.5" />
                    Source: {journal.source_transaction.code}
                  </span>
                  {journal.source_transaction.document_number && (
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded flex items-center gap-1.5 border border-slate-200 font-mono">
                      Ref: {journal.source_transaction.document_number}
                    </span>
                  )}
                  {journal.source_transaction.document_url && (
                    <a
                      href={journal.source_transaction.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors px-3 py-1 rounded flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Document
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            className="flex items-center justify-center px-4 h-12 border border-black/5 bg-white hover:bg-black/5 font-semibold uppercase text-xs tracking-widest rounded transition-colors"
            onClick={() => setOpenUpdateJournal(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Details
          </button>

          {!journal.is_posted && (
            <>
              <button
                onClick={() => setEntryMode("single")}
                className="flex items-center justify-center px-4 h-12 bg-[#D0402B] border border-black/5 text-white hover:bg-[#D0402B]/90 font-bold uppercase text-[10px] tracking-widest rounded shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </button>

              <button
                onClick={handlePostJournal}
                disabled={isPosting || !isBalanced}
                className={`flex items-center justify-center px-4 h-12 font-semibold uppercase text-xs tracking-widest rounded shadow-lg transition-all ${!isBalanced
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#045138] hover:bg-black text-white"
                  }`}
              >
                {isPosting ? (
                  <LoadingSpinner />
                ) : (
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Finalize & Post
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm">
          <div className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-2">
              Total Debit
            </p>
            <p
              className="text-xl font-semibold text-black tracking-tight underline decoration-dotted decoration-emerald-500"
              title={new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: journal.currency,
              }).format(totalDebit)}
            >
              {new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: journal.currency,
              }).format(totalDebit)}
            </p>
          </div>
        </div>
        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded shadow-sm">
          <div className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-2">
              Total Credit
            </p>
            <p
              className="text-xl font-semibold text-black tracking-tight underline decoration-dotted decoration-indigo-500"
              title={new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: journal.currency,
              }).format(totalCredit)}
            >
              {new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: journal.currency,
              }).format(totalCredit)}
            </p>
          </div>
        </div>
        <div
          className={`border border-black/5 backdrop-blur-xl rounded shadow-sm transition-colors ${isBalanced
            ? "bg-[#045138]/5 border-[#045138]/20"
            : "bg-red-500/5 border-red-500/20"
            }`}
        >
          <div className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-2">
              Balance Status
            </p>
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
              <p
                className={`text-xl font-semibold tracking-tight ${isBalanced ? "text-[#045138]" : "text-red-600"
                  }`}
              >
                {isBalanced ? "Balanced" : "Unbalanced"}
              </p>
              {!isBalanced && (
                <span className="px-3 py-1 bg-red-500 text-white font-semibold text-xs rounded w-fit">
                  Diff:{" "}
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: journal.currency,
                  }).format(Math.abs(totalDebit - totalCredit))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="border border-gray-200 bg-white rounded shadow-sm pb-12">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-3">
            <Receipt className="w-4 h-4 text-gray-500" />
            Transaction Entries
          </h3>
          <span className="bg-gray-100 px-3 py-1 rounded text-xs font-semibold text-gray-600">
            {journal.journal_entries.length} Entries
          </span>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Account Book</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Partner / Division</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Debit</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {journal.journal_entries.map((entry) => (
                  <tr
                    key={entry.reference}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{entry.book}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{entry.code}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-800">{entry.partner || "—"}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5">{entry.division}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-emerald-600">
                      {parseFloat(entry.debit) > 0
                        ? new Intl.NumberFormat("en-KE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                        }).format(parseFloat(entry.debit))
                        : "—"}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-indigo-600">
                      {parseFloat(entry.credit) > 0
                        ? new Intl.NumberFormat("en-KE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                        }).format(parseFloat(entry.credit))
                        : "—"}
                    </td>
                  </tr>
                ))}
                {journal.journal_entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                      No transaction records found in this batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {entryMode === "single" && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
          <SingleJournalEntry
            rolePrefix="finance"
            journalReference={journal.code}
            currentTotals={{ debit: totalDebit, credit: totalCredit, balance: totalDebit - totalCredit }}
            onSuccess={() => setEntryMode(null)}
            onClose={() => setEntryMode(null)}
            refetch={refetchJournal}
            className="min-h-screen border-none shadow-none rounded-none"
          />
        </div>
      )}

      {/* Manual Modal for Update Journal */}
      {openUpdateJournal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-200">
          <UpdateJournal
            journal={journal}
            onClose={() => setOpenUpdateJournal(false)}
            className="min-h-screen border-none shadow-none rounded"
          />
        </div>
      )}

      {/* Detail Modal */}
      <JournalEntryDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
