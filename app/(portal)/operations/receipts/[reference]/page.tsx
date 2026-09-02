"use client"

import { useParams, useRouter } from "next/navigation";
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
   RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";

export default function ReceiptDetailPage() {
   const { reference } = useParams();
   const router = useRouter();
   const headers = useAxiosAuth();
   const { data: receipt, isLoading } = useFetchReceipt(reference as string);
   const postMutation = useMarkReceiptAsPosted();

   const handleDownload = async () => {
      if (!receipt) return;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/v1/receipts/${receipt.reference}/download/`;
      await downloadPDF(url, `Receipt_${receipt.code}.pdf`, headers);
   };

   const handlePost = () => {
      if (!receipt) return;
      postMutation.mutate(receipt.reference);
   };

   if (isLoading) return <LoadingSpinner />;
   if (!receipt) return <div>Receipt not found</div>;

   return (
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-12 animate-in fade-in duration-700">
         {/* Header Navigation */}
         <div className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-[10px] uppercase tracking-widest"
            >
               <ChevronLeft className="w-4 h-4" />
               Back to Receipts
            </button>

            <div className="flex items-center gap-3">
               <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
               >
                  <Download className="w-3.5 h-3.5" />
                  Export Receipt
               </button>

               {!receipt.is_posted && (
                  <button
                     disabled={postMutation.isPending}
                     onClick={handlePost}
                     className="px-8 py-3 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center gap-3 group"
                  >
                     {postMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover:animate-pulse" />}
                     Post to Ledger
                  </button>
               )}

               {receipt.is_posted && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-100 italic">
                     <CheckCircle2 className="w-4 h-4" />
                     Transaction Posted
                  </div>
               )}
            </div>
         </div>

         {/* The Receipt "Form" - High Fidelity Square Layout */}
         <div className="max-w-4xl mx-auto bg-white rounded shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            {/* Verification Seal */}
            <div className="absolute top-20 right-20 opacity-10 rotate-12 select-none pointer-events-none">
               <ShieldCheck className="w-64 h-64 text-emerald-600" />
            </div>

            <div className="p-12 lg:p-20 relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20 border-b border-slate-100 pb-20">
                  <div className="space-y-6">
                     <div className="w-20 h-20 bg-emerald-600 rounded flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30">
                        <CircleCheck className="w-10 h-10" />
                     </div>
                     <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase italic">Official Receipt</h1>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">Corban Technologies Limited — Cashier's Office</p>
                     </div>
                  </div>

                  <div className="text-right space-y-6">
                     <div className="space-y-1">
                        <p className="text-4xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                           {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(receipt.amount)}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Settlement Cleared</p>
                     </div>
                     <div className="space-y-1 pt-4 border-t border-slate-100/50">
                        <p className="text-xl font-bold text-slate-900 tracking-tighter opacity-80">{receipt.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Doc Reference</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Payer Identity</p>
                        <div className="flex items-center gap-4 text-slate-900 font-bold bg-slate-50 p-6 rounded border border-slate-100/50">
                           <Building2 className="w-6 h-6 text-emerald-600" />
                           <span className="text-lg tracking-tight italic">{receipt.invoice || "Standalone Settlement"}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Issuance Context</p>
                        <div className="flex items-center gap-4">
                           <Calendar className="w-5 h-5 text-slate-300" />
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Clearance Date</p>
                              <p className="text-base font-bold text-slate-900">{new Intl.DateTimeFormat('en-GB').format(new Date(receipt.date))}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verification Meta</p>
                        <div className="bg-slate-900 text-white p-6 rounded border border-white/10 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">E-TIMS REF</span>
                              <span className="text-xs font-bold text-emerald-400 tabular-nums">{receipt.kra_sales_receipt || "NA — INTERNAL"}</span>
                           </div>
                           <div className="h-px bg-white/10 w-full" />
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Audit Token</span>
                              <span className="text-[10px] font-mono text-white/60 truncate w-32 text-right">{receipt.reference}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 mb-20 bg-slate-50/50 p-10 rounded border border-slate-100 relative">
                  <Zap className="absolute top-8 right-8 w-12 h-12 text-slate-200" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Merchant Remarks</p>
                  <p className="text-base font-medium text-slate-600 leading-relaxed italic max-w-2xl">
                     "{receipt.notes || "This serves as an official confirmation of payment fulfillment as per the documented settlement cycle."}"
                  </p>
               </div>

               <div className="pt-20 border-t border-slate-100 flex justify-between items-center opacity-60">
                  <div className="flex items-center gap-3">
                     <Printer className="w-4 h-4 text-slate-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Electronic Certified Copy</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Mail className="w-4 h-4 text-slate-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Receipt E-mailed</span>
                  </div>
               </div>
            </div>

            {/* Branding Footer */}
            <div className="bg-slate-900 p-12 text-white flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center">
                     <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <p className="text-xs font-bold tracking-tight">Corban Technologies Ltd</p>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[#D0402B]">Official Finance Document</p>
                  </div>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">In God We Trust, All Others Must Settle</p>
            </div>
         </div>
      </div>
   );
}
