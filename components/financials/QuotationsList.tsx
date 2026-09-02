"use client";

import { useFetchQuotations } from "@/hooks/quotations/actions";
import { convertQuotationToInvoice, downloadQuotation, Quotation } from "@/services/quotations";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileBadge,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface QuotationsListProps {
  rolePrefix: string;
}

export default function QuotationsList({ rolePrefix }: QuotationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const headers = useAxiosAuth();
  const { isLoading, data: quotations } = useFetchQuotations();

  const filteredQuotations = useMemo(() => {
    if (!quotations) return [];
    return quotations.filter(
      (quotation) =>
        quotation.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quotation.partner_details?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (quotation.lead_details?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (quotation.lead_details?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [quotations, searchQuery]);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotations.slice(start, start + itemsPerPage);
  }, [filteredQuotations, currentPage]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "SENT":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-100";
      case "EXPIRED":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const handleDownload = async (quotation: Quotation) => {
    await downloadQuotation(quotation.reference, quotation.code, headers);
  };

  const getViewLink = (quotation: any) => {
    if (quotation.lead_details) {
      return `/${rolePrefix}/leads/${quotation.lead_details.reference}/${quotation.reference}`;
    }
    if (quotation.partner_details) {
      return `/${rolePrefix}/partners/${quotation.partner_details.reference}/${quotation.reference}`;
    }
    return "#";
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search quotations by code, client, or lead..."
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
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Proposal</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Entity</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Valid Until</th>
                <th className="text-left py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-right py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotations.map((quotation) => (
                <tr 
                  key={quotation.reference} 
                  onClick={() => router.push(getViewLink(quotation))}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <FileBadge className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight">{quotation.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Intl.DateTimeFormat('en-GB').format(new Date(quotation.date))}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">
                        {quotation.partner_details?.name || quotation.lead_details?.company_name || `${quotation.lead_details?.first_name} ${quotation.lead_details?.last_name}` || "Direct Discovery"}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      {new Intl.DateTimeFormat('en-GB').format(new Date(quotation.expiry_date))}
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border", getStatusStyle(quotation.status))}>
                      {quotation.status === "ACCEPTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {quotation.status}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <div 
                        className="w-10 h-10 rounded bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-90"
                        title="View & Edit Components"
                      >
                         <ArrowRight className="w-4.5 h-4.5" />
                      </div>
                      {quotation.status === "ACCEPTED" && (quotation.partner || quotation.lead) && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <ConvertQuotationToInvoiceButton quotation={quotation} rolePrefix={rolePrefix} />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(quotation);
                        }}
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
    </div>
  );
}

function ConvertQuotationToInvoiceButton({ quotation, rolePrefix }: { quotation: any, rolePrefix: string }) {
  const [isPending, setIsPending] = useState(false);
  const authHeaders = useAxiosAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleConvert = async () => {
    setIsPending(true);
    try {
      const data = await convertQuotationToInvoice(quotation.reference, authHeaders);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Quotation successfully converted to Invoice");
      router.push(`/${rolePrefix}/invoices/${data.invoice_reference}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Conversion failed");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      disabled={isPending}
      onClick={handleConvert}
      className="w-10 h-10 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50"
      title="Convert to Invoice"
    >
      {isPending ? (
        <RefreshCw className="w-4.5 h-4.5 animate-spin" />
      ) : (
        <RefreshCw className="w-4.5 h-4.5" />
      )}
    </button>
  );
}
