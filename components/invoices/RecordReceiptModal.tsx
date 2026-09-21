/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Receipt as ReceiptIcon,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  RefreshCw,
  Wallet,
  Building2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { getPaymentMethods } from "@/services/paymentmethods";
import { useRecordInvoiceReceipt } from "@/hooks/financials/actions";

interface RecordReceiptModalProps {
  invoiceReference: string;
  invoiceCode: string;
  partnerName?: string;
  balanceDue: number;
  trigger: React.ReactNode;
}

export default function RecordReceiptModal({
  invoiceReference,
  invoiceCode,
  partnerName,
  balanceDue,
  trigger,
}: RecordReceiptModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(balanceDue || 0);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [kraReceipt, setKraReceipt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const header = useAxiosAuth();
  const { data: paymentMethods = [], isLoading: isLoadingMethods } = useQuery({
    queryKey: ["paymentmethods"],
    queryFn: () => getPaymentMethods(header),
    enabled: !!header.headers.Authorization,
  });

  const recordReceiptMutation = useRecordInvoiceReceipt();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setAmount(balanceDue || 0);
      setDate(new Date().toISOString().split("T")[0]);
      if (paymentMethods.length > 0 && !paymentMethod) {
        setPaymentMethod(paymentMethods[0].reference);
      }
    }
    setOpen(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    recordReceiptMutation.mutate(
      {
        invoice: invoiceReference,
        date,
        amount,
        payment_method: paymentMethod || undefined,
        kra_sales_receipt: kraReceipt || undefined,
        notes: notes || `Payment received for ${invoiceCode}`,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
          <form onSubmit={handleSubmit}>
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white relative overflow-hidden flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <ReceiptIcon className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-white tracking-tight">
                    Record Payment Receipt
                  </Dialog.Title>
                  <p className="text-xs text-slate-400">
                    Invoice <span className="font-mono text-emerald-400">{invoiceCode}</span>
                    {partnerName && ` • ${partnerName}`}
                  </p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Outstanding Balance Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Current Balance Due:</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-900">
                  KES {balanceDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Amount Received (KES) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    KES
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balanceDue > 0 ? balanceDue : undefined}
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 pl-14 pr-4 py-2.5 rounded-lg text-sm font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Payment Date & Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Deposit Method / Bank
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isLoadingMethods}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Default Commercial Bank</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.reference} value={pm.reference}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KRA Sales Receipt */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  KRA eTIMS / Sales Receipt Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KRA-RC-2026-09-994"
                  value={kraReceipt}
                  onChange={(e) => setKraReceipt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 rounded-lg text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Remarks / Memo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Internal Settlement Memo
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bank wire transfer received. Ref #TRX992384"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-3 rounded-lg text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Auto-posts to General Ledger: <strong>DR Bank / CR AR</strong>
              </span>
              <div className="flex items-center gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={recordReceiptMutation.isPending || amount <= 0}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {recordReceiptMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ReceiptIcon className="w-3.5 h-3.5" />
                  )}
                  <span>Post Receipt</span>
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
