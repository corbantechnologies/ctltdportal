"use client";

import { useConvertLead } from "@/hooks/leads/actions";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserPlus, Check, ChevronRight, Building2, ShieldCheck, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/portal/LoadingSpinner";

interface ConvertLeadModalProps {
  leadReference: string;
  leadName: string;
  rolePrefix: string;
  trigger: React.ReactNode;
}

const typeIcons = {
  Client: Building2,
  Vendor: ShieldCheck,
  Partner: Briefcase,
};

export default function ConvertLeadModal({ leadReference, leadName, rolePrefix, trigger }: ConvertLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const { data: partnerTypes, isLoading: isLoadingTypes } = useFetchPartnerTypes();
  const convertMutation = useConvertLead(leadReference, rolePrefix);

  const handleConvert = async () => {
    if (!selectedType) return;
    convertMutation.mutate(selectedType, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50 relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold text-slate-900 tracking-tight">Convert to Partner</Dialog.Title>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Transforming prospect: <span className="text-blue-600">{leadName}</span></p>
                </div>
              </div>
              <Dialog.Close className="w-10 h-10 rounded hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>
          </div>

          <div className="p-10 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Classify Partnership Type</p>
                {isLoadingTypes && <div className="text-[10px] font-bold animate-pulse text-blue-600">Loading classifications...</div>}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {partnerTypes?.map((type) => {
                  const isSelected = selectedType === type.reference;
                  return (
                    <button
                      key={type.reference}
                      type="button"
                      onClick={() => setSelectedType(type.reference)}
                      className={cn(
                        "flex items-center justify-between p-6 rounded border-2 transition-all group relative overflow-hidden",
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white shadow-2xl"
                          : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className={cn(
                          "w-12 h-12 rounded flex items-center justify-center transition-colors",
                          isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                        )}>
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold uppercase tracking-widest">{type.name}</p>
                          <p className={cn("text-[10px] font-medium opacity-60", isSelected ? "text-slate-300" : "text-slate-500")}>
                            Code: {type.code}
                          </p>
                        </div>
                      </div>

                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center transition-all",
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-300"
                      )}>
                        {isSelected ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                disabled={!selectedType || convertMutation.isPending}
                onClick={handleConvert}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center justify-center gap-3"
              >
                {convertMutation.isPending ? (
                  <>
                    <LoadingSpinner className="w-5 h-5 border-white border-t-transparent" />
                    <span>Processing Conversion...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Conversion</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="bg-slate-50 p-4 rounded flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                  By confirming, this lead will be transitioned to the WON state.
                  Accounting ledgers must be manually initialized by the finance team afterwards.
                </p>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
