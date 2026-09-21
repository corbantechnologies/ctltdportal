/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchProducts } from "@/hooks/products/actions";
import { useFetchPaymentMethods } from "@/hooks/paymentmethods/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { createInvoice, createInvoiceLine, postInvoiceToGL, payInvoice } from "@/services/invoices";
import {
  Zap,
  ShoppingBag,
  Plus,
  Trash2,
  Calendar,
  Building2,
  CreditCard,
  User,
  Phone,
  Mail,
  ChevronLeft,
  CheckCircle2,
  Receipt,
  FileText,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectSaleStudioProps {
  rolePrefix: "finance" | "director" | "operations";
}

interface SaleLineItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function DirectSaleStudio({ rolePrefix }: DirectSaleStudioProps) {
  const router = useRouter();
  const headers = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: products } = useFetchProducts();
  const { data: paymentMethods } = useFetchPaymentMethods();
  const { data: paymentAccounts } = useFetchPaymentAccounts();
  const { data: divisions } = useFetchDivisions();

  // Sale metadata
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [kraReceiptRef, setKraReceiptRef] = useState("");
  const [notes, setNotes] = useState("Direct Point-of-Sale Transaction");

  // Line items
  const [lineItems, setLineItems] = useState<SaleLineItem[]>([
    {
      id: "line-1",
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  // Line Item Handlers
  const addLineItem = () => {
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

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.error("At least one line item is required.");
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof SaleLineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        return updated;
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

  // Financial Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
  const vatRate = 0.16; // 16% VAT standard
  const hasTax = false; // direct gross calculation or add toggle
  const totalAmount = subtotal;

  // Process Direct Sale & Instant Double-Entry Posting
  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lineItems.some((item) => !item.productName || item.unitPrice <= 0 || item.quantity <= 0)) {
      toast.error("Please ensure all items have a valid product name, quantity, and unit price.");
      return;
    }

    if (totalAmount <= 0) {
      toast.error("Sale total must be greater than KES 0.00");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Invoice with optional walk-in client details
      const invoiceData = {
        partner: null,
        client_name: clientName.trim() || "Walk-in Cash Customer",
        client_phone: clientPhone.trim() || undefined,
        client_email: clientEmail.trim() || undefined,
        date: saleDate,
        due_date: saleDate,
        notes: notes,
        payment_account: selectedPaymentAccount || undefined,
      };

      const newInvoice = await createInvoice(invoiceData, headers);

      // 2. Create Line Items
      for (const item of lineItems) {
        await createInvoiceLine(
          {
            invoice: newInvoice.code,
            product: item.productName,
            description: item.description || "Point of Sale Deliverable",
            quantity: Number(item.quantity),
            unit_price: Number(item.unitPrice),
          },
          headers
        );
      }

      // 3. Post to General Ledger (DR Accounts Receivable, CR Sales Revenue)
      await postInvoiceToGL(newInvoice.reference, headers);

      // 4. Record Instant Receipt & Settle (DR Bank/Cash, CR Accounts Receivable)
      const paidInvoice = await payInvoice(
        newInvoice.reference,
        headers,
        {
          notes: `Direct point-of-sale settlement via ${selectedPaymentAccount || "Cash/Bank"}`,
          kra_sales_receipt: kraReceiptRef || undefined,
        }
      );

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });

      toast.success("Direct Cash Sale completed & posted to General Ledger!");
      setCompletedInvoice(paidInvoice);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || "Failed to process direct sale";
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
            Back to Financials
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Direct Cash Sale Studio
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Point-of-Sale for walk-in clients &amp; direct service settlements without requiring a registered partner
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Instant Double-Entry GL Settlement</span>
        </div>
      </div>

      {completedInvoice ? (
        /* Success State */
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sale Completed Successfully!
            </h2>
            <p className="text-sm text-slate-500">
              Transaction code <span className="font-mono font-bold text-slate-900">{completedInvoice.code}</span> has been settled and posted to the General Ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-500">Total Settled:</span>
            <span className="font-mono font-bold text-lg text-emerald-600">
              KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => router.push(`/${rolePrefix}/invoices/${completedInvoice.reference}`)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Invoice Sheet
            </button>
            <button
              onClick={() => {
                setCompletedInvoice(null);
                setLineItems([
                  {
                    id: "line-1",
                    productName: "",
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                  },
                ]);
                setClientName("");
                setClientPhone("");
                setClientEmail("");
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Book Another Sale
            </button>
          </div>
        </div>
      ) : (
        /* Studio Grid Layout */
        <form onSubmit={handleProcessSale} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2-Column: Form & Line Items Editor */}
          <div className="lg:col-span-2 space-y-8">
            {/* Walk-in Customer Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <User className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Walk-in Customer Details (Optional)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Walk-in Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Phone / M-Pesa Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0712 345 678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Editor Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-slate-700" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Products &amp; Service Deliverables
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
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
                          Item #{index + 1}
                        </span>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                            title="Remove Line Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        {/* Product Selection */}
                        <div className="sm:col-span-6 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Product / Service Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              list={`product-list-${item.id}`}
                              placeholder="Type or select product..."
                              value={item.productName}
                              onChange={(e) => {
                                updateLineItem(item.id, "productName", e.target.value);
                                handleProductSelect(item.id, e.target.value);
                              }}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                            />
                            <datalist id={`product-list-${item.id}`}>
                              {products?.map((p: any) => (
                                <option key={p.reference} value={p.name}>
                                  {p.name} - KES {parseFloat(p.price || 0).toLocaleString()}
                                </option>
                              ))}
                            </datalist>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)
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
                              updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                            }
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-mono font-semibold text-right"
                          />
                        </div>

                        {/* Line Total */}
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

            {/* Payment Settlement & Metadata Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Payment Account &amp; Settlement Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Settlement Bank / Cash Till
                  </label>
                  <select
                    value={selectedPaymentAccount}
                    onChange={(e) => setSelectedPaymentAccount(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  >
                    <option value="">Default Cash / Bank Account</option>
                    {paymentAccounts?.map((pa: any) => (
                      <option key={pa.reference} value={pa.reference}>
                        {pa.name} ({pa.payment_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    KRA Fiscal / ETR Ref (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KRA-ETR-998822"
                    value={kraReceiptRef}
                    onChange={(e) => setKraReceiptRef(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Live Receipt & Checkout Preview */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-slate-900 text-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Cash Receipt
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Direct Sale
                </span>
              </div>

              {/* Document Summary Header */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Customer
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {clientName.trim() || "Walk-in Cash Customer"}
                </p>
                {clientPhone && <p className="text-xs font-mono text-slate-400">{clientPhone}</p>}
              </div>

              {/* Items Ticker */}
              <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs max-h-48 overflow-y-auto scrollbar-thin">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300">
                    <span className="truncate max-w-[150px]">
                      {item.quantity}x {item.productName || "Product"}
                    </span>
                    <span className="font-mono font-bold text-white">
                      KES {(item.quantity * item.unitPrice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono text-white">
                    KES {subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tax (Included/Standard):</span>
                  <span className="font-mono text-emerald-400">KES 0.00</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || totalAmount <= 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing &amp; Posting to GL...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Complete Sale &amp; Post to GL
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                Posts directly to Accounts Receivable and automatically settles against Bank/Cash in the General Ledger.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
