"use client";

import { 
  Activity, 
  BarChart3, 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Globe, 
  Layers, 
  LayoutGrid, 
  List, 
  Receipt, 
  Users,
  TrendingUp,
  CreditCard,
  Wallet,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { FinancialMonthDetail } from "@/services/financialmonths";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { cn } from "@/lib/utils";

interface FinancialMonthReportProps {
  month: FinancialMonthDetail;
  rolePrefix: string;
}

export default function FinancialMonthReport({
  month,
  rolePrefix,
}: FinancialMonthReportProps) {
  const theme = {
    color: rolePrefix === "director" ? "#D0402B" : rolePrefix === "operations" ? "#3b82f6" : "#045138",
    bg: rolePrefix === "director" ? "bg-[#D0402B]/5" : rolePrefix === "operations" ? "bg-blue-50" : "bg-[#045138]/5",
    border: rolePrefix === "director" ? "border-[#D0402B]/20" : rolePrefix === "operations" ? "border-blue-100" : "border-[#045138]/20",
    text: rolePrefix === "director" ? "text-[#D0402B]" : rolePrefix === "operations" ? "text-blue-600" : "text-[#045138]"
  };

  if (!month) return <LoadingSpinner />;

  const report = month.report || {};
  const pnl = report.pnl || { revenue: 0, cost_of_sales: 0, gross_profit: 0, operating_expenses: 0, net_profit: 0, other_income: 0, non_operating_expense: 0 };
  const kpis = report.kpis || { net_margin: 0, current_ratio: 0 };
  const momGrowth = report.mom_growth || { revenue_growth: 0, profit_growth: 0 };
  
  const chartData = [
    { name: 'Revenue', value: pnl.revenue, color: theme.color },
    { name: 'Expenses', value: (pnl.operating_expenses || 0) + (pnl.cost_of_sales || 0) + (pnl.non_operating_expense || 0), color: '#94a3b8' },
    { name: 'Net Profit', value: pnl.net_profit, color: pnl.net_profit >= 0 ? '#10b981' : '#ef4444' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. EXECUTIVE KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `KES ${(pnl.revenue || 0).toLocaleString()}`,
            growth: momGrowth.revenue_growth,
            icon: TrendingUp,
            suffix: "Revenue"
          },
          {
            label: "Net Profit",
            value: `KES ${(pnl.net_profit || 0).toLocaleString()}`,
            growth: momGrowth.profit_growth,
            icon: Wallet,
            suffix: "Profit"
          },
          {
            label: "Net Margin",
            value: `${kpis.net_margin || 0}%`,
            icon: Activity,
            sublabel: "Profitability"
          },
          {
            label: "Current Ratio",
            value: (kpis.current_ratio || 0).toFixed(2),
            icon: Briefcase,
            sublabel: "Liquidity"
          },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-10 h-10 rounded flex items-center justify-center", theme.bg, theme.text)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              {kpi.growth !== undefined && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded",
                  kpi.growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {kpi.growth >= 0 ? "+" : ""}{kpi.growth}% MoM
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* PRIMARY COLUMN: Tables */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          
          {/* INCOME STATEMENT SUMMARY */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-slate-900 rounded" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 italic">Income Statement Summary</h2>
            </div>
            <div className="bg-white border border-slate-100 rounded overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-50">
                  <tr className="bg-slate-50/50">
                    <td className="p-4 text-slate-500 font-medium">Operations Revenue</td>
                    <td className="p-4 text-right font-bold text-slate-900">KES {(pnl.revenue || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-500">Cost of Goods Sold (COGS)</td>
                    <td className="p-4 text-right text-rose-600 font-medium">- {(pnl.cost_of_sales || 0).toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-y border-slate-100">
                    <td className="p-4 text-slate-900 uppercase tracking-tighter italic">Gross Profit</td>
                    <td className="p-4 text-right text-slate-900 text-sm">KES {(pnl.gross_profit || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4 pl-8 text-slate-400 italic">Operating Expenses (OpEx)</td>
                    <td className="p-4 text-right text-rose-600">- {(pnl.operating_expenses || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4 pl-8 text-slate-400 italic">Other Items (Net)</td>
                    <td className="p-4 text-right text-slate-600 italic">{((pnl.other_income || 0) - (pnl.non_operating_expense || 0)).toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="p-5 uppercase tracking-widest text-[10px]">Net Monthly Performance</td>
                    <td className="p-5 text-right text-base tracking-tight">KES {(pnl.net_profit || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FINANCIAL POSITION & PROJECTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project Profitability Table */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Top Projects Performance</h3>
              <div className="bg-white border border-slate-100 rounded overflow-hidden overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-left border-b border-slate-100">
                      <th className="p-3 font-bold uppercase tracking-tighter">Project</th>
                      <th className="p-3 font-bold text-right uppercase tracking-tighter">Net Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(report.projects || []).slice(0, 5).map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-800 italic">{p.project}</td>
                        <td className={cn("p-3 text-right font-bold", p.net_profit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                          {(p.net_profit || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {(!report.projects || report.projects.length === 0) && (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-slate-300 italic">No project data.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Position Snapshot */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Position Snapshot</h3>
              <div className="bg-slate-50 border border-slate-200 rounded p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Assets</span>
                    <span className="font-bold text-slate-900">{(report.balance_sheet?.total_assets || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Liabilities</span>
                    <span className="font-bold text-rose-600">{(report.balance_sheet?.liabilities?.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-slate-900 uppercase">Shareholder Equity</span>
                    <span className="text-emerald-600">{(report.balance_sheet?.equity?.net || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CASH FLOW ADJUSTMENTS */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-slate-900 rounded" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 italic">Cash Flow Indirect Conversion</h2>
            </div>
            <div className="bg-white border border-slate-100 rounded p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Accrual Profit</p>
                  <p className="text-lg font-bold text-slate-900">{(pnl.net_profit || 0).toLocaleString()}</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 -left-4 flex items-center text-slate-200 hidden md:flex"><ChevronRight className="w-5 h-5" /></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">WC Adjustments</p>
                  <p className={cn("text-lg font-bold", ((report.cash_flow?.operating?.ar_change || 0) + (report.cash_flow?.operating?.ap_change || 0)) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {((report.cash_flow?.operating?.ar_change || 0) + (report.cash_flow?.operating?.ap_change || 0)).toLocaleString()}
                  </p>
                  <div className="absolute inset-y-0 -right-4 flex items-center text-slate-200 hidden md:flex"><ChevronRight className="w-5 h-5" /></div>
                </div>
                <div className={cn("rounded p-3", theme.bg)}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Net Cash Impact</p>
                  <p className={cn("text-xl font-bold", (report.cash_flow?.operating?.net_operating_cash || 0) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {(report.cash_flow?.operating?.net_operating_cash || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR: Charts & Audit */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          
          {/* VISUAL OVERVIEW */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 italic">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              Performance Chart
            </h3>
            <div className="bg-white border border-slate-100 rounded p-6 h-[320px] shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#cbd5e1' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* AUDIT & TECHNICALS */}
          <section className="space-y-4">
            <div className={cn("p-6 rounded border space-y-6 shadow-sm", theme.bg, theme.border)}>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Audit Trial Balance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">System Debits</span>
                    <span className="font-mono font-bold text-slate-700">{(report.trial_balance?.totals?.total_debit || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">System Credits</span>
                    <span className="font-mono font-bold text-slate-700">{(report.trial_balance?.totals?.total_credit || 0).toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-slate-400">Balance Integrity</span>
                      <span className={cn(
                        "text-xs font-black",
                        Math.abs(report.trial_balance?.totals?.net_balance || 0) < 0.01 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {Math.abs(report.trial_balance?.totals?.net_balance || 0) < 0.01 ? "VERIFIED" : (report.trial_balance?.totals?.net_balance || 0).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Journal Volume</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded border-4 border-slate-200 border-t-slate-800 flex items-center justify-center">
                    <span className="text-xs font-black">{month.journals_count || 0}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                    {month.journals_count || 0} transaction batches recorded and processed in this period.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* DETAILED JOURNAL LIST (COLLAPSIBLE/REDUCED) */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1 bg-slate-300 rounded" />
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 italic">Complete Journal Register</h2>
        </div>
        <div className="bg-white border border-slate-100 rounded overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-left border-b border-slate-100 uppercase tracking-tighter">
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold text-center">Batch Type</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(report.journals || []).map((j: any) => (
                <tr key={j.reference} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-700 font-medium">{j.description || "No description provided"}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold uppercase">{j.journal_type}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold uppercase text-[8px]",
                      j.is_posted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      <div className={cn("w-1 h-1 rounded", j.is_posted ? "bg-emerald-500" : "bg-amber-500")} />
                      {j.is_posted ? "Posted" : "Draft"}
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-[9px] text-slate-400">{j.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
