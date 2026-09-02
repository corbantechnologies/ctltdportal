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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300">

          <div className="flex h-[85vh]">
            {/* Sidebar with distinct branding */}
            <div className="w-72 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="space-y-10 relative z-10">
                <div className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                  <CreditCard className="w-6 h-6" />
                </div>

                <div className="space-y-8">
                  {[
                    { s: 1, l: "Obligation Discovery", i: Building2 },
                    { s: 2, l: "Line Items", i: Plus },
                    { s: 3, l: "Validation", i: ShieldCheck }
                  ].map((item) => (
                    <div key={item.s} className="flex items-center gap-4 group">
                      <div className={cn(
                        "w-10 h-10 rounded flex items-center justify-center transition-all border-2",
                        step >= item.s ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 border-white/10 text-white/20"
                      )}>
                        <item.i className="w-5 h-5" />
                      </div>
                      <div className="text-left text-white">
                        <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-40")}>
                          Phase 0{item.s}
                        </p>
                        <p className={cn("text-xs font-bold", step >= item.s ? "opacity-100" : "opacity-30")}>
                          {item.l}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded border border-white/10 shadow-sm space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-white/30">
                  <Calculator className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Valuation</span>
                </div>
                <p className="text-2xl font-bold text-white tracking-tighter tabular-nums">
                  {totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white">
                <Dialog.Title className="text-2xl font-bold text-slate-900 tracking-tight">
                  Initiate <span className="text-blue-600">Standard Invoice</span>
                </Dialog.Title>
                <Dialog.Close className="w-10 h-10 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Invoice Generation Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 rounded bg-white border border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 font-semibold text-sm transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Settlement Deadline</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full h-14 px-6 rounded bg-white border border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 font-semibold text-sm transition-all outline-none"
                        />
                      </div>
                    </div>

                    {!initialPartner && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Target Merchant Record</label>
                        <div className="relative group">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                          <select
                            value={selectedPartner}
                            className="w-full h-16 pl-16 pr-6 rounded bg-white border border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 appearance-none font-bold text-slate-900 transition-all outline-none"
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

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Strategic Remarks</label>
                      <textarea
                        placeholder="Detail the scope of this invoice or any special terms..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-32 p-6 rounded bg-white border border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 font-medium text-sm resize-none transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Inventory Items</p>
                      <button
                        onClick={addLine}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Line
                      </button>
                    </div>

                    <div className="space-y-4 pb-10">
                      {lines.map((line, index) => (
                        <div key={index} className="bg-white p-8 rounded border border-slate-100 flex flex-col gap-6 relative group transition-all hover:shadow-xl hover:shadow-blue-600/5 hover:border-blue-600/20">
                          <button
                            onClick={() => removeLine(index)}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded border border-slate-100 shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Asset Identity</label>
                              <select
                                value={line.product}
                                onChange={(e) => updateLine(index, "product", e.target.value)}
                                className="w-full h-12 px-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm outline-none"
                              >
                                <option value="">Select Catalog Item...</option>
                                {products?.map(p => (
                                  <option key={p.reference} value={p.name}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Qty</label>
                                <input
                                  type="number"
                                  value={line.quantity}
                                  onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value))}
                                  className="w-full h-12 px-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Valuation</label>
                                <input
                                  type="number"
                                  value={line.unit_price}
                                  onChange={(e) => updateLine(index, "unit_price", parseFloat(e.target.value))}
                                  className="w-full h-12 px-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Official Clarifications</label>
                            <input
                              type="text"
                              placeholder="Brief context for this line item..."
                              value={line.description}
                              onChange={(e) => updateLine(index, "description", e.target.value)}
                              className="w-full h-12 px-6 rounded bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-blue-50/50 p-10 rounded border border-blue-100 shadow-inner space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight italic">Draft Verification</h3>
                        <span className="px-4 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-widest">Awaiting Submission</span>
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-6 pr-10 border-r border-blue-200/50">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Entity</p>
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {selectedPartner ? partners?.find(p => p.code === selectedPartner)?.name : "Not Identified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Settlement Cycle</p>
                            <p className="text-sm font-bold text-slate-900">{date} — {dueDate}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Items for Billing</p>
                            <p className="text-sm font-bold text-slate-900">{lines.length} Dimension Lines</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Final Settlement Goal</p>
                            <p className="text-3xl font-bold text-blue-600 tracking-tighter tabular-nums">
                              {totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded text-white/60 text-[11px] font-medium leading-relaxed flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p>
                        Confirmation: This document will be serialized as a DRAFT. Once initialized, the Finance team can authorize transmission to the partner or record an immediate payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-10 border-t border-slate-100 flex items-center justify-between bg-white">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-8 py-4 rounded font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all font-bold"
                >
                  Return to Phase 0{step - 1}
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 group"
                  >
                    Next Dimension
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    disabled={createMutation.isPending}
                    onClick={handleSubmit}
                    className="flex items-center gap-3 px-14 py-5 bg-blue-600 text-white rounded font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
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
