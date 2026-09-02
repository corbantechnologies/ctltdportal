"use client"

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useFetchQuotation } from "@/hooks/quotations/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  FileText,
  ChevronLeft,
  Calendar,
  Clock,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Hash,
  AlertCircle,
  X,
  Download,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { toast } from "react-hot-toast";
import { deleteQuotationLine, QuotationLine } from "@/services/quotationlines";
import { useQueryClient } from "@tanstack/react-query";
import CreateQuotationLine from "@/forms/quotationlines/CreateQuotationLine";
import UpdateQuotationLine from "@/forms/quotationlines/UpdateQuotationLine";
import FinalizeQuotation from "@/forms/quotations/FinalizeQuotation";
import { downloadQuotation, updateQuotation } from "@/services/quotations";

export default function LeadQuotationDetailPage() {
  const { reference, quotationReference } = useParams();
  const router = useRouter();
  const authHeaders = useAxiosAuth();
  const queryClient = useQueryClient();

  // Queries
  const { data: quotation, isLoading: isQuotationLoading } = useFetchQuotation(quotationReference as string);

  // Modal States
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<QuotationLine | null>(null);

  if (isQuotationLoading) return <LoadingSpinner />;
  if (!quotation) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-black space-y-4">
      <AlertCircle className="w-12 h-12" />
      <p className="font-bold uppercase tracking-widest text-[10px]">Quotation record not found</p>
    </div>
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["quotation", quotationReference] });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadQuotation(quotation.reference, quotation.code, authHeaders);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "ACCEPTED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to mark this quotation as ${newStatus}?`)) return;

    try {
      await updateQuotation(quotation.reference, { status: newStatus }, authHeaders);
      toast.success(`Quotation updated to ${newStatus}`);
      invalidate();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteLine = async (lineRef: string) => {
    if (!confirm("Remove this line item?")) return;

    try {
      await deleteQuotationLine(lineRef, authHeaders);
      toast.success("Item removed");
      invalidate();
    } catch (error: any) {
      toast.error("Failed to remove item");
    }
  };

  const subtotal = quotation.lines?.reduce((sum, line) => sum + Number(line.total_price), 0) || 0;
  const isReadOnly = quotation.status !== "DRAFT";

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-100 ring-red-500/20";
      case "EXPIRED":
        return "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-700">
      {/* Navigation Header */}
      <div className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="h-20 flex items-center justify-between text-black">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Case Study
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 text-slate-400">Process State</span>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm ring-1",
                  getStatusStyles(quotation.status)
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    quotation.status === "ACCEPTED" ? "bg-emerald-500" : 
                    quotation.status === "SENT" ? "bg-blue-500" :
                    quotation.status === "REJECTED" ? "bg-red-500" :
                    quotation.status === "EXPIRED" ? "bg-amber-500" : "bg-slate-400"
                  )} />
                  {quotation.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Quotation Build Area */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded flex items-center justify-center text-white shadow-2xl">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight italic">
                    Build <span className="text-blue-600">Quotation</span>
                  </h1>
                  <p className="text-sm text-black font-medium text-black/60">Proposal: <span className="text-slate-900 font-bold">{quotation.code}</span></p>
                </div>
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-12 px-6 rounded bg-blue-600 text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
              )}
            </div>

            {/* Line Items Table */}
            <div className="bg-white border border-slate-100 rounded overflow-hidden shadow-sm shadow-slate-100/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-black">Inventory Ident</th>
                    <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-black text-center">Qty</th>
                    <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-black text-right">Unit Rate</th>
                    <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-black text-right">Extension</th>
                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-black w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {quotation.lines?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 px-8 text-center text-black/20">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">No components allocated</p>
                        <p className="text-xs italic">Initialize the proposal by adding your first project component.</p>
                      </td>
                    </tr>
                  ) : (
                    quotation.lines?.map((line) => (
                      <tr key={line.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="py-8 px-8">
                          <p className="font-bold text-slate-900 text-sm tracking-tight">{line.product}</p>
                          <p className="text-xs text-black mt-1 font-medium italic">{line.description}</p>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <span className="px-3 py-1 bg-white border border-slate-100 rounded text-xs font-bold text-slate-900 shadow-sm">
                            {line.quantity}
                          </span>
                        </td>
                        <td className="py-8 px-4 text-right">
                          <p className="text-sm font-bold text-slate-500 tabular-nums">
                            {line.unit_price.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="py-8 px-4 text-right">
                          <p className="text-sm font-bold text-black tabular-nums tracking-tight">
                            {line.total_price.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="py-8 px-8 text-right space-x-2">
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => setSelectedLine(line)}
                                className="p-2 text-black/20 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLine(line.reference)}
                                className="p-2 text-black/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Summaries & Context */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-50 p-10 rounded shadow-sm border border-slate-100 flex flex-col gap-10">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-slate-200 pb-2 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" />
                Case Metadata
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" /> Account
                  </span>
                  <span className="text-sm font-bold text-slate-900 italic tracking-tight uppercase truncate max-w-[150px]">
                    {quotation.lead_details?.company_name || `${quotation.lead_details?.first_name} ${quotation.lead_details?.last_name}` || quotation.partner_details?.name || "Direct Discovery"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Issued
                  </span>
                  <span className="text-sm font-bold text-black">{new Date(quotation.date).toLocaleDateString("en-GB")}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Expiry
                  </span>
                  <span className="text-sm text-red-500">{new Date(quotation.expiry_date).toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-slate-200 pb-2">Financial Synthesis</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-black/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sub-Extension</span>
                  <span className="text-sm font-bold tabular-nums">{subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-black/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Adjustment (0%)</span>
                  <span className="text-sm font-bold">0.00</span>
                </div>
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black mb-1">Theoretical Total</span>
                    <p className="text-3xl font-bold text-black tracking-tighter tabular-nums leading-none">
                      {subtotal.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {quotation.status === "DRAFT" && (
              <button
                onClick={() => setIsFinalizeModalOpen(true)}
                className="w-full py-5 bg-slate-900 text-white rounded font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Commit & Finalize
              </button>
            )}

            {quotation.status === "SENT" && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleUpdateStatus("ACCEPTED")}
                  className="w-full py-4 bg-emerald-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  Accept Proposal
                </button>
                <button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  className="w-full py-4 bg-red-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  Reject Proposal
                </button>
              </div>
            )}

            {isReadOnly && quotation.status !== "SENT" && (
              <div className="py-4 px-6 bg-slate-100 border border-slate-200 rounded text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Locked: {quotation.status}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-10 border border-slate-100 rounded space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Strategic Notes
            </p>
            <p className="text-xs text-black/60 leading-relaxed italic font-medium">
              "{quotation.notes || "No strategic notes provided for this phase. Recommendation: Outline the specific value proposition before finalizing issuance."}"
            </p>
          </div>
        </div>
      </div>

      {/* Initialize Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 fade-in duration-300 my-auto">
            <CreateQuotationLine
              quotationCode={quotation.code}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                invalidate();
              }}
            />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {selectedLine && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedLine(null)}
          />
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 fade-in duration-300 my-auto">
            <UpdateQuotationLine
              line={selectedLine}
              onClose={() => setSelectedLine(null)}
              onSuccess={() => {
                setSelectedLine(null);
                invalidate();
              }}
            />
          </div>
        </div>
      )}

      {/* Finalize Modal */}
      <FinalizeQuotation
        quotationReference={quotation.reference}
        isOpen={isFinalizeModalOpen}
        onOpenChange={setIsFinalizeModalOpen}
        onSuccess={invalidate}
      />
    </div>
  );
}