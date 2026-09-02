"use client"

import { useParams, useRouter } from "next/navigation";
import { useFetchQuotation } from "@/hooks/quotations/actions";
import { convertQuotationToInvoice } from "@/services/quotations";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
   FileText,
   Download,
   Printer,
   Mail,
   ChevronLeft,
   CircleCheck,
   Clock,
   XCircle,
   Building2,
   Calendar,
   CreditCard,
   Hash,
   MoveRight,
   RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function QuotationDetailPage() {
   const { reference } = useParams();
   const router = useRouter();
   const headers = useAxiosAuth();
   const queryClient = useQueryClient();
   const { data: quotation, isLoading } = useFetchQuotation(reference as string);
   const [isPending, setIsPending] = useState(false);

   const handleConvert = async () => {
      setIsPending(true);
      try {
         const data = await convertQuotationToInvoice(reference as string, headers);
         queryClient.invalidateQueries({ queryKey: ["quotations"] });
         queryClient.invalidateQueries({ queryKey: ["invoices"] });
         toast.success("Quotation successfully converted to Invoice");
         router.push(`/operations/invoices/${data.invoice_reference}`);
      } catch (error: any) {
         const message = error.response?.data?.error || "Conversion failed";
         toast.error(message);
      } finally {
         setIsPending(false);
      }
   };

   const handleDownload = async () => {
      if (!quotation) return;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/v1/quotations/${quotation.reference}/download/`;
      await downloadPDF(url, `Quotation_${quotation.code}.pdf`, headers);
   };

   if (isLoading) return <LoadingSpinner />;
   if (!quotation) return <div>Document not found</div>;

   const statusColors = {
      DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
      SENT: "bg-blue-50 text-blue-600 border-blue-100",
      ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      REJECTED: "bg-red-50 text-red-600 border-red-100",
      EXPIRED: "bg-amber-50 text-amber-600 border-amber-100",
   };

   const totalAmount = quotation.lines?.reduce((sum: number, line: any) => sum + parseFloat(line.total_price), 0) || 0;

   return (
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-12 animate-in fade-in duration-700">
         {/* Header Navigation */}
         <div className="max-w-5xl mx-auto mb-10 flex items-center justify-between">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-[10px] uppercase tracking-widest"
            >
               <ChevronLeft className="w-4 h-4" />
               Back to Inventory
            </button>

            <div className="flex items-center gap-3">
               <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
               >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
               </button>

               {quotation.status === "ACCEPTED" && (
                  <button
                     disabled={isPending}
                     onClick={handleConvert}
                     className="px-8 py-3 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3"
                  >
                     {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MoveRight className="w-4 h-4" />}
                     Initiate Invoice
                  </button>
               )}
            </div>
         </div>

         {/* The "Form" - Professional Layout */}
         <div className="max-w-5xl mx-auto bg-white rounded shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

            {/* Top Branding Strip */}
            <div className="h-4 bg-slate-900 w-full" />

            <div className="p-12 lg:p-20">
               <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                  <div className="space-y-6">
                     <div className="w-16 h-16 bg-slate-900 rounded flex items-center justify-center text-white shadow-2xl">
                        <FileText className="w-8 h-8" />
                     </div>
                     <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter italic">Official Quotation</h1>
                        <p className="text-slate-400 text-sm font-medium">Corban Technologies Limited — Strategic Proposal</p>
                     </div>
                  </div>

                  <div className="text-right space-y-4">
                     <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded border text-[10px] font-bold uppercase tracking-[0.15em]", statusColors[quotation.status])}>
                        {quotation.status === "ACCEPTED" ? <CircleCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {quotation.status}
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">{quotation.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Document Control Number</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                  <div className="space-y-6">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Client Details</p>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                           <Building2 className="w-4 h-4 text-slate-300" />
                           <span className="text-lg tracking-tight italic">{quotation.partner || quotation.lead || "Discovery Account"}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                           This proposal is valid for the corporate entity identified above. All terms and SLA agreements apply.
                        </p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Issuance Info</p>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-4 h-4 text-slate-300" />
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                              <p className="text-sm font-bold text-slate-900">{new Intl.DateTimeFormat('en-GB').format(new Date(quotation.date))}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock className="w-4 h-4 text-slate-300" />
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiration</p>
                              <p className="text-sm font-bold text-slate-900">{new Intl.DateTimeFormat('en-GB').format(new Date(quotation.expiry_date))}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Compliance</p>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <Hash className="w-4 h-4 text-slate-300" />
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issuer Reference</p>
                              <p className="text-sm font-bold text-slate-900">{quotation.created_by}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <CreditCard className="w-4 h-4 text-slate-300" />
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Hub</p>
                              <p className="text-sm font-bold text-slate-900">{quotation.payment_account || "Standard Reserve"}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Line Items Table */}
               <div className="mb-20">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-slate-100">
                           <th className="text-left py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Dimension Identity</th>
                           <th className="text-center py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cycles</th>
                           <th className="text-right py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate</th>
                           <th className="text-right py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Extension</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {quotation.lines?.map((line: any, idx: number) => (
                           <tr key={idx} className="group">
                              <td className="py-8">
                                 <p className="font-bold text-slate-900 text-base tracking-tight">{line.product}</p>
                                 <p className="text-xs text-slate-500 font-medium mt-1">{line.description}</p>
                              </td>
                              <td className="py-8 text-center">
                                 <span className="px-3 py-1 bg-slate-50 rounded text-xs font-bold text-slate-900">{line.quantity}</span>
                              </td>
                              <td className="py-8 text-right font-bold text-slate-500 text-sm">
                                 {parseFloat(line.unit_price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-8 text-right font-bold text-slate-900 text-base tabular-nums tracking-tighter">
                                 {parseFloat(line.total_price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Totals Section */}
               <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-t border-slate-100 pt-12">
                  <div className="max-w-md space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive Remarks & Notes</p>
                     <div className="bg-slate-50 p-8 rounded text-sm text-slate-500 italic leading-relaxed">
                        {quotation.notes || "No special strategic remarks provided for this issuance."}
                     </div>
                     <div className="text-[10px] text-slate-300 font-medium">
                        Electronic validation: {quotation.reference}
                     </div>
                  </div>

                  <div className="w-full md:w-80 space-y-4">
                     <div className="flex justify-between items-center text-slate-400">
                        <p className="text-[11px] font-bold uppercase tracking-widest">Sub-Extension</p>
                        <p className="font-bold text-sm tracking-tight">{totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                     </div>
                     <div className="flex justify-between items-center text-slate-400">
                        <p className="text-[11px] font-bold uppercase tracking-widest">Tax (0%)</p>
                        <p className="font-bold text-sm tracking-tight">0.00</p>
                     </div>
                     <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-1">Total Obligation</p>
                        <div className="text-right">
                           <p className="text-4xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                              {totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Area */}
            <div className="bg-slate-50 px-20 py-12 flex justify-between items-center text-slate-400">
               <div className="flex items-center gap-10">
                  <div className="flex items-center gap-2">
                     <Printer className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Print Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Mail className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-[#D0402B]">Strategic Copy</span>
                  </div>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest">© Corban Technologies Limited 2026</p>
            </div>
         </div>
      </div>
   );
}
