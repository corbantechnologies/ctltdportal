"use client";

import { useCreateInteraction } from "@/hooks/crm/actions";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MessageSquare, Phone, Mail, Users, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateInteractionModalProps {
  leadId?: string;
  partnerId?: string;
  trigger: React.ReactNode;
}

const INTERACTION_TYPES = [
  { value: "NOTE", label: "Internal Note", icon: MessageSquare, color: "text-slate-600 bg-slate-50 border-slate-100" },
  { value: "CALL", label: "Phone Call", icon: Phone, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { value: "EMAIL", label: "Email Message", icon: Mail, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { value: "MEETING", label: "Meeting", icon: Users, color: "text-amber-600 bg-amber-50 border-amber-100" },
  { value: "PROPOSAL", label: "Proposal/Discussion", icon: FileText, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
];

export default function CreateInteractionModal({ leadId, partnerId, trigger }: CreateInteractionModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    interaction_type: "NOTE",
    title: "",
    notes: "",
  });

  const createMutation = useCreateInteraction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        ...formData,
        lead: leadId,
        partner: partnerId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData({ interaction_type: "NOTE", title: "", notes: "" });
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white shadow-md">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-semibold text-slate-900 tracking-tight">Log CRM Activity</Dialog.Title>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Record an interaction or note</p>
                </div>
              </div>
              <Dialog.Close className="w-8 h-8 rounded hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Activity Type</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERACTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.interaction_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, interaction_type: type.value })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2.5 rounded border transition-all hover:border-slate-300 relative",
                        isSelected ? cn("ring-2 ring-slate-900 shadow-sm", type.color) : "bg-white text-slate-400 border-slate-100"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight">{type.label}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-900 rounded flex items-center justify-center text-white ring-1 ring-white">
                          <Check className="w-2 h-2" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Intro call regarding proposalX"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-9 sm:h-10 px-3 bg-slate-50 border border-slate-200 rounded text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Activity Notes</label>
                <textarea
                  required
                  placeholder="Provide details about the interaction..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-slate-900 transition-all resize-none outline-none"
                />
              </div>
            </div>

            <button
              disabled={createMutation.isPending}
              className="w-full h-9 sm:h-10 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-xs sm:text-sm tracking-tight transition-all shadow-sm active:scale-95"
            >
              {createMutation.isPending ? "Logging Activity..." : "Record Activity"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
