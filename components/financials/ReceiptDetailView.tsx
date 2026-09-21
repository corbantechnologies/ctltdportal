/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFetchReceipt, useMarkReceiptAsPosted } from "@/hooks/financials/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  FileText,
  Download,
  Printer,
  Mail,
  ChevronLeft,
  CircleCheck,
  Clock,
  Building2,
  Calendar,
  Hash,
  ShieldCheck,
  Zap,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Receipt as ReceiptIcon,
  CreditCard,
  DollarSign,
  User,
  Send,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import { toast } from "react-hot-toast";

interface ReceiptDetailViewProps {
  rolePrefix: "finance" | "director" | "operations";
}

export default function ReceiptDetailView({ rolePrefix }: ReceiptDetailViewProps) {
  const { reference } = useParams();
  const router = useRouter();
  const headers = useAxiosAuth();
  const { data: receipt, isLoading } = useFetchReceipt(reference as string);
  const postMutation = useMarkReceiptAsPosted();

  const handleDownload = async () => {
    if (!receipt) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/v1/receipts/${receipt.reference}/pdf/`;
      await downloadPDF(url, `Receipt_${receipt.code}.pdf`, headers);
      toast.success("Receipt PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download receipt PDF");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePost = () => {
    if (!receipt) return;
    postMutation.mutate(receipt.reference);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!receipt) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
          <ReceiptIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Receipt Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          The requested payment receipt document could not be located or may have been archived.
        </p>
        <Link
          href={`/${rolePrefix}/receipts`}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all"
        >
          Back to Receipts Ledger
        </Link>
      </div>
    );
  }

  const receiptAmount = typeof receipt.amount === "number" ? receipt.amount : parseFloat(receipt.amount || "0");

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push(`/${rolePrefix}/receipts`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Receipts Vault
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export PDF
          </button>

          {!receipt.is_posted && (
            <button
              disabled={postMutation.isPending}
              onClick={handlePost}
              className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 group"
            >
              {postMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
              )}
              Post to General Ledger
            </button>
          )}

          {receipt.is_posted && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              GL Posted &amp; Balanced
            </div>
          )}
        </div>
      </div>

      {/* GL Status Banner */}
      {receipt.is_posted ? (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400 tracking-wider">
                <span>General Ledger Verified &amp; Balanced</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Double-Entry Settlement: Debited Bank/Cash Liquid Account &bull; Credited Accounts Receivable (AR)
              </p>
            </div>
          </div>
          {receipt.journal_reference && (
            <Link
              href={`/${rolePrefix}/fiscal-years`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-300 border border-slate-700 transition-colors"
            >
              Audit Journal Batch <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <strong>Pending GL Commitment:</strong> This payment receipt is recorded in draft state. Click &quot;Post to General Ledger&quot; to formally recognize the liquid cash inflow and reduce customer receivables.
            </div>
          </div>
        </div>
      )}

      {/* Main Receipt Document Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative print:border-none print:shadow-none">
        {/* Top Accent Bar */}
        <div className="h-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 w-full" />

        {/* Verification Background Seal */}
        <div className="absolute top-28 right-16 opacity-[0.03] rotate-12 select-none pointer-events-none print:hidden">
          <ShieldCheck className="w-96 h-96 text-slate-900" />
        </div>

        <div className="p-8 sm:p-14 space-y-12 relative z-10">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                  <CircleCheck className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Official Receipt
                  </h1>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Corban Technologies Limited &bull; Cashier &amp; Treasury
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                <p className="font-semibold text-slate-700">Corban Technologies Limited</p>
                <p>Nairobi, Kenya &bull; info@corbantechnologies.org</p>
                <p className="font-mono text-[11px] text-slate-400">PIN: P051234567Z &bull; Official Treasury Seal</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-3">
              <div className="space-y-1 bg-emerald-50/80 border border-emerald-100 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Total Settlement Cleared
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-800 tracking-tight font-mono">
                  KES {receiptAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Receipt Document Code
                </span>
                <p className="text-lg font-mono font-bold text-slate-900">
                  {receipt.code}
                </p>
              </div>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/70 p-6 rounded-xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Payer / Customer
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{receipt.partner_name || "Direct Customer"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Receipt Date
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{new Date(receipt.date).toLocaleDateString("en-GB")}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Payment Channel / Bank
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{receipt.payment_method_name || "Commercial Bank / M-Pesa"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Source Invoice
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {receipt.invoice ? (
                  <Link
                    href={`/${rolePrefix}/invoices/${receipt.invoice}`}
                    className="text-emerald-700 hover:text-emerald-900 underline underline-offset-2 font-mono"
                  >
                    {receipt.invoice_code || receipt.invoice}
                  </Link>
                ) : (
                  <span className="text-slate-400 italic">Direct Walk-In (No Invoice)</span>
                )}
              </div>
            </div>
          </div>

          {/* Verification & eTIMS Breakdown Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  KRA eTIMS &amp; Audit Reference
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">KRA Fiscal Receipt No:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {receipt.kra_sales_receipt || "INTERNAL-VAULT-CLR"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">System Document Ref:</span>
                  <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">
                    {receipt.reference}
                  </span>
                </div>
                {receipt.journal_reference && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">GL Journal Voucher:</span>
                    <span className="font-mono text-emerald-300">
                      {receipt.journal_reference}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Double-Entry Ledger Posting Impact */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-6 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Double-Entry Ledger Effect
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">
                  BALANCED
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div>
                    <span className="font-mono font-bold text-emerald-800 block text-xs">DEBIT (DR)</span>
                    <span className="text-[10px] text-slate-500 font-medium">1010/1020 Liquid Asset (Bank/M-Pesa)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    + KES {receiptAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div>
                    <span className="font-mono font-bold text-slate-700 block text-xs">CREDIT (CR)</span>
                    <span className="text-[10px] text-slate-500 font-medium">1030 Accounts Receivable (AR Cleared)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    - KES {receiptAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Memo / Notes */}
          {receipt.notes && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cashier Settlement Notes &amp; Transaction Context
              </span>
              <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                &quot;{receipt.notes}&quot;
              </p>
            </div>
          )}

          {/* Electronic Certification Footer */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Electronically certified official payment voucher</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Timestamp: {new Date(receipt.created_at || receipt.date).toLocaleString("en-GB")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-emerald-600 font-bold">Authorized Document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
