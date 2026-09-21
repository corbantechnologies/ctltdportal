/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ScrollText, Clock } from "lucide-react";
import Link from "next/link";

interface RecentActivityFeedProps {
  entries: any[];
}

export default function RecentActivityFeed({
  entries,
}: RecentActivityFeedProps) {
  if (!entries) return null;

  const recentEntries = [...entries]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="col-span-1 border border-slate-200 rounded-xl bg-white p-4 sm:p-5 transition-all flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-emerald-600" />
            Audit Ledger Trail
          </h3>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
            Latest Financial Postings
          </p>
        </div>
        <Link
          href="/finance/reports/gl-statement"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {recentEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Clock className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-medium">No recent transactions recorded</p>
          </div>
        ) : (
          recentEntries.map((entry) => {
            const isDebit = Number(entry.debit) > 0;
            const amount = isDebit ? Number(entry.debit) : Number(entry.credit);

            return (
              <div
                key={entry.reference || entry.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70 rounded-lg px-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isDebit
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isDebit ? "DR" : "CR"}
                    </span>
                    <h4 className="font-semibold text-slate-900 truncate">
                      {entry.notes || entry.account_name || "Journal Line"}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    KES {amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
