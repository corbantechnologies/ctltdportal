/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchReceipts, useMarkReceiptAsPosted } from "@/hooks/financials/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import KpiStatCard from "@/components/portal/KpiStatCard";
import FilterTabs from "@/components/portal/FilterTabs";
import ProgressBar from "@/components/portal/ProgressBar";
import Link from "next/link";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import { formatNumber } from "@/tools/format";
import {
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Banknote,
  Send,
  Eye,
  Building2,
  Receipt as ReceiptIcon,
  Plus,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface ReceiptsListProps {
  rolePrefix: "finance" | "director" | "operations";
}

export default function ReceiptsList({ rolePrefix }: ReceiptsListProps) {
  const router = useRouter();
  const headers = useAxiosAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isLoading: isLoadingReceipts, data: receipts } = useFetchReceipts();
  const { data: partners, isLoading: isLoadingPartners } = useFetchPartners();
  const markAsPostedMutation = useMarkReceiptAsPosted();

  // Financial KPI Metrics (Styled identically to InvoicesList)
  const metrics = useMemo(() => {
    if (!receipts) return { totalInflow: 0, count: 0, postedCount: 0, etimsCount: 0 };
    let totalInflow = 0;
    let postedCount = 0;
    let etimsCount = 0;

    for (const r of receipts) {
      const amt = parseFloat(String(r.amount || 0));
      totalInflow += amt;
      if (r.is_posted || r.journal_reference) postedCount++;
      if (r.kra_sales_receipt) etimsCount++;
    }

    return {
      totalInflow,
      count: receipts.length,
      postedCount,
      etimsCount,
    };
  }, [receipts]);

  // Tab & Search Filtering
  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter((receipt: any) => {
      const isPosted = Boolean(receipt.is_posted || receipt.journal_reference);
      const hasEtims = Boolean(receipt.kra_sales_receipt);

      // Tab check
      if (activeTab === "posted" && !isPosted) return false;
      if (activeTab === "unposted" && isPosted) return false;
      if (activeTab === "etims" && !hasEtims) return false;

      // Partner filter check
      if (partnerFilter) {
        const pName = (receipt.partner_name || "").toLowerCase();
        const pCode = (receipt.partner_code || "").toLowerCase();
        const pRef = (receipt.partner_reference || "").toLowerCase();
        const target = partnerFilter.toLowerCase();
        if (pName !== target && pCode !== target && pRef !== target) {
          return false;
        }
      }

      // Search query check
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (receipt.code || "").toLowerCase().includes(q) ||
        (receipt.invoice || "").toLowerCase().includes(q) ||
        (receipt.invoice_code || "").toLowerCase().includes(q) ||
        (receipt.partner_name || "").toLowerCase().includes(q) ||
        (receipt.payment_method_name || "").toLowerCase().includes(q) ||
        (receipt.reference || "").toLowerCase().includes(q) ||
        (receipt.kra_sales_receipt || "").toLowerCase().includes(q)
      );
    });
  }, [receipts, activeTab, partnerFilter, searchQuery]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage]);

  const filterTabs = [
    { id: "all", label: "All Receipts", count: receipts?.length || 0 },
    {
      id: "posted",
      label: "Posted to GL",
      count: receipts?.filter((r: any) => r.is_posted || r.journal_reference).length || 0,
    },
    {
      id: "unposted",
      label: "Pending GL Post",
      count: receipts?.filter((r: any) => !(r.is_posted || r.journal_reference)).length || 0,
    },
    {
      id: "etims",
      label: "eTIMS Certified",
      count: receipts?.filter((r: any) => Boolean(r.kra_sales_receipt)).length || 0,
    },
  ];

  const handleDownload = async (receipt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/v1/receipts/${receipt.reference}/pdf/`;
      await downloadPDF(url, `Receipt_${receipt.code}.pdf`, headers);
      toast.success("Receipt PDF downloaded");
    } catch (err) {
      toast.error("Failed to download receipt PDF");
    }
  };

  const handleRowClick = (receipt: any) => {
    router.push(`/${rolePrefix}/receipts/${receipt.reference}`);
  };

  const handlePostGL = (receipt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsPostedMutation.mutate(receipt.reference);
  };

  if (isLoadingReceipts || isLoadingPartners) return <LoadingSpinner />;

  const glSettlementRate = metrics.count > 0 ? (metrics.postedCount / metrics.count) * 100 : 0;
  const etimsComplianceRate = metrics.count > 0 ? (metrics.etimsCount / metrics.count) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Top Header matching InvoicesList */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              General Ledger Inflows
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Official Payment <span className="text-emerald-600 font-bold">Receipts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Customer payment collections, electronic tax receipts (eTIMS), and automated double-entry GL audit trails.
          </p>
        </div>

        <Link
          href={`/${rolePrefix}/receipts/new`}
          className="h-10 px-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Payment Receipt</span>
        </Link>
      </div>

      {/* Financial KPI Stats Cards Row (matching InvoicesList) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Collections */}
        <KpiStatCard
          title="Total Cash Inflow"
          value={`KES ${formatNumber(metrics.totalInflow)}`}
          subtitle="Cumulative recorded collections"
          icon={Banknote}
          accentColor="emerald"
          badge={
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
              Cash Settled
            </span>
          }
        />

        {/* KPI 2: Receipts Issued */}
        <KpiStatCard
          title="Receipts Issued"
          value={metrics.count}
          subtitle={`Avg. KES ${formatNumber(metrics.count > 0 ? metrics.totalInflow / metrics.count : 0)} / receipt`}
          icon={ReceiptIcon}
          accentColor="blue"
          badge={
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
              Active Cycle
            </span>
          }
        />

        {/* KPI 3: GL Posting Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GL Post Rate
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {glSettlementRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {metrics.postedCount} of {metrics.count} posted to General Ledger
            </p>
          </div>
          <ProgressBar value={glSettlementRate} size="sm" color="emerald" />
        </div>

        {/* KPI 4: eTIMS Certified */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                eTIMS Compliance
              </span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {etimsComplianceRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {metrics.etimsCount} electronic receipts synchronized
            </p>
          </div>
          <ProgressBar value={etimsComplianceRate} size="sm" color="blue" />
        </div>
      </div>

      {/* Filter Tabs (matching InvoicesList) */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setCurrentPage(1);
        }}
      />

      {/* Search & Partner Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receipt code, customer, invoice code, eTIMS..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-medium text-xs outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                &times;
              </button>
            )}
          </div>

          {/* Customer / Partner Filter Dropdown (Crucial User Requirement!) */}
          <div className="relative min-w-[200px] sm:max-w-xs">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={partnerFilter}
              onChange={(e) => {
                setPartnerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-7 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-semibold text-slate-700 outline-none transition-all cursor-pointer truncate"
            >
              <option value="">All Customers / Partners</option>
              {partners?.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.code ? `[${p.code}] ` : ""}{p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap self-end sm:self-center">
          Showing <span className="text-slate-900 font-mono font-bold">{filteredReceipts.length}</span> receipts
        </div>
      </div>

      {/* Main Table (Desktop) + Mobile Cards View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Receipt Code</th>
                <th className="py-3 px-4">Customer / Partner</th>
                <th className="py-3 px-4">Invoice Linked</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount Inflow</th>
                <th className="py-3 px-4 text-center">eTIMS Ref</th>
                <th className="py-3 px-4 text-center">GL Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ReceiptIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No payment receipts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery || partnerFilter || activeTab !== "all"
                        ? "Try clearing filters to see more results."
                        : "Issue your first customer receipt using the button above."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((r: any) => {
                  const isPosted = Boolean(r.is_posted || r.journal_reference);
                  return (
                    <tr
                      key={r.reference}
                      onClick={() => handleRowClick(r)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Code & Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                            {r.code}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            {r.date}
                          </span>
                        </div>
                      </td>

                      {/* Customer / Partner */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[160px]">
                              {r.partner_name || "Direct Customer"}
                            </p>
                            {r.partner_code && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                {r.partner_code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Invoice Linked */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold text-slate-700">
                            {r.invoice_code || "Direct Payment"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {r.invoice ? "AR Settlement" : "Manual Log"}
                          </span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.payment_method_name || "Electronic / Bank"}
                        </span>
                      </td>

                      {/* Amount Inflow */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-extrabold text-sm text-emerald-700">
                          KES {formatNumber(parseFloat(r.amount || "0"))}
                        </span>
                      </td>

                      {/* eTIMS */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {r.kra_sales_receipt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            {r.kra_sales_receipt}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* GL Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            isPosted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isPosted ? "bg-emerald-500" : "bg-amber-500")} />
                          {isPosted ? "Posted to GL" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Download PDF"
                            onClick={(e) => handleDownload(r, e)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {!isPosted && (
                            <button
                              type="button"
                              title="Post to GL"
                              onClick={(e) => handlePostGL(r, e)}
                              disabled={markAsPostedMutation.isPending}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-xs"
                            >
                              Post
                            </button>
                          )}

                          <button
                            type="button"
                            title="View Receipt"
                            onClick={() => handleRowClick(r)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
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

        {/* Mobile Cards View (Guaranteed 100% Responsiveness!) */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedReceipts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <ReceiptIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No payment receipts found</p>
            </div>
          ) : (
            paginatedReceipts.map((r: any) => {
              const isPosted = Boolean(r.is_posted || r.journal_reference);
              return (
                <div
                  key={r.reference}
                  onClick={() => handleRowClick(r)}
                  className="p-4 space-y-3 hover:bg-slate-50 transition-colors active:bg-slate-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{r.code}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                            isPosted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {isPosted ? "Posted" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        {r.partner_name || "Direct Customer"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-sm text-emerald-700 block">
                        KES {formatNumber(parseFloat(r.amount || "0"))}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="font-mono text-slate-600">
                      Invoice: {r.invoice_code || "Direct"}
                    </span>
                    <span className="text-slate-400">
                      {r.payment_method_name || "Bank Transfer"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {r.kra_sales_receipt ? (
                      <span className="text-[10px] font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                        eTIMS: {r.kra_sales_receipt}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No eTIMS</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(r, e)}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRowClick(r)}
                        className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold text-[10px] flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
              <strong className="text-slate-800">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
