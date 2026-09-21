/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { updateLead } from "@/services/leads";
import {
  Users,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  FileBadge,
  UserCheck,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LeadsKanbanBoardProps {
  leads: any[];
  rolePrefix: string;
}

const STAGES = [
  { id: "NEW", label: "New Prospects", color: "border-blue-500", dotColor: "bg-blue-500" },
  { id: "CONTACTED", label: "Contacted / Discovery", color: "border-amber-500", dotColor: "bg-amber-500" },
  { id: "QUALIFIED", label: "Qualified Leads", color: "border-purple-500", dotColor: "bg-purple-500" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent", color: "border-indigo-500", dotColor: "bg-indigo-500" },
  { id: "WON", label: "Won Deals", color: "border-emerald-500", dotColor: "bg-emerald-500" },
];

export default function LeadsKanbanBoard({ leads, rolePrefix }: LeadsKanbanBoardProps) {
  const router = useRouter();
  const headers = useAxiosAuth();
  const queryClient = useQueryClient();
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);

  const handleStageMove = async (leadRef: string, nextStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUpdatingRef(leadRef);
    try {
      await updateLead(leadRef, { status: nextStatus as any }, headers);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Lead moved to ${nextStatus.replace("_", " ")}`);
    } catch (err: any) {
      toast.error("Failed to update lead stage.");
    } finally {
      setUpdatingRef(null);
    }
  };

  const getNextStage = (currentStatus: string) => {
    switch (currentStatus) {
      case "NEW":
        return "CONTACTED";
      case "CONTACTED":
        return "QUALIFIED";
      case "QUALIFIED":
        return "PROPOSAL_SENT";
      case "PROPOSAL_SENT":
        return "WON";
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.id);

        return (
          <div
            key={stage.id}
            className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full", stage.dotColor)} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {stage.label}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-slate-700 border border-slate-200 shadow-sm">
                {stageLeads.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {stageLeads.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-4">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    No leads in this stage
                  </span>
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const nextStage = getNextStage(lead.status);
                  const isUpdating = updatingRef === lead.reference;

                  return (
                    <div
                      key={lead.reference}
                      onClick={() => router.push(`/${rolePrefix}/leads/${lead.reference}`)}
                      className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                            {lead.first_name} {lead.last_name}
                          </h4>
                          {lead.company_name && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{lead.company_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-500 font-mono">
                        {lead.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Footer */}
                      <div
                        className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/${rolePrefix}/quotations/new?lead=${lead.reference}`}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Generate Proposal"
                        >
                          <FileBadge className="w-3.5 h-3.5" />
                        </Link>

                        {nextStage && (
                          <button
                            disabled={isUpdating}
                            onClick={(e) => handleStageMove(lead.reference, nextStage, e)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                Advance <ChevronRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
