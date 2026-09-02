"use client";

import { useFetchInvoices, useMarkInvoiceAsPaid } from "@/hooks/financials/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface InvoicesListProps {
  rolePrefix: string;
}

export default function InvoicesList({ rolePrefix }: InvoicesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const headers = useAxiosAuth();
  const { isLoading, data: invoices } = useFetchInvoices();
  const markAsPaidMutation = useMarkInvoiceAsPaid();

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(
      (invoice) =>
        invoice.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.reference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "SENT":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "DRAFT":
        return "bg-slate-50 text-slate-500 border-slate-100";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  const handleDownload = async (invoice: any) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${backendUrl}/api/v1/invoices/${invoice.reference}/pdf/`;
    await downloadPDF(url, `Invoice_${invoice.code}.pdf`, headers);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search by invoice code, partner, or reference..."
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
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Document</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Partner</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-right py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.reference} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight">{invoice.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('en-GB').format(new Date(invoice.date))}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-700">{invoice.partner}</span>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      {new Intl.DateTimeFormat('en-GB').format(new Date(invoice.due_date))}
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border", getStatusStyle(invoice.status))}>
                      <div className={cn("w-1.5 h-1.5 rounded", invoice.status === "SENT" ? "animate-pulse bg-blue-500" : "bg-current")} />
                      {invoice.status}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {invoice.status !== "PAID" && (
                        <button
                          onClick={() => markAsPaidMutation.mutate(invoice.reference)}
                          className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-emerald-600/10 active:scale-90"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(invoice)}
                        className="w-10 h-10 rounded bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-90"
                        title="Download PDF"
                      >
                        <Download className="w-4.5 h-4.5" />
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
            Showing <span className="text-slate-900">{paginatedInvoices.length}</span> of <span className="text-slate-900">{filteredInvoices.length}</span> documents
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
