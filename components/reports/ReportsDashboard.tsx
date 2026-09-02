"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import {
    getPNL,
    getBalanceSheet,
    getTrialBalance,
    getRevenue,
    getCashBalance,
} from "@/services/reports";
import { getDivisions } from "@/services/divisions";
import { MetricCard } from "./MetricCard";
import {
    CalendarRange,
    DollarSignIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    WalletIcon,
    SlidersHorizontal,
    X,
    BookOpen,
} from "lucide-react";
import { PnLReport } from "./PnL";
import { RevenueReport } from "./Revenue";
import { BalanceSheetReport } from "./BalanceSheet";
import { TrialBalanceReport } from "./TrialBalance";
import Link from "next/link";

// ---------- Skeleton helpers ----------
function CardSkeleton({ height = "h-64" }: { height?: string }) {
    return (
        <div className={`${height} rounded border border-slate-100 bg-slate-50 animate-pulse`}>
            <div className="p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="mt-4 space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-3 bg-slate-100 rounded w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function MetricSkeleton() {
    return (
        <div className="h-28 rounded border border-slate-100 bg-slate-50 animate-pulse p-5 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-6 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
    );
}

// ---------- Filter bar ----------
interface Filters {
    start_date?: string;
    end_date?: string;
    division?: string;
}

function buildParams(f: Filters) {
    const p: Record<string, string> = {};
    if (f.start_date) p.start_date = f.start_date;
    if (f.end_date) p.end_date = f.end_date;
    if (f.division && f.division !== "ALL") p.division_code = f.division;
    return p;
}

function appendParams(base: string, params: Record<string, string>) {
    const q = new URLSearchParams(params).toString();
    return q ? `${base}?${q}` : base;
}

// ---------- Main dashboard ----------
export default function ReportsDashboard({ rolePrefix = "director" }: { rolePrefix?: string }) {
    const header = useAxiosAuth();

    const [filters, setFilters] = useState<Filters>({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<Filters>({});

    const params = buildParams(filters);

    // Divisions for filter dropdown
    const { data: divisions } = useQuery({
        queryKey: ["divisions"],
        queryFn: () => getDivisions(header),
        enabled: !!header.headers.Authorization,
    });

    // Each report fetches independently with shared filter params
    const { data: cashData, isLoading: isCashLoading } = useQuery({
        queryKey: ["cash-balance", params],
        queryFn: () => getCashBalance(header, params),
        enabled: !!header.headers.Authorization,
    });
    const { data: pnlData, isLoading: isPnlLoading } = useQuery({
        queryKey: ["pnl", params],
        queryFn: () => getPNL(header, params),
        enabled: !!header.headers.Authorization,
    });
    const { data: revenueData, isLoading: isRevenueLoading } = useQuery({
        queryKey: ["revenue", params],
        queryFn: () => getRevenue(header, params),
        enabled: !!header.headers.Authorization,
    });
    const { data: bsData, isLoading: isBsLoading } = useQuery({
        queryKey: ["balance-sheet", params],
        queryFn: () => getBalanceSheet(header, params),
        enabled: !!header.headers.Authorization,
    });
    const { data: tbData, isLoading: isTbLoading } = useQuery({
        queryKey: ["trial-balance", params],
        queryFn: () => getTrialBalance(header, params),
        enabled: !!header.headers.Authorization,
    });

    const applyFilters = useCallback(() => {
        setFilters({ ...draftFilters });
        setFiltersOpen(false);
    }, [draftFilters]);

    const clearFilters = useCallback(() => {
        setFilters({});
        setDraftFilters({});
        setFiltersOpen(false);
    }, []);

    const hasFilters = filters.start_date || filters.end_date || (filters.division && filters.division !== "ALL");

    return (
        <div className="space-y-8 p-4 sm:p-0">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-6 rounded border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                        <CalendarRange className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 tracking-tight">Audit &amp; Period Reports</h3>
                        <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest mt-0.5">
                            {hasFilters
                                ? `Filtered: ${filters.start_date || "—"} → ${filters.end_date || "—"}${filters.division && filters.division !== "ALL" ? ` · ${filters.division}` : ""}`
                                : "Current Financial Year — All Divisions"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:gap-3">
                    {/* GL Statement shortcut */}
                    <Link
                        href={`/${rolePrefix}/reports/gl-statement`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-200 bg-white text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        GL Statement
                    </Link>

                    {/* Filter toggle */}
                    <button
                        onClick={() => { setDraftFilters(filters); setFiltersOpen(!filtersOpen); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${hasFilters
                            ? "bg-[#045138] text-white shadow-lg shadow-[#045138]/20"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {hasFilters ? "Filtered" : "Filters"}
                    </button>

                    <a
                        href={`/${rolePrefix}/fiscal-years`}
                        className="px-4 py-2.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        Audit Trail
                    </a>
                </div>
            </div>

            {/* Filter Panel */}
            {filtersOpen && (
                <div className="bg-white border border-slate-200 rounded shadow-sm p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/50">
                            Period &amp; Division Filters
                        </p>
                        <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-gray-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">From Date</label>
                            <input
                                type="date"
                                value={draftFilters.start_date || ""}
                                onChange={(e) => setDraftFilters((f) => ({ ...f, start_date: e.target.value }))}
                                className="w-full h-10 px-3 rounded border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">To Date</label>
                            <input
                                type="date"
                                value={draftFilters.end_date || ""}
                                onChange={(e) => setDraftFilters((f) => ({ ...f, end_date: e.target.value }))}
                                className="w-full h-10 px-3 rounded border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/40 mb-1">Division</label>
                            <select
                                value={draftFilters.division || "ALL"}
                                onChange={(e) => setDraftFilters((f) => ({ ...f, division: e.target.value }))}
                                className="w-full h-10 px-3 rounded border border-gray-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#045138]/20 focus:border-[#045138] appearance-none"
                            >
                                <option value="ALL">All Divisions</option>
                                {divisions?.map((d) => (
                                    <option key={d.reference} value={d.code ?? d.reference}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            onClick={clearFilters}
                            className="h-9 px-4 rounded border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={applyFilters}
                            className="h-9 px-6 rounded bg-[#045138] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            <div>
                <h2 className="font-semibold tracking-tight text-corporate-foreground">Financial Summaries</h2>
                <p className="text-slate-400 text-sm mt-1">Real-time overview of your financial performance and position.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isCashLoading ? <MetricSkeleton /> : cashData && (
                    <MetricCard
                        title="Cash & Bank Balance"
                        value={cashData.cash_balance}
                        currency={cashData.currency}
                        icon={WalletIcon}
                        description={`Cash: ${cashData.cash_only?.toLocaleString() ?? "–"} | Bank: ${cashData.bank_balance?.toLocaleString() ?? "–"}`}
                    />
                )}
                {isPnlLoading ? <MetricSkeleton /> : pnlData && (
                    <MetricCard
                        title="Net Profit"
                        value={pnlData.net_profit}
                        currency={pnlData.currency}
                        icon={TrendingUpIcon}
                        description="Net income for the period"
                    />
                )}
                {isRevenueLoading ? <MetricSkeleton /> : revenueData && (
                    <MetricCard
                        title="Total Revenue"
                        value={revenueData.group_total_revenue}
                        currency={revenueData.currency}
                        icon={DollarSignIcon}
                        description="Gross revenue generated"
                    />
                )}
                {isPnlLoading ? <MetricSkeleton /> : pnlData && (
                    <MetricCard
                        title="Total Expenses"
                        value={pnlData.operating_expenses + pnlData.cost_of_sales}
                        currency={pnlData.currency}
                        icon={TrendingDownIcon}
                        description="Operating + COGS"
                    />
                )}
            </div>

            {/* Report Cards */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-8 mb-6">
                <div className="col-span-4">
                    {isPnlLoading ? <CardSkeleton /> : pnlData && <PnLReport data={pnlData} />}
                </div>
                <div className="col-span-4">
                    {isRevenueLoading ? <CardSkeleton /> : revenueData && <RevenueReport data={revenueData} />}
                </div>
            </div>

            <div className="mb-6">
                {isBsLoading ? <CardSkeleton height="h-96" /> : bsData && <BalanceSheetReport data={bsData} />}
            </div>

            <div className="mb-6">
                {isTbLoading ? <CardSkeleton height="h-96" /> : tbData && <TrialBalanceReport data={tbData} />}
            </div>
        </div>
    );
}
