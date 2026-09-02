"use client";

import { useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  ClipboardList,
  UserCheck,
  ExternalLink,
  Edit,
  MoreVertical
} from "lucide-react";
import { Lead } from "@/services/leads";
import CreateQuotationModal from "@/forms/quotations/CreateQuotationModal";
import ConvertLeadModal from "@/forms/leads/ConvertLeadModal";
import UpdateLead from "@/forms/leads/UpdateLead";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeadActionsMenuProps {
  lead: Lead;
  rolePrefix: string;
}

export default function LeadActionsMenu({ lead, rolePrefix }: LeadActionsMenuProps) {
  const quotationTriggerRef = useRef<HTMLDivElement>(null);
  const convertTriggerRef = useRef<HTMLDivElement>(null);
  const updateTriggerRef = useRef<HTMLDivElement>(null);

  const isWon = lead.status === "WON";
  const isQualified = lead.status === "QUALIFIED";

  return (
    <div>
      {/* Hidden triggers connected to the self-contained modals */}
      <CreateQuotationModal
        rolePrefix={rolePrefix}
        initialLead={{ reference: lead.reference, name: `${lead.first_name} ${lead.last_name}` }}
        trigger={<div ref={quotationTriggerRef} className="hidden" />}
      />
      <ConvertLeadModal
        leadReference={lead.reference}
        leadName={`${lead.first_name} ${lead.last_name}`}
        rolePrefix={rolePrefix}
        trigger={<div ref={convertTriggerRef} className="hidden" />}
      />
      <UpdateLead
        lead={lead}
        trigger={<div ref={updateTriggerRef} className="hidden" />}
      />

      {/* The Dropdown Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="h-10 px-6 bg-slate-900 border border-slate-800 text-white rounded text-sm transition-all shadow-2xl active:scale-[0.98] flex items-center gap-4 group data-[state=open]:bg-blue-600 data-[state=open]:border-blue-500">
            <span className="flex items-center gap-3">
              <MoreVertical className="w-4.5 h-4.5 text-blue-400 group-hover:text-white transition-colors" />
              Actions
            </span>
            <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={12}
            className="z-[200] w-72 p-2 bg-white rounded shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          >
            <div className="px-3 py-2 mb-1 border-b border-slate-50">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Available Operations</p>
            </div>

            {!isWon && (
              <DropdownMenu.Item
                onSelect={() => quotationTriggerRef.current?.click()}
                className="flex items-center gap-3 p-3 rounded text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
              >
                <ClipboardList className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                Generate Quotation
              </DropdownMenu.Item>
            )}

            {isQualified && (
              <DropdownMenu.Item
                onSelect={() => convertTriggerRef.current?.click()}
                className="flex items-center gap-3 p-3 rounded text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
              >
                <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                Convert to Partner
              </DropdownMenu.Item>
            )}

            {isWon && lead.partner_reference && (
              <DropdownMenu.Item asChild>
                <Link
                  href={`/${rolePrefix}/partners/${lead.partner_reference}`}
                  className="flex items-center gap-3 p-3 rounded text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  View Partner Profile
                </Link>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="h-px bg-slate-100 my-1 mx-2" />

            <DropdownMenu.Item
              onSelect={() => updateTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Edit className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              Modify Identity
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
