"use client";

import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  FileCheck,
  Search,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateInvoice } from "@/hooks/financials/actions";
import { useFetchProducts } from "@/hooks/products/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { toast } from "react-hot-toast";

interface LineItem {
  product: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface CreateInvoiceModalProps {
  rolePrefix: string;
  initialPartner?: { reference: string; name: string };
  trigger: React.ReactNode;
}

export default function CreateInvoiceModal({
  rolePrefix,
  initialPartner,
  trigger
}: CreateInvoiceModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [selectedPartner, setSelectedPartner] = useState<string>(initialPartner?.reference || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { product: "", description: "", quantity: 1, unit_price: 0 }
  ]);

  // Queries
  const { data: products } = useFetchProducts();
  const { data: partners } = useFetchPartners();
  const createMutation = useCreateInvoice(rolePrefix);

  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
  }, [lines]);

  const addLine = () => {
    setLines([...lines, { product: "", description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineItem, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === "product" && products) {
      const product = products.find(p => p.name === value);
      if (product) {
        newLines[index].description = product.description;
        newLines[index].unit_price = product.unit_price;
      }
    }

    setLines(newLines);
  };

  const handleSubmit = async () => {
    if (!selectedPartner) {
      toast.error("Please select a partner");
      return;
    }

    const payload = {
      partner: selectedPartner,
      date,
      due_date: dueDate,
      notes,
      status: "DRAFT",
      lines: lines.map(l => ({
        product: l.product,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price
      }))
    };

    createMutation.mutate(payload, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">

          <div className="flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
            {/* Sidebar with distinct branding */}
            <div className="w-full md:w-60 bg-slate-900 text-white p-4 md:p-5 flex md:flex-col justify-between items-center md:items-stretch relative overflow-hidden flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded blur-2xl -translate-y-1/2 translate-x-1/2" />

              <div className="space-y-4 md:space-y-6 relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                  <CreditCard className="w-5 h-5" />
                </div>

                <div className="flex md:flex-col gap-2 md:gap-3">
                  {[
                    { s: 1, l: "Obligation Discovery", i: Building2 },
                    { s: 2, l: "Line Items", i: Plus },
                    { s: 3, l: "Validation", i: ShieldCheck }
                  ].map((item) => (
                    <div key={item.s} className="flex items-center gap-2.5 group">
                      <div className={cn(
                        "w-7 h-7 rounded flex items-center justify-center transition-all border",
                        step >= item.s ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20" : "bg-white/5 border-white/10 text-white/20"
                      )}>
                        <item.i className="w-3.5 h-3.5" />
                      </div>
                      <div className="hidden sm:block text-left text-white">
                        <p className={cn("text-[9px] font-semibold uppercase tracking-wider opacity-40 leading-none")}>
                          0{item.s}
                        </p>
                        <p className={cn("text-xs font-semibold", step >= item.s ? "opacity-100" : "opacity-30")}>
                          {item.l}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-2.5 sm:p-3.5 rounded border border-white/10 shadow-sm relative z-10">
                <div className="flex items-center gap-1.5 text-white/40">
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Total</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white tracking-tight tabular-nums mt-0.5">
                  {totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                <Dialog.Title className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Initiate <span className="text-blue-600">Standard Invoice</span>
                </Dialog.Title>
                <Dialog.Close className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X className="w-4 h-4" />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {step === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Invoice Generation Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 font-semibold text-xs sm:text-sm transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Settlement Deadline</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full h-9 px-3 rounded bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 font-semibold text-xs sm:text-sm transition-all outline-none"
                        />
                      </div>
                    </div>

                    {!initialPartner && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Target Merchant Record</label>
                        <div className="relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          <select
                            value={selectedPartner}
                            className="w-full h-9 pl-9 pr-3 rounded bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 appearance-none font-semibold text-xs sm:text-sm text-slate-900 transition-all outline-none"
                            onChange={(e) => setSelectedPartner(e.target.value)}
                          >
                            <option value="">Identify Targeted Partner...</option>
                            {partners?.map(p => (
                              <option key={p.reference} value={p.code}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Strategic Remarks</label>
                      <textarea
                        placeholder="Detail the scope of this invoice or any special terms..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-24 p-3 rounded bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 font-medium text-xs sm:text-sm resize-none transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Items</p>
                      <button
                        onClick={addLine}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-slate-900 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Line
                      </button>
                    </div>

                    <div className="space-y-3">
                      {lines.map((line, index) => (
                        <div key={index} className="bg-white p-3.5 sm:p-4 rounded border border-slate-200 flex flex-col gap-3 relative group transition-all hover:shadow-md">
                          <button
                            onClick={() => removeLine(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded border border-slate-200 shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 ml-1">Asset Identity</label>
                              <select
                                value={line.product}
                                onChange={(e) => updateLine(index, "product", e.target.value)}
                                className="w-full h-9 px-3 rounded bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 transition-all font-semibold text-xs outline-none"
                              >
                                <option value="">Select Catalog Item...</option>
                                {products?.map(p => (
                                  <option key={p.reference} value={p.name}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 ml-1">Qty</label>
                                <input
                                  type="number"
                                  value={line.quantity}
                                  onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value))}
                                  className="w-full h-9 px-3 rounded bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 transition-all font-semibold text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 ml-1">Valuation</label>
                                <input
                                  type="number"
                                  value={line.unit_price}
                                  onChange={(e) => updateLine(index, "unit_price", parseFloat(e.target.value))}
                                  className="w-full h-9 px-3 rounded bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 transition-all font-semibold text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 ml-1">Official Clarifications</label>
                            <input
                              type="text"
                              placeholder="Brief context for this line item..."
                              value={line.description}
                              onChange={(e) => updateLine(index, "description", e.target.value)}
                              className="w-full h-9 px-3 rounded bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 transition-all font-medium text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-blue-50/50 p-4 sm:p-5 rounded border border-blue-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Draft Verification</h3>
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded text-[9px] font-bold uppercase tracking-wider">Awaiting Submission</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3 sm:pr-4 sm:border-r border-blue-200/50">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Target Entity</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {selectedPartner ? partners?.find(p => p.code === selectedPartner)?.name : "Not Identified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Settlement Cycle</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">{date} — {dueDate}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Items for Billing</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">{lines.length} Dimension Lines</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Final Settlement Goal</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight tabular-nums">
                              {totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded text-white/70 text-[10px] sm:text-xs font-medium leading-relaxed flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p>
                        Confirmation: This document will be serialized as a DRAFT. Once initialized, the Finance team can authorize transmission to the partner or record an immediate payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-3 py-1.5 rounded font-semibold text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
                >
                  Back (Phase 0{step - 1})
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 h-9 px-4 sm:px-5 bg-slate-900 text-white rounded font-semibold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all shadow-md active:scale-95 group"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    disabled={createMutation.isPending}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 h-9 px-5 sm:px-6 bg-blue-600 text-white rounded font-semibold text-xs uppercase tracking-wider hover:bg-slate-900 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Generating..." : "Authorize Issuance"}
                  </button>
                )}
              </div>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
