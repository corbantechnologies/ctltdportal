"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  FileText,
  Search,
  ChevronRight,
  Building2,
  Users,
  Calendar,
  Clock,
  Notebook
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createQuotation } from "@/services/quotations";
import { useFetchLeads } from "@/hooks/leads/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CreateQuotationModalProps {
  rolePrefix: string;
  initialLead?: { reference: string; name: string };
  initialPartner?: { code: string; name: string };
  trigger: React.ReactNode;
}

export default function CreateQuotationModal({
  rolePrefix,
  initialLead,
  initialPartner,
  trigger
}: CreateQuotationModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const authHeaders = useAxiosAuth();

  // Form State
  const [selectedEntity, setSelectedEntity] = useState<{ type: "LEAD" | "PARTNER"; id: string } | null>(
    initialLead ? { type: "LEAD", id: initialLead.reference } :
      initialPartner ? { type: "PARTNER", id: initialPartner.code } : null
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  // Queries (only if not pre-selected)
  const { data: leads } = useFetchLeads();
  const { data: partners } = useFetchPartners();

  const handleSubmit = async () => {
    if (!selectedEntity) {
      toast.error("Please identify the target entity");
      return;
    }

    setIsPending(true);
    try {
      // Build payload based on entity type
      const payload: any = {
        date,
        expiry_date: expiryDate,
        notes,
        status: "DRAFT" as const
      };

      if (selectedEntity.type === "LEAD") {
        payload.lead = selectedEntity.id; // lead reference
      } else {
        payload.partner = selectedEntity.id; // partner code
      }

      const data = await createQuotation(payload, authHeaders);
      
      toast.success("Quotation record initialized");
      setOpen(false);

      // Navigate to the lead quotation detail page to add lines
      if (selectedEntity.type === "LEAD") {
        router.push(`/${rolePrefix}/leads/${selectedEntity.id}/${data.reference}`);
      } else {
        // Fallback for partners if needed
        router.push(`/${rolePrefix}/quotations/${data.reference}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to initialize quotation";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                 <Dialog.Title className="text-xl font-bold text-slate-900 tracking-tight italic">
                  Initialize <span className="text-blue-600">Quotation</span>
                </Dialog.Title>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Header setup & Entity Assignment</p>
              </div>
            </div>
            <Dialog.Close className="w-10 h-10 rounded hover:bg-slate-200 flex items-center justify-center text-black transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Entity Selection Section */}
            {!initialLead && !initialPartner && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Target Recipient
                </label>
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <select
                    className="w-full h-16 pl-16 pr-6 rounded bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white appearance-none font-bold text-slate-900 transition-all outline-none"
                    onChange={(e) => {
                      const [type, id] = e.target.value.split(":");
                      setSelectedEntity({ type: type as any, id });
                    }}
                  >
                    <option value="">Identify Case Subject...</option>
                    <optgroup label="Leads">
                      {leads?.map(l => (
                        <option key={l.reference} value={`LEAD:${l.reference}`}>{l.first_name} {l.last_name} ({l.company_name})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Partners">
                      {partners?.map(p => (
                        <option key={p.reference} value={`PARTNER:${p.code}`}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            )}


            {/* Date Controls */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Effective Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 px-6 rounded bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white font-semibold text-sm transition-all text-slate-900"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Expiration Cycle
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-14 px-6 rounded bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white font-semibold text-sm transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <Notebook className="w-3.5 h-3.5" />
                Strategic Context
              </label>
              <textarea
                placeholder="Add internal notes or strategic context for this quotation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-6 rounded bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white font-medium text-sm resize-none transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4 text-black">
              <Building2 className="w-5 h-5" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Initialization Phase</p>
            </div>
            
            <button
              disabled={isPending}
              onClick={handleSubmit}
              className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 group"
            >
              {isPending ? "Configuring..." : "Establish Record"}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
