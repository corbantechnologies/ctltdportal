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
  AlertCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Banknote,
  Send,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ReceiptsListProps {
  rolePrefix: string;
}

export default function ReceiptsList({ rolePrefix }: ReceiptsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const headers = useAxiosAuth();
  const { isLoading, data: receipts } = useFetchReceipts();
  const markAsPostedMutation = useMarkReceiptAsPosted();

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter(
      (receipt) =>
        receipt.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.reference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [receipts, searchQuery]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage]);

  const handleDownload = async (receipt: any) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${backendUrl}/api/v1/receipts/${receipt.reference}/pdf/`;
    await downloadPDF(url, `Receipt_${receipt.code}.pdf`, headers);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search receipts by code, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-14 pr-6 rounded border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 transition-all font-semibold text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-2xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Receipt</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Source Invoice</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Cleared</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ledger Status</th>
                <th className="text-right py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReceipts.map((receipt) => (
                <tr key={receipt.reference} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner border border-emerald-100">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight">{receipt.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('en-GB').format(new Date(receipt.date))}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-700 underline decoration-slate-200 underline-offset-4">{receipt.invoice}</span>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                      <Banknote className="w-4 h-4" />
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(receipt.amount)}
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                      receipt.is_posted ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100")}>
                      {receipt.is_posted ? <ShieldCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {receipt.is_posted ? "POSTED" : "PENDING POST"}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {rolePrefix === "finance" && !receipt.is_posted && (
                        <button
                          onClick={() => markAsPostedMutation.mutate(receipt.reference)}
                          className="w-10 h-10 rounded bg-slate-900 text-white hover:bg-emerald-600 transition-all flex items-center justify-center shadow-lg active:scale-90"
                          title="Confirm Ledger Posting"
                        >
                          <ShieldCheck className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(receipt)}
                        className="w-10 h-10 rounded bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-90"
                        title="Download PDF"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </button>
                      <button
                        className="w-10 h-10 rounded bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-90"
                        title="Resend to Email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Vault Inventory: <span className="text-slate-900">{filteredReceipts.length}</span> documents
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-12 h-12 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-12 h-12 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
