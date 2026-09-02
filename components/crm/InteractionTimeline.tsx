"use client";

import { useFetchInteractions } from "@/hooks/crm/actions";
import {
  Phone,
  Mail,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Plus
} from "lucide-react";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { cn } from "@/lib/utils";
import CreateInteractionModal from "@/forms/crm/CreateInteraction";

interface InteractionTimelineProps {
  leadId?: string;
  partnerId?: string;
  rolePrefix: string;
}

const interactionIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  PROPOSAL: FileText,
  NOTE: MessageSquare,
};

const DEFAULT_COLOR = "bg-slate-50 text-slate-600 border-slate-100";

const interactionColors = {
  CALL: "bg-blue-50 text-blue-600 border-blue-100",
  EMAIL: "bg-purple-50 text-purple-600 border-purple-100",
  MEETING: "bg-amber-50 text-amber-600 border-amber-100",
  PROPOSAL: "bg-emerald-50 text-emerald-600 border-emerald-100",
  NOTE: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function InteractionTimeline({ leadId, partnerId, rolePrefix }: InteractionTimelineProps) {
  const { data: interactions, isLoading } = useFetchInteractions({ lead: leadId, partner: partnerId });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Activity Timeline</h3>
        <CreateInteractionModal
          leadId={leadId}
          partnerId={partnerId}
          trigger={
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              <Plus className="w-3.5 h-3.5" />
              Log Activity
            </button>
          }
        />
      </div>

      {!interactions || interactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-200 mb-3" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No activity recorded yet</p>
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-slate-200">
          {interactions.map((interaction) => {
            const Icon = interactionIcons[interaction.interaction_type] || MessageSquare;
            const colorClass = interactionColors[interaction.interaction_type] || DEFAULT_COLOR;
            
            return (
              <div key={interaction.id} className="relative pl-12 group">
                {/* Timeline Dot/Icon */}
                <div className={cn(
                  "absolute left-0 top-0 w-10 h-10 rounded border flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 z-10",
                  colorClass
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm group-hover:shadow-md transition-all group-hover:border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{interaction.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(interaction.date))}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {interaction.performed_by_details.first_name} {interaction.performed_by_details.last_name}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest",
                      colorClass
                    )}>
                      {interaction.interaction_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap italic opacity-80">
                    "{interaction.notes}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
