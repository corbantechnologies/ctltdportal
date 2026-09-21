/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useFetchProducts } from "@/hooks/products/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useFetchTermsAndConditions } from "@/hooks/termsandconditions/actions";
import { createInvoice, createInvoiceLine, postInvoiceToGL } from "@/services/invoices";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  FileText,
  Building2,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  Plus,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Send,
  RefreshCw,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceStudioProps {
  rolePrefix: "finance" | "director" | "operations";
}

interface InvoiceLineDraft {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function InvoiceStudioContent({ rolePrefix }: InvoiceStudioProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPartner = searchParams.get("partner") || "";
  const headers = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: partners } = useFetchPartners();
  const { data: products } = useFetchProducts();
  const { data: paymentAccounts } = useFetchPaymentAccounts();
  const { data: terms } = useFetchTermsAndConditions();

  // Client Type: "partner" vs "walkin"
  const [clientType, setClientType] = useState<"partner" | "walkin">("partner");
  const [selectedPartnerCode, setSelectedPartnerCode] = useState(urlPartner);

  useEffect(() => {
    if (urlPartner && !selectedPartnerCode) {
      setSelectedPartnerCode(urlPartner);
    }
  }, [urlPartner, selectedPartnerCode]);
  const [walkinName, setWalkinName] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");

