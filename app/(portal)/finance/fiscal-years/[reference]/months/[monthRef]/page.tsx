"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useFetchFinancialMonth,
  useCloseFinancialMonth,
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
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadPDF } from "@/lib/download";
import { toast } from "react-hot-toast";

export default function FinanceMonthDetailPage() {
  const { reference, monthRef } = useParams();
  const router = useRouter();
  const { data: month, isLoading, refetch } = useFetchFinancialMonth(monthRef as string);
  const headers = useAxiosAuth();
  const closeMutation = useCloseFinancialMonth();
  const reopenMutation = useReopenFinancialMonth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (!month) return (
    <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest">
      Financial month not found.
    </div>
  );

  const handleClose = async () => {
    if (!window.confirm(`Are you sure you want to CLOSE ${month.name}? This will lock all postings for this period.`)) return;

    setIsProcessing(true);
    try {
      await closeMutation.mutateAsync(month.reference);
      toast.success("Month closed successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to close month.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopen = async () => {
    if (!window.confirm(`Are you sure you want to RE-OPEN ${month.name}?`)) return;

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
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/financialmonths/${month.reference}/download/`;
      await downloadPDF(url, `monthly_report_${month.name}.pdf`, headers);
      toast.success("Report downloaded successfully.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to generate report PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <nav>
            <ol className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/30">
              <li>
                <button onClick={() => router.push('/finance/dashboard')} className="hover:text-black">Dashboard</button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push('/finance/fiscal-years')} className="hover:text-black">Years</button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push(`/finance/fiscal-years/${reference}`)} className="hover:text-black">{month.financial_year}</button>
              </li>
              <li>/</li>
              <li className="text-black">{month.name}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded bg-black/5 flex items-center justify-center text-black/40 hover:bg-black hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-black tracking-tighter italic leading-none flex items-center gap-2">
                {month.name}
                {month.is_closed ? (
                  <Lock className="w-4 h-4 text-gray-300" />
                ) : (
                  <div className="w-2 h-2 rounded bg-green-500 animate-pulse" />
                )}
              </h1>
              <p className="text-[10px] font-semibold text-black/40 uppercase tracking-[0.2em] mt-1">
                {new Date(month.start_date).toLocaleDateString()} — {new Date(month.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-9 px-4 rounded border border-gray-100 bg-white shadow-sm flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/60 hover:bg-black hover:text-white transition-all disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isDownloading ? "Generating..." : "Report"}
          </button>

          {month.is_closed ? (
            <button
              onClick={handleReopen}
              disabled={isProcessing}
              className="h-9 px-4 rounded border border-[#045138]/20 bg-[#045138]/5 text-[#045138] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#045138] hover:text-white transition-all disabled:opacity-50"
            >
              <Unlock className="w-3.5 h-3.5" />
              Re-open Month
            </button>
          ) : (
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="h-9 px-4 rounded bg-[#045138] text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-[#045138]/20 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              Close Period
            </button>
          )}
        </div>
      </div>

      {/* Warning if unposted journals exist */}
      {!month.is_closed && month.unposted_journals_count > 0 && (
        <div className="p-4 rounded bg-orange-50 border border-orange-100 flex items-start gap-4 animate-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-950">Draft Journals Detected</p>
            <p className="text-xs text-orange-800/70 mt-0.5">
              There are <b>{month.unposted_journals_count}</b> journal batches pending post in this period.
              You must post all journals before you can officially close this month.
            </p>
          </div>
        </div>
      )}

      {/* Success if month is closed */}
      {month.is_closed && (
        <div className="p-4 rounded bg-gray-50 border border-gray-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Period Locked</p>
            <p className="text-xs text-gray-500 mt-0.5">
              This period was closed on <b>{new Date(month.report_generated_at!).toLocaleString()}</b>.
              Posting is restricted and financial records are frozen.
            </p>
          </div>
        </div>
      )}

      {/* Live Financial Report Section */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-base font-bold text-black tracking-tighter italic">Month <span className="text-[#045138]">Performance</span> & Audit</h2>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <FinancialMonthReport
          month={month}
          rolePrefix="finance"
        />
      </div>
    </div>
  );
}
