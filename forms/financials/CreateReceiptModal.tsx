"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Check,
  ChevronRight,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateReceipt, useFetchInvoices } from "@/hooks/financials/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { toast } from "react-hot-toast";

interface CreateReceiptModalProps {
  rolePrefix: string;
  initialInvoice?: { reference: string; code: string; amount: number };
  trigger: React.ReactNode;
}

export default function CreateReceiptModal({
  rolePrefix,
  initialInvoice,
  trigger
}: CreateReceiptModalProps) {
  const [open, setOpen] = useState(false);

  // Form State
  const [selectedInvoice, setSelectedInvoice] = useState<string>(initialInvoice?.reference || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState<number>(initialInvoice?.amount || 0);
  const [notes, setNotes] = useState("");
  const [kraReceipt, setKraReceipt] = useState("");

  // Queries
  const { data: invoices } = useFetchInvoices();
  const createMutation = useCreateReceipt(rolePrefix);

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const payload = {
      invoice: selectedInvoice || null,
      date,
      amount,
      notes,
      kra_sales_receipt: kraReceipt,
      is_posted: false
    };

    createMutation.mutate(payload, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-emerald-900/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300">

          <div className="p-10 border-b border-slate-100 bg-emerald-50/50 relative overflow-hidden">
            {/* Decorative background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold text-slate-900 tracking-tight italic">
                    Finalize <span className="text-emerald-600 tracking-tighter">Receipt</span>
                  </Dialog.Title>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recording Official Payment Inflow</p>
                </div>
              </div>
              <Dialog.Close className="w-10 h-10 rounded hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Inflow Valuation</label>
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  <input
                    type="number"
                    placeholder="Amount Received..."
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-full h-16 pl-16 pr-6 rounded bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white font-bold text-2xl text-slate-900 transition-all outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-12 pr-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-emerald-600 font-semibold text-sm transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">KRA Receipt Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      placeholder="E-TIMS Ref"
                      value={kraReceipt}
                      onChange={(e) => setKraReceipt(e.target.value)}
                      className="w-full h-12 pl-12 pr-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-emerald-600 font-semibold text-sm transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {!initialInvoice && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Associated Invoice (Optional)</label>
                  <div className="relative group">
                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                    <select
                      value={selectedInvoice}
                      onChange={(e) => setSelectedInvoice(e.target.value)}
                      className="w-full h-14 pl-16 pr-6 rounded bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white appearance-none font-bold text-slate-900 transition-all outline-none"
                    >
                      <option value="">Direct Payment (No Invoice)...</option>
                      {invoices?.map(inv => (
                        <option key={inv.reference} value={inv.reference}>{inv.code} ({inv.partner})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Transaction Log</label>
                <textarea
                  placeholder="Notes on the payment method or internal context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-24 p-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-emerald-600 font-medium text-sm resize-none transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                disabled={createMutation.isPending}
                onClick={handleSubmit}
                className="w-full h-16 bg-emerald-600 hover:bg-slate-900 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {createMutation.isPending ? "Recording Presence..." : "Confirm & Issue Receipt"}
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="bg-amber-50 p-4 rounded flex gap-3 border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-amber-700 leading-relaxed italic">
                  Critical: Issued receipts are finalize the transaction inflow. The finance department must manually post this receipt to the ledger for accounting reconciliation.
                </p>
              </div>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