  // Invoice Meta
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split("T")[0]);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState("");
  const [selectedTerms, setSelectedTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [autoPostToGL, setAutoPostToGL] = useState(true);

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineDraft[]>([
    {
      id: "line-1",
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line Item Handlers
  const addLine = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        productName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lineItems.length === 1) {
      toast.error("Invoice must contain at least one line item.");
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLine = (id: string, field: keyof InvoiceLineDraft, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const handleProductSelect = (id: string, productName: string) => {
    const foundProduct = products?.find((p: any) => p.name === productName);
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          productName,
          description: foundProduct?.description || item.description,
          unitPrice: foundProduct?.unit_price ? Number(foundProduct.unit_price) : item.unitPrice,
        };
      })
    );
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
  const totalAmount = subtotal;

  const currentPartnerObj = partners?.find((p: any) => p.code === selectedPartnerCode);
  const clientDisplayName =
    clientType === "partner"
      ? currentPartnerObj?.name || "Select a Partner"
      : walkinName.trim() || "Walk-in Client";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clientType === "partner" && !selectedPartnerCode) {
      toast.error("Please select a partner or switch to Direct/Walk-in Client.");
      return;
    }

    if (clientType === "walkin" && !walkinName.trim()) {
      toast.error("Please provide a client name.");
      return;
    }

    if (lineItems.some((item) => !item.productName || item.unitPrice <= 0 || item.quantity <= 0)) {
      toast.error("Please fill in valid product names, quantities, and unit prices for all lines.");
      return;
    }

    if (totalAmount <= 0) {
      toast.error("Invoice total must be greater than KES 0.00");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Invoice
      const invoicePayload = {
        partner: clientType === "partner" ? selectedPartnerCode : null,
        client_name: clientType === "walkin" ? walkinName.trim() : null,
        client_email: clientType === "walkin" ? walkinEmail.trim() || null : null,
        client_phone: clientType === "walkin" ? walkinPhone.trim() || null : null,
        date: invoiceDate,
        due_date: dueDate,
        notes: notes.trim() || undefined,
        payment_account: selectedPaymentAccount || undefined,
        terms_and_conditions: selectedTerms || undefined,
      };

      const createdInvoice = await createInvoice(invoicePayload, headers);

      // 2. Add Line Items
      for (const item of lineItems) {
        await createInvoiceLine(
          {
            invoice: createdInvoice.code,
            product: item.productName,
            description: item.description || "Service Deliverable",
            quantity: Number(item.quantity),
            unit_price: Number(item.unitPrice),
          },
          headers
        );
      }

      // 3. Optional Immediate GL Posting
      if (autoPostToGL) {
        try {
          await postInvoiceToGL(createdInvoice.reference, headers);
        } catch (glErr: any) {
          console.warn("Auto GL post warning:", glErr);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });

      toast.success(
        autoPostToGL
          ? "Tax Invoice created and posted to General Ledger!"
          : "Tax Invoice created as Draft."
      );

      router.push(`/${rolePrefix}/invoices/${createdInvoice.reference}`);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to generate invoice.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => router.push(`/${rolePrefix}/invoices`)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Invoices
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Tax Invoice Studio
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Create executive tax invoices with real-time tax breakdown, flexible client billing, and General Ledger posting
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Double-Entry Billing Studio</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-Column: Form & Line Editor */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Customer &amp; Billed Entity
                </h2>
              </div>

              {/* Toggle Partner vs Walk-in */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setClientType("partner")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all",
                    clientType === "partner"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Registered Partner
                </button>
                <button
                  type="button"
                  onClick={() => setClientType("walkin")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all",
                    clientType === "walkin"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Direct / Walk-in Client
                </button>
              </div>
            </div>

            {clientType === "partner" ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Partner / Corporate Client <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedPartnerCode}
                  onChange={(e) => setSelectedPartnerCode(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm font-semibold"
                >
                  <option value="">Choose a registered partner...</option>
                  {partners?.map((p: any) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Client / Entity Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Logistics"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Client Email
                  </label>
                  <input
                    type="email"
                    placeholder="billing@client.com"
                    value={walkinEmail}
                    onChange={(e) => setWalkinEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Client Phone
                  </label>
                  <input
                    type="text"
                    placeholder="0700 000 000"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dates & Payment Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Invoice Dates &amp; Remittance Guidelines
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Invoice Date
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Bank / Payment Account
                </label>
                <select
                  value={selectedPaymentAccount}
                  onChange={(e) => setSelectedPaymentAccount(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                >
                  <option value="">Default Commercial Bank</option>
                  {paymentAccounts?.map((pa: any) => (
                    <option key={pa.reference} value={pa.reference}>
                      {pa.name} ({pa.payment_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Terms &amp; Conditions
                </label>
                <select
                  value={selectedTerms}
                  onChange={(e) => setSelectedTerms(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                >
                  <option value="">Standard Terms</option>
                  {terms?.map((t: any) => (
                    <option key={t.reference} value={t.reference}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Billed Products &amp; Services
                </h2>
              </div>
              <button
                type="button"
                onClick={addLine}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Line
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => {
                const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Line #{index + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                          title="Remove Line Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      {/* Product Selector */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Product / Deliverable
                        </label>
                        <input
                          type="text"
                          list={`inv-prod-list-${item.id}`}
                          placeholder="Select or enter product..."
                          value={item.productName}
                          onChange={(e) => {
                            updateLine(item.id, "productName", e.target.value);
                            handleProductSelect(item.id, e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                        />
                        <datalist id={`inv-prod-list-${item.id}`}>
                          {products?.map((p: any) => (
                            <option key={p.reference} value={p.name}>
                              {p.name} - KES {parseFloat(p.price || 0).toLocaleString()}
                            </option>
                          ))}
                        </datalist>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLine(item.id, "quantity", parseFloat(e.target.value) || 0)
                          }
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-mono font-bold text-center"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Unit Price (KES)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateLine(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                          }
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-mono font-semibold text-right"
                        />
                      </div>

                      {/* Total */}
                      <div className="sm:col-span-2 space-y-1 text-right">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Total (KES)
                        </label>
                        <div className="h-10 flex items-center justify-end font-mono font-bold text-xs text-slate-900">
                          {lineTotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Invoice Notes &amp; Instructions
            </h2>
            <textarea
              rows={3}
              placeholder="e.g. Payment due within 14 calendar days. Thank you for your business."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-medium"
            />
          </div>
        </div>

        {/* Right Column: Sticky Live Parchment Preview & Actions */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-200">
            {/* Parchment Document Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Tax Invoice Preview
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Live Studio
              </span>
            </div>

            {/* Billed Client Preview */}
            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Billed To
              </span>
              <p className="text-sm font-bold text-slate-900 truncate">
                {clientDisplayName}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {invoiceDate} • Due: {dueDate}
              </p>
            </div>

            {/* Itemized Lines Preview */}
            <div className="space-y-2 py-2 text-xs max-h-48 overflow-y-auto scrollbar-thin border-y border-slate-100">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="truncate max-w-[150px]">
                    {item.quantity}x {item.productName || "Product"}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    KES {(item.quantity * item.unitPrice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-800">
                  KES {subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-white flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Total Payable:
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* GL Posting Toggle */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-900 font-semibold text-[11px]">
                  Post to General Ledger automatically
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPostToGL}
                onChange={(e) => setAutoPostToGL(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={isSubmitting || totalAmount <= 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating &amp; Committing Invoice...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {autoPostToGL ? "Create & Post to GL" : "Save as Draft Invoice"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function InvoiceStudio({ rolePrefix }: InvoiceStudioProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InvoiceStudioContent rolePrefix={rolePrefix} />
    </Suspense>
  );
}
