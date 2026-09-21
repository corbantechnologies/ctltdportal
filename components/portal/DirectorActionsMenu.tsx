"use client";

import { useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, ChevronDown, Database, Users } from "lucide-react";
import CreateDivisionModal from "@/forms/divisions/CreateDivisionModal";
import CreateOperations from "@/forms/accounts/CreateOperations";
import CreateSales from "@/forms/accounts/CreateSales";
import CreateFinance from "@/forms/accounts/CreateFinance";

export default function DirectorActionsMenu() {
  const divisionTriggerRef = useRef<HTMLDivElement>(null);
  const operationsTriggerRef = useRef<HTMLDivElement>(null);
  const salesTriggerRef = useRef<HTMLDivElement>(null);
  const financeTriggerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Hidden triggers connected to the self-contained modals */}
      <CreateDivisionModal trigger={<div ref={divisionTriggerRef} className="hidden" />} />
      <CreateOperations trigger={<div ref={operationsTriggerRef} className="hidden" />} />
      <CreateSales trigger={<div ref={salesTriggerRef} className="hidden" />} />
      <CreateFinance trigger={<div ref={financeTriggerRef} className="hidden" />} />

      {/* The Dropdown Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="h-9 sm:h-10 px-3.5 sm:px-4 bg-slate-900 hover:bg-corporate-primary text-white rounded-lg font-semibold text-xs tracking-tight transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 group data-[state=open]:bg-corporate-primary">
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
              onSelect={() => divisionTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Database className="w-4 h-4 text-slate-400 group-hover:text-corporate-primary transition-colors" />
              Establish Division
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-slate-100 my-1 mx-2" />

            <DropdownMenu.Item
              onSelect={() => operationsTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-corporate-primary transition-colors" />
              Establish Operations Member
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => salesTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              Establish Sales Member
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => financeTriggerRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors outline-none group data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-corporate-primary transition-colors" />
              Establish Finance Member
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
