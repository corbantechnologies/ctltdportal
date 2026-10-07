/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useFetchJournal } from "@/hooks/journals/actions";
import { postJournal, reverseJournal } from "@/services/journals";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import SingleJournalEntry from "@/forms/journalentries/SingleJournalEntry";
import UpdateJournal from "@/forms/journals/UpdateJournal";
import ReverseJournalModal from "@/components/journals/ReverseJournalModal";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  Edit2,
  Lock,
  FileText,
  RotateCcw,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import JournalEntryDetailModal from "@/components/journals/JournalEntryDetailModal";
import { JournalEntry } from "@/services/journalentries";
import { cn } from "@/lib/utils";

export default function JournalsDetailPage() {
  const { reference, journal_reference } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const header = useAxiosAuth();
  const { data: fiscalYear } = useFetchFinancialYear(reference as string);
  const {
    isLoading,
    data: journal,
    refetch: refetchJournal,
  } = useFetchJournal(journal_reference as string);

  const [entryMode, setEntryMode] = useState<"single" | null>(null);

  useEffect(() => {
    if (searchParams.get("addEntry") === "true") {
      setEntryMode("single");
    }
  }, [searchParams]);
  const [openUpdateJournal, setOpenUpdateJournal] = useState(false);
  const [openReverseModal, setOpenReverseModal] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
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

  const handleReverseJournal = async (data: { reversal_date: string; reason: string }) => {
    if (!journal) return;
    try {
      setIsReversing(true);
      const res = await reverseJournal(journal.reference, data, header);
      toast.success(res.message || "Journal reversed successfully");
      setOpenReverseModal(false);
      refetchJournal();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to reverse journal");
    } finally {
      setIsReversing(false);
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
    <div className="space-y-4 pb-12">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/finance/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <Link href="/finance/fiscal-years" className="hover:text-slate-900 transition-colors">Fiscal Years</Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <Link href={`/finance/fiscal-years/${reference}`} className="hover:text-slate-900 transition-colors">
              {fiscalYear?.code || reference}
            </Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li>
            <Link href={`/finance/fiscal-years/${reference}/journals`} className="hover:text-slate-900 transition-colors">
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
                  journal.is_reversed
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : journal.is_posted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                )}
              >
                {journal.is_reversed ? (
                  <>
                    <RotateCcw className="w-3 h-3 text-purple-600" /> REVERSED
                  </>
                ) : journal.is_posted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> POSTED
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" /> PENDING
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
              {journal.source_transaction && (
                <>
                  <span className="text-slate-300">•</span>
                  <Link
                    href={`/finance/simple-transactions?search=${encodeURIComponent(journal.source_transaction.code)}`}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border border-blue-200 transition-colors"
                  >
                    <Receipt className="w-3 h-3 text-blue-500" />
                    Source: {journal.source_transaction.code}
                  </Link>
                  {journal.source_transaction.document_number && (
                    <span className="text-slate-500 font-mono text-[11px]">
                      (Ref: {journal.source_transaction.document_number})
                    </span>
                  )}
                  {journal.source_transaction.document_url && (
                    <a
                      href={journal.source_transaction.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                    >
                      <FileText className="w-3 h-3" />
                      Attachment
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
          {!journal.is_posted && !journal.is_reversed && (
            <>
              <button
                onClick={() => setEntryMode("single")}
                className="h-8 px-3 rounded bg-[#045138] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Entry</span>
              </button>

              <button
                onClick={handlePostJournal}
                disabled={isPosting || !isBalanced}
                className={cn(
                  "h-8 px-3 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs",
                  !isBalanced
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-black text-white"
                )}
                title={!isBalanced ? "Journal must be balanced before posting" : "Post to general ledger"}
              >
                {isPosting ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Post Journal</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Actions Popover / Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="h-8 px-2.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors">
                <span>Actions</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-[170px] bg-white border border-slate-200 rounded shadow-lg p-1 text-xs animate-in fade-in-80"
              >
                {!journal.is_posted && !journal.is_reversed && (
                  <DropdownMenu.Item
                    onClick={() => setOpenUpdateJournal(true)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700 outline-none"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Batch Details</span>
                  </DropdownMenu.Item>
                )}

                {journal.is_posted && !journal.is_reversed && (
                  <DropdownMenu.Item
                    onClick={() => setOpenReverseModal(true)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-rose-50 cursor-pointer text-rose-700 outline-none font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reverse Journal</span>
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Item
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700 outline-none"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Summary</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Reversal Banner if Journal is Reversed */}
      {journal.is_reversed && (
        <div className="p-3 rounded bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-purple-950 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
              This journal batch has been permanently reversed in the General Ledger.
            </div>
            <p className="text-purple-800 text-[11px]">
              Reason: <span className="font-medium text-purple-950">{journal.reversal_reason || "None specified"}</span>
              {journal.reversed_by && ` • By: ${journal.reversed_by}`}
              {journal.reversed_at && ` • ${new Date(journal.reversed_at).toLocaleDateString()}`}
            </p>
          </div>
          {journal.reversal_journal_reference && (
            <Link
              href={`/finance/fiscal-years/${reference}/journals/${journal.reversal_journal_reference}`}
              className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs whitespace-nowrap transition-colors"
            >
              View Offsetting Journal ({journal.reversal_journal_code || "Reversal"})
            </Link>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-slate-200 bg-white rounded p-3 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Debit
          </p>
          <p className="text-base font-semibold text-emerald-700 font-mono">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: journal.currency,
            }).format(totalDebit)}
          </p>
        </div>
        <div className="border border-slate-200 bg-white rounded p-3 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Credit
          </p>
          <p className="text-base font-semibold text-indigo-700 font-mono">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: journal.currency,
            }).format(totalCredit)}
          </p>
        </div>
        <div className={cn(
          "border rounded p-3 shadow-xs transition-colors",
          isBalanced ? "bg-emerald-50/20 border-emerald-200" : "bg-rose-50/20 border-rose-200"
        )}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Balance Status
          </p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded",
              isBalanced ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            )}>
              {isBalanced ? "Balanced" : "Out of Balance"}
            </span>
            {!isBalanced && (
              <span className="text-xs font-mono font-semibold text-rose-700">
                Diff: {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: journal.currency,
                }).format(Math.abs(totalDebit - totalCredit))}
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
                            ? `/finance/partners/${entry.partner_reference}`
                            : `/finance/partners`
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
                      ? new Intl.NumberFormat("en-KE", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                      }).format(parseFloat(entry.debit))
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-indigo-700">
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
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    No transaction lines recorded in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {entryMode === "single" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded border border-slate-200 shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <SingleJournalEntry
              rolePrefix="finance"
              journalReference={journal.code}
              currentTotals={{ debit: totalDebit, credit: totalCredit, balance: totalDebit - totalCredit }}
              onSuccess={() => setEntryMode(null)}
              onClose={() => setEntryMode(null)}
              refetch={refetchJournal}
              className="border-none shadow-none"
            />
          </div>
        </div>
      )}

      {/* Manual Modal for Update Journal */}
      {openUpdateJournal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded border border-slate-200 shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <UpdateJournal
              journal={journal}
              onClose={() => setOpenUpdateJournal(false)}
              className="border-none shadow-none"
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <JournalEntryDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      {/* Reversal Confirmation Modal */}
      <ReverseJournalModal
        open={openReverseModal}
        onClose={() => setOpenReverseModal(false)}
        title={`Reverse Journal Batch`}
        originalCode={journal.code}
        originalDate={new Date(journal.date).toISOString().split("T")[0]}
        amount={totalDebit}
        description={journal.description}
        onConfirm={handleReverseJournal}
        isLoading={isReversing}
      />
    </div>
  );
}
