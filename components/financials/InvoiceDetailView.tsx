/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useFetchInvoice,
  usePostInvoiceToGL,
  useMarkInvoiceAsPaid,
} from "@/hooks/financials/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  FileText,
  Download,
  ChevronLeft,
  CircleCheck,
  Clock,
  Building2,
  Calendar,
  CreditCard,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Receipt as ReceiptIcon,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Send,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import RecordReceiptModal from "@/components/invoices/RecordReceiptModal";
import Link from "next/link";

interface InvoiceDetailViewProps {
  rolePrefix: "finance" | "director" | "operations";
}

export default function InvoiceDetailView({ rolePrefix }: InvoiceDetailViewProps) {
  const { reference } = useParams();
  const router = useRouter();
  const headers = useAxiosAuth();
  const { data: invoice, isLoading } = useFetchInvoice(reference as string);

  const postGLMutation = usePostInvoiceToGL();
  const payMutation = useMarkInvoiceAsPaid();

  const handleDownload = async () => {
    if (!invoice) return;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${backendUrl}/api/v1/invoices/${invoice.reference}/download/`;
    await downloadPDF(url, `Invoice_${invoice.code}.pdf`, headers);
  };

  const handlePostToGL = () => {
    if (!invoice) return;
    postGLMutation.mutate(invoice.reference);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!invoice) return <div className="p-8 text-center text-slate-500">Invoice not found</div>;

  const totalAmount = parseFloat(String(invoice.total_amount || 0)) ||
    (invoice.lines?.reduce((sum: number, line: any) => sum + parseFloat(line.total_price), 0) || 0);

  const amountPaid = parseFloat(String(invoice.amount_paid || 0)) ||
    (invoice.receipts?.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0) || 0);

  const balanceDue = Math.max(0, totalAmount - amountPaid);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
    SENT: "bg-blue-50 text-blue-600 border-blue-200",
    PARTIALLY_PAID: "bg-amber-50 text-amber-600 border-amber-200",
    PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push(`/${rolePrefix}/invoices`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Post to GL Button */}
          {!invoice.is_posted && invoice.status !== "CANCELLED" && (
            <button
              onClick={handlePostToGL}
              disabled={postGLMutation.isPending || totalAmount <= 0}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {postGLMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Approve & Post to GL
            </button>
          )}

          {/* Record Receipt Modal Trigger */}
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <RecordReceiptModal
              invoiceReference={invoice.reference}
              invoiceCode={invoice.code}
              partnerName={invoice.partner_name || invoice.partner}
              balanceDue={balanceDue}
              trigger={
                <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2">
                  <ReceiptIcon className="w-3.5 h-3.5" />
                  Record Payment Receipt
                </button>
              }
            />
          )}

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            PDF Invoice
          </button>
        </div>
      </div>

      {/* GL Status Banner */}
      {invoice.is_posted ? (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
                <span>General Ledger Posted & Immutable</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Posted by {invoice.posted_by || "System"} • Linked to General Ledger
              </p>
            </div>
          </div>
          {invoice.journal_reference && (
            <Link
              href={`/${rolePrefix}/fiscal-years`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-300 border border-slate-700 transition-colors"
            >
              View Journal Batch <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <strong>Draft Invoice (Not Posted to Ledger):</strong> Click &quot;Approve &amp; Post to GL&quot; to commit this revenue to Accounts Receivable and General Ledger statements.
            </div>
          </div>
        </div>
      )}

      {/* Main Invoice Card */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-2.5 bg-emerald-600 w-full" />

        <div className="p-8 sm:p-12 space-y-10">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Tax Invoice
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Corban Technologies Limited • Accounts Division
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-2">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider",
                  statusColors[invoice.status] || "bg-slate-100 text-slate-700"
                )}
              >
                {invoice.status === "PAID" ? (
                  <CircleCheck className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                <span>{invoice.status.replace("_", " ")}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-slate-900 tracking-tight">
                {invoice.code}
              </p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/70 p-6 rounded-xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Customer / Partner
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{invoice.partner_name || invoice.partner}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Invoice Date
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{new Date(invoice.date).toLocaleDateString("en-GB")}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Payment Due Date
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{new Date(invoice.due_date).toLocaleDateString("en-GB")}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Bank / Settlement
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{invoice.payment_account || "Commercial Bank"}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Billed Products &amp; Services
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item &amp; Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.lines && invoice.lines.length > 0 ? (
                    invoice.lines.map((line: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{line.product_name || line.product || "Service Deliverable"}</p>
                          {line.description && (
                            <p className="text-slate-500 text-[11px] mt-0.5">{line.description}</p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                          {line.quantity}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-slate-600">
                          KES {parseFloat(line.unit_price).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                          KES {parseFloat(line.total_price).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No line items added.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Receipts History Table */}
          {invoice.receipts && invoice.receipts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ReceiptIcon className="w-4 h-4 text-emerald-600" />
                  Recorded Payment Receipts ({invoice.receipts.length})
                </h3>
              </div>
              <div className="overflow-x-auto border border-emerald-100 rounded-lg bg-emerald-50/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-100/60 text-emerald-900 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Receipt Code</th>
                      <th className="py-2.5 px-4">Payment Date</th>
                      <th className="py-2.5 px-4">Method / Bank</th>
                      <th className="py-2.5 px-4">KRA Ref</th>
                      <th className="py-2.5 px-4 text-right">Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/60">
                    {invoice.receipts.map((rc: any) => (
                      <tr key={rc.reference} className="hover:bg-emerald-50/40">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                          {rc.code}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(rc.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {rc.payment_method_name || "Bank Deposit"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {rc.kra_sales_receipt || "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          KES {parseFloat(rc.amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end pt-6 border-t border-slate-100">
            <div className="space-y-3 bg-slate-900 rounded-xl p-6 text-white text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                Electronic Authentication Token
              </div>
              <p className="font-mono text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded border border-slate-800">
                {invoice.public_token}
              </p>
              {invoice.notes && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Notes:</span>
                  <p className="text-slate-200 italic mt-0.5">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Balances Card */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Billed:</span>
                  <span className="font-mono font-bold text-slate-900">
                    KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="font-medium">Amount Received:</span>
                  <span className="font-mono font-bold">
                    - KES {amountPaid.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-xl shadow-emerald-600/20">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                    Outstanding Balance Due
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 block">
                    KES {balanceDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {balanceDue === 0 && (
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    PAID IN FULL
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
