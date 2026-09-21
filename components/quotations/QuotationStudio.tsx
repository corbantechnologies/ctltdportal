/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useFetchLeads } from "@/hooks/leads/actions";
import { useFetchProducts } from "@/hooks/products/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useFetchTermsAndConditions } from "@/hooks/termsandconditions/actions";
import { createQuotation } from "@/services/quotations";
import { createQuotationLine } from "@/services/quotationlines";
import {
  FileBadge,
  Building2,
  Calendar,
  CreditCard,
  User,
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

interface QuotationStudioProps {
  rolePrefix: "finance" | "director" | "operations";
}

interface QuotationLineDraft {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function QuotationStudioContent({ rolePrefix }: QuotationStudioProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const headers = useAxiosAuth();
  const queryClient = useQueryClient();

  const initialLeadParam = searchParams.get("lead");
  const initialPartnerParam = searchParams.get("partner");

  const { data: partners } = useFetchPartners();
  const { data: leads } = useFetchLeads();
  const { data: products } = useFetchProducts();
  const { data: paymentAccounts } = useFetchPaymentAccounts();
  const { data: terms } = useFetchTermsAndConditions();

  // Target Type: "lead" vs "partner"
  const [targetType, setTargetType] = useState<"lead" | "partner">(
    initialLeadParam ? "lead" : initialPartnerParam ? "partner" : "lead"
  );
  const [selectedLeadRef, setSelectedLeadRef] = useState(initialLeadParam || "");
  const [selectedPartnerCode, setSelectedPartnerCode] = useState(initialPartnerParam || "");

  // Metadata
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split("T")[0]);
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 30);
  const [expiryDate, setExpiryDate] = useState(defaultExpiry.toISOString().split("T")[0]);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState("");
  const [selectedTerms, setSelectedTerms] = useState("");
  const [notes, setNotes] = useState("");

  // Lines
  const [lineItems, setLineItems] = useState<QuotationLineDraft[]>([
    {
      id: "line-1",
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line Handlers
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
      toast.error("Quotation must contain at least one line item.");
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLine = (id: string, field: keyof QuotationLineDraft, value: any) => {
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

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
  const totalAmount = subtotal;

  const currentLeadObj = leads?.find((l: any) => l.reference === selectedLeadRef);
  const currentPartnerObj = partners?.find((p: any) => p.code === selectedPartnerCode);
  const targetDisplayName =
    targetType === "lead"
      ? currentLeadObj
        ? `${currentLeadObj.company_name} (${currentLeadObj.first_name} ${currentLeadObj.last_name})`
        : "Select a Prospect Lead"
      : currentPartnerObj
        ? currentPartnerObj.name
        : "Select a Partner";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetType === "lead" && !selectedLeadRef) {
      toast.error("Please select a target prospect lead.");
      return;
    }

    if (targetType === "partner" && !selectedPartnerCode) {
      toast.error("Please select a registered partner.");
      return;
    }

    if (lineItems.some((item) => !item.productName || item.unitPrice <= 0 || item.quantity <= 0)) {
      toast.error("Please fill in valid product names, quantities, and unit prices for all items.");
      return;
    }

    if (totalAmount <= 0) {
      toast.error("Proposal total must be greater than KES 0.00");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Quotation Header
      const payload: any = {
        date: quoteDate,
        expiry_date: expiryDate,
        status: "DRAFT",
        notes: notes.trim(),
        payment_account: selectedPaymentAccount || undefined,
        terms_and_conditions: selectedTerms || undefined,
      };

      if (targetType === "lead") payload.lead = selectedLeadRef;
      if (targetType === "partner") payload.partner = selectedPartnerCode;

      const createdQuote = await createQuotation(payload, headers);

      // 2. Add Line Items
      for (const item of lineItems) {
        await createQuotationLine(
          {
            quotation: createdQuote.code,
            product: item.productName,
            description: item.description || "Proposal Deliverable",
            quantity: Number(item.quantity),
            unit_price: Number(item.unitPrice),
            total_price: Number(item.quantity * item.unitPrice),
          },
          headers
        );
      }

      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Commercial Proposal generated successfully!");

      if (targetType === "lead" && selectedLeadRef) {
        router.push(`/${rolePrefix}/leads/${selectedLeadRef}`);
      } else {
        router.push(`/${rolePrefix}/quotations`);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to generate proposal.";
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
            onClick={() => router.push(`/${rolePrefix}/quotations`)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Proposals
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
              <FileBadge className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Commercial Proposal Studio
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Draft, price, and issue formal quotations with instant conversion to Tax Invoices
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Quotation &amp; Proposal Engine</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-Column: Form Details & Line Editor */}
        <div className="lg:col-span-2 space-y-8">
          {/* Target Entity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Target Entity (Client or Prospect)
                </h2>
              </div>

              {/* Target Type Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTargetType("lead")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all",
                    targetType === "lead"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Prospect Lead
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("partner")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all",
                    targetType === "partner"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Existing Partner
                </button>
              </div>
            </div>

            {targetType === "lead" ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Prospect Lead <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedLeadRef}
                  onChange={(e) => setSelectedLeadRef(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm font-semibold"
                >
                  <option value="">Choose a prospect lead...</option>
                  {leads?.map((l: any) => (
                    <option key={l.reference} value={l.reference}>
                      {l.company_name || `${l.first_name} ${l.last_name}`} ({l.reference})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Registered Partner <span className="text-rose-500">*</span>
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
            )}
          </div>

          {/* Quotation Timeline & Terms Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-slate-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Validity &amp; Proposal Guidelines
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Proposal Date
                </label>
                <input
                  type="date"
                  required
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Validity Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Designated Bank / Payee
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
                  Delivery &amp; T&amp;C Terms
                </label>
                <select
                  value={selectedTerms}
                  onChange={(e) => setSelectedTerms(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                >
                  <option value="">Standard Commercial Terms</option>
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
                  Deliverables &amp; Pricing Structure
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
                          Product / Service
                        </label>
                        <input
                          type="text"
                          list={`quote-prod-list-${item.id}`}
                          placeholder="Select or enter product..."
                          value={item.productName}
                          onChange={(e) => {
                            updateLine(item.id, "productName", e.target.value);
                            handleProductSelect(item.id, e.target.value);
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                        />
                        <datalist id={`quote-prod-list-${item.id}`}>
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
              Commercial Proposal Notes &amp; Scope Details
            </h2>
            <textarea
              rows={3}
              placeholder="e.g. Quotation valid for 30 calendar days from date of issue. Includes 1-year SLA warranty."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-medium"
            />
          </div>
        </div>

        {/* Right Column: Sticky Live Proposal Preview */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Proposal Letterhead
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                Draft
              </span>
            </div>

            {/* Target Client Preview */}
            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Target Entity
              </span>
              <p className="text-sm font-bold text-slate-900 truncate">
                {targetDisplayName}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {quoteDate} • Valid Until: {expiryDate}
              </p>
            </div>

            {/* Itemized Lines */}
            <div className="space-y-2 py-2 text-xs max-h-48 overflow-y-auto scrollbar-thin border-y border-slate-100">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="truncate max-w-[150px]">
                    {item.quantity}x {item.productName || "Deliverable"}
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
                <span>Proposed Value:</span>
                <span className="font-mono font-bold text-slate-800">
                  KES {subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-white flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Total Quote:
                </span>
                <span className="text-2xl font-mono font-bold text-blue-400">
                  KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || totalAmount <= 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Commercial Proposal...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function QuotationStudio(props: QuotationStudioProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <QuotationStudioContent {...props} />
    </Suspense>
  );
}
