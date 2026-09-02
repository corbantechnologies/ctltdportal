"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useFetchFinancialMonth,
  useReopenFinancialMonth
} from "@/hooks/financialmonths/actions";
import FinancialMonthReport from "@/components/financialmonths/FinancialMonthReport";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  Calendar,
  ChevronLeft,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  TrendingDown,
  Loader2
} from "lucide-react";
import { useState } from "react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { toast } from "react-hot-toast";

export default function DirectorMonthDetailPage() {
  const { reference, monthRef } = useParams();
  const router = useRouter();
  const headers = useAxiosAuth();
  const { data: month, isLoading } = useFetchFinancialMonth(monthRef as string);
  const reopenMutation = useReopenFinancialMonth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (!month) return (
    <div className="p-12 text-center text-gray-300 font-black uppercase tracking-[0.3em]">
      Period Not Found.
    </div>
  );

  const handleReopen = async () => {
    if (!window.confirm(`Are you sure you want to RE-OPEN ${month.name}? This should only be done for authorized corrections.`)) return;

    setIsProcessing(true);
    try {
      await reopenMutation.mutateAsync(month.reference);
      toast.success("Month re-opened successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to re-open month.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/financialmonths/${month.reference}/download/`, {
        method: 'GET',
        headers: {
          'Authorization': headers.headers.Authorization,
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monthly_report_${month.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully.");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to generate report PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <nav>
            <ol className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-black/30">
              <li>
                <button onClick={() => router.push('/director/dashboard')} className="hover:text-black">Dashboard</button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push('/director/fiscal-years')} className="hover:text-black">Years</button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push(`/director/fiscal-years/${reference}`)} className="hover:text-black">
                  {month.financial_year || "Current Year"}
                </button>
              </li>
              <li>/</li>
              <li className="text-black">{month.name}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/20 hover:bg-black hover:text-white transition-all shadow-xl shadow-black/5 border border-black/5"
            >
              <ChevronLeft className="w-6 h-6 shrink-0" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tighter italic leading-none flex items-center gap-3">
                {month.name}
                {month.is_closed ? (
                  <div className="w-2.5 h-2.5 rounded bg-gray-300" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded bg-green-500 animate-pulse" />
                )}
              </h1>
              <p className="text-[10px] font-semibold text-black/30 uppercase tracking-[0.4em] mt-2">
                Fiscal Period Reflection
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-10 px-6 rounded bg-white border border-black/5 shadow-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/70 hover:bg-black hover:text-white transition-all disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? "Generating..." : "Snapshot"}
          </button>

          {month.is_closed && (
            <button
              onClick={handleReopen}
              disabled={isProcessing}
              className="h-10 px-6 rounded bg-[#D0402B]/5 border border-[#D0402B]/20 text-[#D0402B] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D0402B] hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-[#D0402B]/10"
            >
              <Unlock className="w-4 h-4 font-bold" />
              Re-open
            </button>
          )}
        </div>
      </div>

      {/* Audit Alert */}
      {month.is_closed ? (
        <div className="bg-black/5 border border-black/5 rounded p-6 flex items-center gap-6 shadow-inner">
          <div className="w-12 h-12 rounded bg-white flex items-center justify-center text-black shadow-xl shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-black tracking-tight">Period Finalized</p>
            <p className="text-[11px] text-black/40 font-medium">This month is locked and only available for audit and view.</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#D0402B]/5 border border-[#D0402B]/10 rounded p-6 flex items-center gap-6 shadow-inner">
          <div className="w-12 h-12 rounded bg-white flex items-center justify-center text-[#D0402B] shadow-xl shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#D0402B] tracking-tight">Active Observation</p>
            <p className="text-[11px] text-[#D0402B]/40 font-medium">Monitoring period progress in real-time. Unposted journals detected: <b>{month.unposted_journals_count}</b>.</p>
          </div>
        </div>
      )}

      {/* Main Report Section */}
      <div className="pt-6">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.5em] text-black/30">Financial <span className="text-black">Audit Report</span></h2>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <FinancialMonthReport
          month={month}
          rolePrefix="director"
        />
      </div>
    </div>
  );
}
