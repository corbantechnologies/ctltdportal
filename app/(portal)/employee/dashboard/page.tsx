"use client";

import { useFetchAccount } from "@/hooks/accounts/actions";
import { useFetchSimpleTransactions } from "@/hooks/simpletransactions/actions";
import { ArrowDownLeft, ArrowUpRight, Zap, Clock } from "lucide-react";
import { formatNumber } from "@/tools/format";
import { cn } from "@/lib/utils";
import { SimpleTransaction } from "@/services/simpletransactions";
import Link from "next/link";
import LoadingSpinner from "@/components/portal/LoadingSpinner";

export default function EmployeeDashboard() {
  const { data: account, isLoading: loadingAccount } = useFetchAccount();
  const { data: response, isLoading } = useFetchSimpleTransactions({ limit: "5" });
  const recentTransactions = response?.results || [];

  if (loadingAccount) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded p-6 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Welcome back</p>
        <h1 className="text-2xl font-bold mt-1 tracking-tight">
          {account?.first_name} {account?.last_name}
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Use the <strong className="text-white">Log Transaction</strong> button to quickly record any expense or income. Journals are auto-generated.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 rounded border border-black/5 p-4 shadow-sm">
          <div className="w-9 h-9 rounded bg-emerald-500/10 flex items-center justify-center mb-3">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Money In</p>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">
            {formatNumber(recentTransactions.filter((t) => t.transaction_type === "MONEY_IN").reduce((s, t) => s + parseFloat(t.amount), 0))}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Last 5 records</p>
        </div>
        <div className="bg-white/60 rounded border border-black/5 p-4 shadow-sm">
          <div className="w-9 h-9 rounded bg-red-500/10 flex items-center justify-center mb-3">
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Money Out</p>
          <p className="text-xl font-bold text-red-600 font-mono mt-1">
            {formatNumber(recentTransactions.filter((t) => t.transaction_type === "MONEY_OUT").reduce((s, t) => s + parseFloat(t.amount), 0))}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Last 5 records</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Recent Transactions</h2>
          <Link
            href="/employee/transactions"
            className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            View All →
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((t: SimpleTransaction) => (
              <div key={t.reference} className="bg-white/60 rounded border border-black/5 p-4 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded flex items-center justify-center flex-shrink-0",
                    t.transaction_type === "MONEY_IN" ? "bg-emerald-50" : "bg-red-50"
                  )}>
                    {t.transaction_type === "MONEY_IN"
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      : <ArrowUpRight className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(t.date).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "font-mono font-bold text-sm",
                    t.transaction_type === "MONEY_IN" ? "text-emerald-600" : "text-red-600"
                  )}>
                    {t.transaction_type === "MONEY_IN" ? "+" : "-"}{formatNumber(parseFloat(t.amount))}
                  </p>
                  <div className="mt-0.5">
                    {t.journal ? (
                      <span className="text-[9px] font-semibold text-emerald-600 uppercase">✓ Journal Generated</span>
                    ) : (
                      <span className="text-[9px] font-semibold text-amber-500 uppercase">⏳ Pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white/40 rounded border border-dashed border-black/10">
            <Zap className="w-8 h-8 text-black/10 mx-auto mb-3" />
            <p className="text-sm text-black/30 font-semibold">No transactions yet. Use the button to log your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
