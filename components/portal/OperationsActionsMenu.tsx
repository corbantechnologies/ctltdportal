"use client";

import { useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, ChevronDown, Database, Users, Package } from "lucide-react";
import CreateDivisionModal from "@/forms/divisions/CreateDivisionModal";
import CreateLead from "@/forms/leads/CreateLead";
import CreateProduct from "@/forms/products/CreateProduct";
import CreatePartner from "@/forms/partners/CreatePartner";

export default function OperationsActionsMenu() {
  const divisionTriggerRef = useRef<HTMLDivElement>(null);
  const leadTriggerRef = useRef<HTMLDivElement>(null);
  const productTriggerRef = useRef<HTMLDivElement>(null);
  const partnerTriggerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Hidden triggers connected to the self-contained modals */}
      <CreateDivisionModal trigger={<div ref={divisionTriggerRef} className="hidden" />} />
      <CreateLead trigger={<div ref={leadTriggerRef} className="hidden" />} />
      <CreateProduct trigger={<div ref={productTriggerRef} className="hidden" />} />
      <CreatePartner trigger={<div ref={partnerTriggerRef} className="hidden" />} rolePrefix="operations" />

      {/* The Dropdown Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="h-9 sm:h-10 px-3.5 sm:px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-semibold text-xs tracking-tight transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 group data-[state=open]:bg-blue-600">
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-[200] w-56 sm:w-64 p-1.5 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 max-w-[calc(100vw-2rem)]"
          >
            <DropdownMenu.Item
              onSelect={() => leadTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              Capture New Lead
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => productTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Package className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              Establish Product
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => partnerTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              Register Partner
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-slate-100 my-1 mx-2" />

            <DropdownMenu.Item
              onSelect={() => divisionTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Database className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              Establish Division
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

