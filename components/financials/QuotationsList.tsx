/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useFetchQuotations } from "@/hooks/quotations/actions";
import { convertQuotationToInvoice, downloadQuotation, Quotation } from "@/services/quotations";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import KpiStatCard from "@/components/portal/KpiStatCard";
import FilterTabs from "@/components/portal/FilterTabs";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import {
  FileBadge,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotationsListProps {
  rolePrefix: string;
}

export default function QuotationsList({ rolePrefix }: QuotationsListProps) {
  const router = useRouter();
  const headers = useAxiosAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isLoading, data: quotations } = useFetchQuotations();

  // Metrics
  const metrics = useMemo(() => {
    if (!quotations) return { totalPipeline: 0, acceptedValue: 0, count: 0, acceptedCount: 0 };
    let totalPipeline = 0;
    let acceptedValue = 0;
    let acceptedCount = 0;

    for (const q of quotations) {
      const val = parseFloat(String(q.quotation_total || 0));
      totalPipeline += val;
      if (q.status === "ACCEPTED") {
        acceptedValue += val;
        acceptedCount++;
      }
    }

    return {
      totalPipeline,
      acceptedValue,
      count: quotations.length,
      acceptedCount,
    };
  }, [quotations]);

  // Filtering
  const filteredQuotations = useMemo(() => {
    if (!quotations) return [];
    return quotations.filter((q) => {
      // Tab filter
      if (activeTab === "accepted" && q.status !== "ACCEPTED") return false;
      if (activeTab === "pending" && q.status !== "SENT" && q.status !== "DRAFT") return false;
      if (activeTab === "expired" && q.status !== "EXPIRED" && q.status !== "REJECTED") return false;

      // Search filter
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      const targetName = (
        q.partner_details?.name ||
        q.lead_details?.company_name ||
        `${q.lead_details?.first_name || ""} ${q.lead_details?.last_name || ""}`
      ).toLowerCase();
      return q.code.toLowerCase().includes(term) || targetName.includes(term);
    });
  }, [quotations, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotations.slice(start, start + itemsPerPage);
  }, [filteredQuotations, currentPage]);

  const filterTabs = [
    { id: "all", label: "All Proposals", count: quotations?.length || 0 },
    {
      id: "accepted",
      label: "Accepted & Ready",
      count: quotations?.filter((q) => q.status === "ACCEPTED").length || 0,
    },
    {
      id: "pending",
      label: "Active & Sent",
      count: quotations?.filter((q) => q.status === "SENT" || q.status === "DRAFT").length || 0,
    },
    {
      id: "expired",
      label: "Closed / Expired",
      count: quotations?.filter((q) => q.status === "EXPIRED" || q.status === "REJECTED").length || 0,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "EXPIRED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleDownload = async (quotation: Quotation, e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadQuotation(quotation.reference, quotation.code, headers);
  };

  const getViewLink = (quotation: any) => {
    if (quotation.lead_details) {
      return `/${rolePrefix}/leads/${quotation.lead_details.reference}`;
    }
    if (quotation.partner_details) {
      return `/${rolePrefix}/partners/${quotation.partner_details.reference}`;
    }
    return "#";
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Commercial Proposals &amp; Quotes
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage commercial bids, quotation expirations, and 1-click conversion to Tax Invoices
          </p>
        </div>

        <button
          onClick={() => router.push(`/${rolePrefix}/quotations/new`)}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Commercial Proposal
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          title="Total Pipeline Value"
          value={`KES ${metrics.totalPipeline.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle={`${metrics.count} total commercial quotes`}
          icon={FileBadge}
          accentColor="blue"
        />
        <KpiStatCard
          title="Accepted Value"
          value={`KES ${metrics.acceptedValue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          subtitle={
            metrics.totalPipeline > 0
              ? `${((metrics.acceptedValue / metrics.totalPipeline) * 100).toFixed(1)}% conversion rate`
              : "0% win rate"
          }
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <KpiStatCard
          title="Accepted Proposals"
          value={metrics.acceptedCount}
          subtitle="Ready for Tax Invoice conversion"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <KpiStatCard
          title="Active Quotes in Review"
          value={metrics.count - metrics.acceptedCount}
          subtitle="Pending client approval"
          icon={Clock}
          accentColor="amber"
        />
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search proposals by code, prospect, or partner..."
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Proposal Code</th>
                <th className="py-4 px-6">Target Prospect / Client</th>
                <th className="py-4 px-6">Validity &amp; Expiry</th>
                <th className="py-4 px-6 text-right">Proposed Value</th>
                <th className="py-4 px-6 text-right">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <FileBadge className="w-10 h-10 mx-auto mb-3 opacity-30 text-blue-600" />
                    <p className="text-xs font-bold uppercase tracking-wider">No quotations found</p>
                    <p className="text-slate-400 text-xs mt-1">Click "New Commercial Proposal" to create a quote</p>
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((quotation) => {
                  const targetName =
                    quotation.partner_details?.name ||
                    quotation.lead_details?.company_name ||
                    `${quotation.lead_details?.first_name || ""} ${quotation.lead_details?.last_name || ""}` ||
                    "Direct Discovery";

                  return (
                    <tr
                      key={quotation.reference}
                      onClick={() => router.push(getViewLink(quotation))}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                            <FileBadge className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                              {quotation.code}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Issued: {new Intl.DateTimeFormat("en-GB").format(new Date(quotation.date))}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                            {targetName}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-0.5 text-[11px] font-mono">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Intl.DateTimeFormat("en-GB").format(new Date(quotation.expiry_date))}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 text-sm">
                        KES {parseFloat(String(quotation.quotation_total || 0)).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            getStatusStyle(quotation.status)
                          )}
                        >
                          {quotation.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {quotation.status === "ACCEPTED" && (
                            <ConvertQuotationButton quotation={quotation} rolePrefix={rolePrefix} />
                          )}
                          <button
                            onClick={(e) => handleDownload(quotation, e)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Download PDF Proposal"
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
              Showing {paginatedQuotations.length} of {filteredQuotations.length} proposals
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

function ConvertQuotationButton({ quotation, rolePrefix }: { quotation: any; rolePrefix: string }) {
  const [isPending, setIsPending] = useState(false);
  const authHeaders = useAxiosAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleConvert = async () => {
    setIsPending(true);
    try {
      const data = await convertQuotationToInvoice(quotation.reference, authHeaders);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Quotation converted to Tax Invoice successfully!");
      router.push(`/${rolePrefix}/invoices/${data.invoice_reference}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.error || "Conversion failed");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      disabled={isPending}
      onClick={handleConvert}
      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
      title="Convert to Tax Invoice"
    >
      {isPending ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RefreshCw className="w-3.5 h-3.5" />
      )}
      Convert to Invoice
    </button>
  );
}
