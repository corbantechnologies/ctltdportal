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
          <button className="h-14 px-8 bg-slate-900 hover:bg-corporate-primary text-white rounded font-semibold text-sm tracking-tight transition-all shadow-xl hover:shadow-corporate-primary/20 active:scale-[0.98] flex items-center gap-3 group data-[state=open]:bg-corporate-primary">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Quick Actions
            <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-[200] w-64 p-2 bg-white rounded shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
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
