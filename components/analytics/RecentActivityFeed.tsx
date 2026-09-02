/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ScrollText, Clock, ArrowRight } from "lucide-react";

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
    .slice(0, 5);

  return (
    <div className="col-span-1 shadow-xl shadow-slate-200/50 border border-slate-200 rounded bg-white p-4 relative overflow-hidden flex flex-col group hover:shadow-corporate-primary/5 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-corporate-primary/5 transition-colors" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-corporate-primary" />
            Audit Trail
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Latest Transactions
          </p>
        </div>
        <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:border-slate-200 transition-colors">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4 relative z-10 flex-1">
        {recentEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <ScrollText className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-sm font-semibold italic">
              No recent activity recorded.
            </p>
          </div>
        ) : (
          recentEntries.map((entry) => (
            <div
              key={entry.reference}
              className="group/item flex items-center justify-between p-4 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                    {entry.notes || "Journal Entry"}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-sm text-slate-900 block tracking-tight">
                  {Number(entry.debit).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
