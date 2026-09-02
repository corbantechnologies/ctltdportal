"use client";

import { useFetchFinancialYear } from "@/hooks/financialyears/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import FiscalYearJournals from "@/components/financialyears/FiscalYearJournals";
import FinancialMonthsList from "@/components/financialmonths/FinancialMonthsList";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  CalendarRange,
  Calendar,
  Activity,
  Plus,
  BookOpen,
  ArrowRight,
  UserPlus,
  Settings2,
  BookPlus,
  ChevronDown,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import CreateJournal from "@/forms/journals/CreateJournal";
import CreatePartner from "@/forms/partners/CreatePartner";
import CreatePartnerType from "@/forms/partnertypes/CreatePartnerType";
import CreateJournalType from "@/forms/journaltypes/CreateJournalType";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function FiscalYearDetail() {
  const { reference } = useParams();
  const {
    isLoading,
    data: fiscalYear,
    refetch: refetchFiscalYear,
  } = useFetchFinancialYear(reference as string);
  const { data: journalTypes, isLoading: isLoadingTypes } =
    useFetchJournalTypes();
  const [openCreateJournal, setOpenCreateJournal] = useState(false);
  const [openPartner, setOpenPartner] = useState(false);
  const [openPartnerType, setOpenPartnerType] = useState(false);
  const [openJournalType, setOpenJournalType] = useState(false);

  const [menuView, setMenuView] = useState<'main' | 'journals'>('main');

  const [selectedJournalType, setSelectedJournalType] = useState<
    string | undefined
  >();
  const [activeTab, setActiveTab] = useState<'journals' | 'months'>('journals');
  const queryClient = useQueryClient();

  if (isLoading || isLoadingTypes) return <LoadingSpinner />;
  if (!fiscalYear)
    return (
      <div className="p-12 text-center font-semibold text-gray-300">
        Fiscal Year not found.
      </div>
    );

  const handleCreateJournal = (type?: string) => {
    setSelectedJournalType(type);
    setOpenCreateJournal(true);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <nav>
            <ol className="flex items-center gap-2 text-sm text-black/60">
              <li>
                <a href="/finance/dashboard" className="hover:text-black hover:underline">Dashboard</a>
              </li>
              <li><span className="text-black/30">/</span></li>
              <li>
                <a href="/finance/fiscal-years" className="hover:text-black hover:underline">Years</a>
              </li>
              <li><span className="text-black/30">/</span></li>
              <li>
                <span className="font-semibold text-black">{fiscalYear.code}</span>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#045138] flex items-center justify-center text-white shadow-md shadow-[#045138]/20">
              <CalendarRange className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-black tracking-tight leading-none">
                {fiscalYear.code}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-black/40">
                  {fiscalYear.estimated_profit}
                </span>
                {fiscalYear.is_active ? (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-semibold uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    <div className="w-1.5 h-1.5 rounded bg-gray-300" />
                    <span className="text-[9px] font-semibold uppercase tracking-widest">
                      Closed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        {fiscalYear.is_active && (
          <div className="flex items-center gap-2">
            <DropdownMenu.Root onOpenChange={(open) => { if (!open) setTimeout(() => setMenuView('main'), 200); }}>
              <DropdownMenu.Trigger asChild>
                <button
                  className="flex items-center justify-center h-9 px-4 bg-[#045138] hover:bg-black text-white rounded text-[10px] uppercase font-semibold tracking-wider transition-all shadow-md active:scale-95 gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New
                  <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="z-50 w-64 rounded p-2 bg-white shadow-xl border border-black/5 overflow-hidden animate-in fade-in zoom-in-95">
                  {menuView === 'main' && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="text-xs uppercase tracking-widest text-black/40 font-semibold px-2 py-1.5">
                        Transactions
                      </div>

                      <DropdownMenu.Item
                        onSelect={(e) => {
                          e.preventDefault();
                          setMenuView('journals');
                        }}
                        className="flex items-center outline-none rounded p-2 focus:bg-[#045138]/5 focus:text-[#045138] cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded bg-[#045138]/10 text-[#045138] flex items-center justify-center mr-3">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left flex-1">
                          <span className="font-semibold text-xs">Journal Batch</span>
                          <span className="text-[9px] text-black/50">Record new entry</span>
                        </div>
                        <ChevronDown className="w-3 h-3 opacity-50 ml-1 -rotate-90" />
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="my-1 bg-black/5 h-px" />

                      <div className="text-xs uppercase tracking-widest text-black/40 font-semibold px-2 py-1.5">
                        Entities & Configuration
                      </div>
                      <DropdownMenu.Item
                        onSelect={() => setOpenPartner(true)}
                        className="flex items-center outline-none rounded p-2 focus:bg-[#045138]/5 focus:text-[#045138] cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded bg-orange-50 text-orange-600 flex items-center justify-center mr-3">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">New Partner</span>
                          <span className="text-[9px] text-black/50">Register supplier/customer</span>
                        </div>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        onSelect={() => setOpenPartnerType(true)}
                        className="flex items-center outline-none rounded p-2 focus:bg-[#045138]/5 focus:text-[#045138] cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                          <Settings2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Partner Type</span>
                          <span className="text-[9px] text-black/50">Define partner category</span>
                        </div>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        onSelect={() => setOpenJournalType(true)}
                        className="flex items-center outline-none rounded p-2 focus:bg-[#045138]/5 focus:text-[#045138] cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center mr-3">
                          <BookPlus className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Journal Type</span>
                          <span className="text-[9px] text-black/50">Configure ledger types</span>
                        </div>
                      </DropdownMenu.Item>
                    </div>
                  )}

                  {menuView === 'journals' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="flex items-center gap-2 px-2 py-1.5 mb-2 border-b border-black/5 pb-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuView('main');
                          }}
                          className="p-1 hover:bg-black/5 rounded text-black/60 transition-colors cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                        <div className="text-[10px] uppercase tracking-widest text-black/40 font-semibold">
                          Select Journal Type
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <DropdownMenu.Item
                          onSelect={() => handleCreateJournal()}
                          className="outline-none rounded p-2 focus:bg-[#045138]/5 focus:text-[#045138] cursor-pointer"
                        >
                          <span className="font-semibold text-xs text-black/60">General (No Type)</span>
                        </DropdownMenu.Item>
                        {journalTypes?.map((type) => (
                          <DropdownMenu.Item
                            key={type.reference}
                            onSelect={() => handleCreateJournal(type.name)}
                            className="outline-none rounded p-2 focus:bg-[#045138]/5 focus:text-[#045138] cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-semibold text-xs">{type.name}</span>
                          </DropdownMenu.Item>
                        ))}
                      </div>
                    </div>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Centered Modals for ALL Create Actions */}
            {openPartnerType && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                  <CreatePartnerType
                    onSuccess={() => setOpenPartnerType(false)}
                    rolePrefix="finance"
                  />
                  <button onClick={() => setOpenPartnerType(false)} className="mt-4 text-sm underline text-center w-full block">Cancel</button>
                </div>
              </div>
            )}

            {openPartner && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95">
                  <CreatePartner
                    onSuccess={() => setOpenPartner(false)}
                    rolePrefix="finance"
                  />
                  <button onClick={() => setOpenPartner(false)} className="mt-4 text-sm underline text-center w-full block">Cancel</button>
                </div>
              </div>
            )}

            {openJournalType && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                  <CreateJournalType
                    onSuccess={() => setOpenJournalType(false)}
                    rolePrefix="finance"
                  />
                  <button onClick={() => setOpenJournalType(false)} className="mt-4 text-sm underline text-center w-full block">Cancel</button>
                </div>
              </div>
            )}

            {openCreateJournal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95">
                  <CreateJournal
                    refetch={refetchFiscalYear}
                    fiscalYear={fiscalYear?.code}
                    initialJournalType={selectedJournalType}
                    rolePrefix="finance"
                    onSuccess={() => setOpenCreateJournal(false)}
                  />
                  <button onClick={() => setOpenCreateJournal(false)} className="mt-4 text-sm underline text-center w-full block">Cancel</button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Calendar,
            label: "Start Date",
            value: new Date(fiscalYear.start_date).toLocaleDateString(),
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: Calendar,
            label: "End Date",
            value: new Date(fiscalYear.end_date).toLocaleDateString(),
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            icon: Activity,
            label: "Total Entries",
            value: `${fiscalYear.journals?.length || 0}`,
            color: "text-[#045138]",
            bg: "bg-green-50",
          },
          {
            icon: BookOpen,
            label: "J. Types",
            value: `${journalTypes?.length || 0}`,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white px-4 py-3 rounded border border-gray-100 shadow-sm flex items-center gap-3"
          >
            <div
              className={`w-8 h-8 rounded ${stat.bg} ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-black/40">
                {stat.label}
              </p>
              <p className="text-sm font-semibold text-black tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="space-y-6 pt-2">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100">
           <button
             onClick={() => setActiveTab('journals')}
             className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 ${activeTab === 'journals' ? 'border-[#045138] text-[#045138]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Journals
           </button>
           <button
             onClick={() => setActiveTab('months')}
             className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 ${activeTab === 'months' ? 'border-[#045138] text-[#045138]' : 'border-transparent text-black/30 hover:text-black'}`}
           >
             Months
           </button>
        </div>

        {activeTab === 'journals' ? (
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-black tracking-tight">
                Associated Journals
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <FiscalYearJournals
              journals={fiscalYear.journals || []}
              rolePrefix="finance"
              fiscalYearReference={reference as string}
            />
          </div>
        ) : (
          <div className="space-y-4 w-full animate-in fade-in duration-300">
             <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-black tracking-tight">
                Financial Periods
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            
            <FinancialMonthsList
              months={fiscalYear.months || []}
              rolePrefix="finance"
              fiscalYearReference={reference as string}
            />
          </div>
        )}
      </div>
    </div>
  );
}
