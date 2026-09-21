/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchInvoices, useMarkInvoiceAsPaid, usePostInvoiceToGL } from "@/hooks/financials/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import KpiStatCard from "@/components/portal/KpiStatCard";
import FilterTabs from "@/components/portal/FilterTabs";
import ProgressBar from "@/components/portal/ProgressBar";
import Link from "next/link";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import {
  FileText,
  Building2,
  Calendar,
  CreditCard,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Receipt,
  Send,
  Zap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoicesListProps {
  rolePrefix: "finance" | "director" | "operations";
}

export default function InvoicesList({ rolePrefix }: InvoicesListProps) {
  const router = useRouter();
  const headers = useAxiosAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isLoading, data: invoices } = useFetchInvoices();
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const postGLMutation = usePostInvoiceToGL();

  // Financial KPI Metrics
  const metrics = useMemo(() => {
    if (!invoices) return { totalBilled: 0, totalPaid: 0, totalDue: 0, count: 0, postedCount: 0 };
    let totalBilled = 0;
    let totalPaid = 0;
    let postedCount = 0;

    for (const inv of invoices) {
      const billed = parseFloat(String(inv.total_amount || 0));
      const paid = parseFloat(String(inv.amount_paid || 0));
      totalBilled += billed;
      totalPaid += paid;
      if (inv.is_posted) postedCount++;
    }

    const totalDue = Math.max(0, totalBilled - totalPaid);
    return {
      totalBilled,
      totalPaid,
      totalDue,
      count: invoices.length,
      postedCount,
    };
  }, [invoices]);

  // Tab Filtering & Search
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((inv) => {
      const billed = parseFloat(String(inv.total_amount || 0));
      const paid = parseFloat(String(inv.amount_paid || 0));
      const due = billed - paid;

      // Tab check
      if (activeTab === "unpaid" && (inv.status === "PAID" || due <= 0)) return false;
      if (activeTab === "paid" && inv.status !== "PAID" && due > 0) return false;
      if (activeTab === "partial" && (paid <= 0 || due <= 0)) return false;
      if (activeTab === "draft" && inv.is_posted) return false;

      // Search check
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const clientName = (inv.partner_name || inv.partner || inv.client_name || "").toLowerCase();
      return (
        inv.code.toLowerCase().includes(q) ||
        clientName.includes(q) ||
        inv.reference.toLowerCase().includes(q)
      );
    });
  }, [invoices, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const filterTabs = [
    { id: "all", label: "All Invoices", count: invoices?.length || 0 },
    {
      id: "unpaid",
      label: "Outstanding Due",
      count: invoices?.filter((i) => (parseFloat(String(i.total_amount)) - parseFloat(String(i.amount_paid))) > 0).length || 0,
    },
    {
      id: "partial",
      label: "Partially Settled",
      count: invoices?.filter((i) => {
        const b = parseFloat(String(i.total_amount));
        const p = parseFloat(String(i.amount_paid));
        return p > 0 && b > p;
      }).length || 0,
    },
    { id: "paid", label: "Settled in Full", count: invoices?.filter((i) => i.status === "PAID").length || 0 },
    { id: "draft", label: "Pending GL Post", count: invoices?.filter((i) => !i.is_posted).length || 0 },
  ];

  const handleDownload = async (invoice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${backendUrl}/api/v1/invoices/${invoice.reference}/download/`;
    await downloadPDF(url, `Invoice_${invoice.code}.pdf`, headers);
  };

  const getStatusBadge = (invoice: any) => {
    const status = invoice.status;
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIALLY_PAID":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Invoice &amp; Billing Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage customer billings, settlement progress, and General Ledger revenue postings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${rolePrefix}/sales/new`)}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            Direct Cash Sale
          </button>
          <button
            onClick={() => router.push(`/${rolePrefix}/invoices/new`)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Tax Invoice
          </button>
        </div>
      </div>

      {/* Real-time KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          title="Total Billed Revenue"
          value={`KES ${metrics.totalBilled.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle={`${metrics.count} total customer invoices`}
          icon={FileText}
          accentColor="slate"
        />
        <KpiStatCard
          title="Collections Received"
          value={`KES ${metrics.totalPaid.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle={
            metrics.totalBilled > 0
              ? `${((metrics.totalPaid / metrics.totalBilled) * 100).toFixed(1)}% recovery rate`
              : "0% recovery"
          }
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <KpiStatCard
          title="Outstanding Receivables"
          value={`KES ${metrics.totalDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle="Pending cash settlement"
          icon={Clock}
          accentColor="amber"
        />
        <KpiStatCard
          title="General Ledger Sync"
          value={`${metrics.postedCount} / ${metrics.count}`}
          subtitle={
            metrics.count > 0
              ? `${((metrics.postedCount / metrics.count) * 100).toFixed(0)}% posted to ledger`
              : "0% posted"
          }
          icon={ShieldCheck}
          accentColor="blue"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice code, client name, or reference..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-0 text-xs font-semibold shadow-sm transition-all"
          />
        </div>

        <FilterTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Invoice No / Code</th>
                <th className="py-4 px-6">Billed Customer</th>
                <th className="py-4 px-6">Issue &amp; Due Date</th>
                <th className="py-4 px-6">Payment Progress</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6 text-right">Ledger Status</th>
                <th className="py-4 px-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-wider">No invoices found</p>
                    <p className="text-slate-400 text-xs mt-1">Create a new invoice or direct sale to get started</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv: any) => {
                  const total = parseFloat(String(inv.total_amount || 0));
                  const paid = parseFloat(String(inv.amount_paid || 0));
                  const balanceDue = Math.max(0, total - paid);
                  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
                  const clientName = inv.partner_name || inv.partner || inv.client_name || "Direct Customer";

                  return (
                    <tr
                      key={inv.reference}
                      onClick={() => router.push(`/${rolePrefix}/invoices/${inv.reference}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Document Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-900 text-xs group-hover:text-emerald-600 transition-colors">
                              {inv.code}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {inv.reference.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer / Partner */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                            {clientName}
                          </span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5 text-[11px] font-mono">
                          <div className="text-slate-700 font-medium">
                            {new Date(inv.date).toLocaleDateString("en-GB")}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Due: {new Date(inv.due_date).toLocaleDateString("en-GB")}
                          </div>
                        </div>
                      </td>

                      {/* Payment Progress */}
                      <td className="py-4 px-6 w-48">
                        <ProgressBar
                          value={progress}
                          color={progress === 100 ? "emerald" : progress > 0 ? "amber" : "blue"}
                          size="sm"
                          subLabel={balanceDue > 0 ? `Due: KES ${balanceDue.toLocaleString()}` : "Settled"}
                        />
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 text-right">
                        <p className="font-mono font-bold text-slate-900 text-sm">
                          KES {total.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex flex-col items-end gap-1">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                              getStatusBadge(inv)
                            )}
                          >
                            {inv.status?.replace("_", " ")}
                          </span>
                          {inv.is_posted ? (
                            <span className="text-[9px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> GL Posted
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-amber-600">
                              Draft GL
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== "PAID" && (
                            <Link
                              href={`/${rolePrefix}/receipts/new?invoice=${inv.reference}&amount=${balanceDue}`}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                              title="Record Payment Receipt (Full Page)"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            onClick={(e) => handleDownload(inv, e)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Download PDF Invoice"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              Showing {paginatedInvoices.length} of {filteredInvoices.length} invoices
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-slate-900 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
