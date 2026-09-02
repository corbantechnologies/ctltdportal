"use client"

import { useParams, useRouter } from "next/navigation";
import { useFetchInvoice, useMarkInvoiceAsPaid } from "@/hooks/financials/actions";
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
   RefreshCw,
   Wallet,
   ShieldCheck,
   AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import { toast } from "react-hot-toast";

export default function InvoiceDetailPage() {
   const { reference } = useParams();
   const router = useRouter();
   const headers = useAxiosAuth();
   const { data: invoice, isLoading } = useFetchInvoice(reference as string);
   const payMutation = useMarkInvoiceAsPaid();

   const handleDownload = async () => {
      if (!invoice) return;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/v1/invoices/${invoice.reference}/download/`;
      await downloadPDF(url, `Invoice_${invoice.code}.pdf`, headers);
   };

   const handleMarkAsPaid = () => {
      if (!invoice) return;
      payMutation.mutate(invoice.reference as string, {
         onSuccess: (data) => {
            router.push(`/operations/receipts/${data.receipt_reference}`);
         }
      });
   };

   if (isLoading) return <LoadingSpinner />;
   if (!invoice) return <div>Invoice not found</div>;

   const statusColors = {
      DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
      SENT: "bg-blue-50 text-blue-600 border-blue-100",
      PARTIALLY_PAID: "bg-amber-50 text-amber-600 border-amber-100",
      PAID: "bg-emerald-50 text-emerald-600 border-emerald-100",
      CANCELLED: "bg-red-50 text-red-600 border-red-100",
   };

   const totalAmount = invoice.lines?.reduce((sum: number, line: any) => sum + parseFloat(line.total_price), 0) || 0;

   return (
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-12 animate-in fade-in duration-700">
         {/* Header Navigation */}
         <div className="max-w-5xl mx-auto mb-10 flex items-center justify-between">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-[10px] uppercase tracking-widest"
            >
               <ChevronLeft className="w-4 h-4" />
               Back to Accounts Receivable
            </button>

            <div className="flex items-center gap-3">
               <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
               >
                  <Download className="w-3.5 h-3.5" />
                  Export Invoice
               </button>

               {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                  <button
                     disabled={payMutation.isPending}
                     onClick={handleMarkAsPaid}
                     className="px-8 py-3 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3"
                  >
                     {payMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                     Acknowledge Payment
                  </button>
               )}
            </div>
         </div>

         {/* The Invoice "Form" */}
         <div className="max-w-5xl mx-auto bg-white rounded shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

            <div className="h-4 bg-emerald-600 w-full" />

            <div className="p-12 lg:p-20">
               <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                  <div className="space-y-6">
                     <div className="w-16 h-16 bg-emerald-600 rounded flex items-center justify-center text-white shadow-2xl">
                        <FileText className="w-8 h-8" />
                     </div>
                     <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase italic">Standard Invoice</h1>
                        <p className="text-slate-400 text-sm font-medium">Corban Technologies Limited — Accounts Division</p>
                     </div>
                  </div>

                  <div className="text-right space-y-4">
                     <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded border text-[10px] font-bold uppercase tracking-[0.15em]", statusColors[invoice.status])}>
                        {invoice.status === "PAID" ? <CircleCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {invoice.status.replace("_", " ")}
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">{invoice.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Reference Code</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 bg-slate-50/50 p-10 rounded border border-slate-100">
                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Merchant/Partner</p>
                     <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-base tracking-tight">{invoice.partner}</span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issuance Cycle</p>
                     <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{new Intl.DateTimeFormat('en-GB').format(new Date(invoice.date))}</span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Final Deadline</p>
                     <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{new Intl.DateTimeFormat('en-GB').format(new Date(invoice.due_date))}</span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Settlement Account</p>
                     <div className="flex items-center gap-2 font-bold text-slate-700">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{invoice.payment_account || "Standard Hub"}</span>
                     </div>
                  </div>
               </div>

               {/* Line Items Table */}
               <div className="mb-20">
                  <table className="w-full">
                     <thead className="bg-slate-50 rounded overflow-hidden border-b-0">
                        <tr>
                           <th className="text-left py-5 px-6 rounded-l-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400">Dimensions</th>
                           <th className="text-center py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Units</th>
                           <th className="text-right py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate</th>
                           <th className="text-right py-5 px-6 rounded-r-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400">Extension</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {invoice.lines?.map((line: any, idx: number) => (
                           <tr key={idx} className="group">
                              <td className="py-8 px-6">
                                 <p className="font-bold text-slate-900 text-base tracking-tight">{line.product}</p>
                                 <p className="text-xs text-slate-500 font-medium mt-1">{line.description}</p>
                              </td>
                              <td className="py-8 px-6 text-center">
                                 <span className="text-sm font-bold text-slate-900">{line.quantity}</span>
                              </td>
                              <td className="py-8 px-6 text-right font-bold text-slate-500 text-sm">
                                 {parseFloat(line.unit_price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-8 px-6 text-right font-bold text-slate-900 text-base tabular-nums tracking-tighter">
                                 {parseFloat(line.total_price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Invoice Summary */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end">
                  <div className="space-y-6">
                     <div className="p-8 bg-slate-900 rounded text-white">
                        <div className="flex gap-4 items-start mb-6">
                           <ShieldCheck className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Electronic Authentication</p>
                              <p className="text-[11px] font-mono opacity-80 break-all leading-relaxed tracking-tight">{invoice.public_token}</p>
                           </div>
                        </div>
                        <div className="space-y-2 border-t border-white/10 pt-6">
                           <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Internal Remarks</p>
                           <p className="text-sm font-medium italic opacity-90">{invoice.notes || "Standard settlement terms documented."}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-slate-400 px-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest">Base Extension</p>
                        <p className="font-bold text-base">{totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                     </div>
                     <div className="flex justify-between items-center text-slate-400 px-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest">Consolidated Tax</p>
                        <p className="font-bold text-base">0.00</p>
                     </div>
                     <div className="p-10 bg-emerald-600 rounded shadow-2xl shadow-emerald-600/20 flex flex-col items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Total Settlement Obligation</p>
                        <p className="text-5xl font-bold text-white tracking-tighter tabular-nums leading-none">
                           {totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 px-20 py-12 flex justify-between items-center text-slate-400">
               <p className="text-[10px] font-bold uppercase tracking-widest shrink-0 tracking-[0.2em]">Validated Print Artifact</p>
               <div className="h-px bg-slate-200 flex-1 mx-10" />
               <p className="text-[10px] font-bold uppercase tracking-widest">© Corban Technologies 2026</p>
            </div>
         </div>
      </div>
   );
}
