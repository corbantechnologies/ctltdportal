/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchReceipts, useMarkReceiptAsPosted } from "@/hooks/financials/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import {
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Banknote,
  Send,
  Eye,
  Building2,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface ReceiptsListProps {
  rolePrefix: string;
}

export default function ReceiptsList({ rolePrefix }: ReceiptsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const headers = useAxiosAuth();
  const { isLoading, data: receipts } = useFetchReceipts();
  const markAsPostedMutation = useMarkReceiptAsPosted();

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter(
      (receipt: any) =>
        (receipt.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.invoice || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.invoice_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.partner_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.kra_sales_receipt || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [receipts, searchQuery]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage]);

  const handleDownload = async (receipt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/v1/receipts/${receipt.reference}/pdf/`;
      await downloadPDF(url, `Receipt_${receipt.code}.pdf`, headers);
      toast.success("Receipt PDF downloaded");
    } catch (err) {
      toast.error("Failed to download receipt PDF");
    }
  };

  const handleRowClick = (receipt: any) => {
    router.push(`/${rolePrefix}/receipts/${receipt.reference}`);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search receipts by code, customer, invoice, eTIMS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 transition-all font-semibold text-xs shadow-sm"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Issued Receipts: <span className="text-slate-900 font-mono font-bold">{filteredReceipts.length}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="text-left py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Receipt Code</th>
                <th className="text-left py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Payer / Source Invoice</th>
                <th className="text-left py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Settlement Amount</th>
                <th className="text-left py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Channel / Method</th>
                <th className="text-left py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ledger Status</th>
                <th className="text-right py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-xs">
                    <ReceiptIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No payment receipts found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((receipt: any) => {
                  const amt = typeof receipt.amount === "number" ? receipt.amount : parseFloat(receipt.amount || "0");
                  return (
                    <tr
                      key={receipt.reference}
                      onClick={() => handleRowClick(receipt)}
                      className="group hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner border border-emerald-100">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-900 text-xs tracking-tight">{receipt.code}</p>
                            <p className="text-[10px] font-medium text-slate-400">
                              {new Intl.DateTimeFormat('en-GB').format(new Date(receipt.date))}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                            {receipt.partner_name || "Direct Customer"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                            <span>Invoice:</span>
                            <span className="font-mono text-emerald-700 font-semibold">{receipt.invoice_code || receipt.invoice || "Direct Settlement"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="text-xs font-mono font-bold text-emerald-700">
                          KES {amt.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-medium text-slate-600">
                          {receipt.payment_method_name || "Commercial Bank / M-Pesa"}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            receipt.is_posted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {receipt.is_posted ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          {receipt.is_posted ? "POSTED" : "DRAFT"}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRowClick(receipt)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="View Official Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDownload(receipt, e)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Vault Inventory: <span className="text-slate-900">{filteredReceipts.length}</span> receipts &bull; Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
