"use client"

import { useFetchLead } from "@/hooks/leads/actions";
import { Lead } from "@/services/leads";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import UpdateLead from "@/forms/leads/UpdateLead";
import ConvertLeadModal from "@/forms/leads/ConvertLeadModal";
import InteractionTimeline from "@/components/crm/InteractionTimeline";
import CreateQuotationModal from "@/forms/quotations/CreateQuotationModal";
import CreateLeadQuotation from "@/forms/quotations/CreateLeadQuotation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Globe,
  Tag,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Activity,
  Edit,
  ClipboardList,
  Fingerprint,
  UserCheck,
  ExternalLink,
  ChevronDown,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import Link from "next/link";

export default function LeadDetailPage() {
  const { reference } = useParams();
  const router = useRouter();
  const { data, isLoading } = useFetchLead(reference as string);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const lead = data as Lead | undefined;

  console.log(lead);

  if (isLoading) return <LoadingSpinner />;
  if (!lead) return <div>Lead not found.</div>;

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700 border-blue-100",
    CONTACTED: "bg-amber-50 text-amber-700 border-amber-100",
    QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PROPOSAL_SENT: "bg-purple-50 text-purple-700 border-purple-100",
    WON: "bg-green-50 text-green-700 border-green-100",
    LOST: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Dynamic Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2 w-full">
          <Link
            href="/operations/leads"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Pipeline
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[10px] font-bold uppercase text-blue-600">
                  Lead Profile Case
                </p>
                <span className={cn("px-3 py-0.5 rounded text-[9px] font-bold uppercase border shadow-sm", statusColors[lead.status] || "bg-slate-50 text-slate-600 border-slate-200")}>
                  {lead.status}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
                {lead.first_name} <span className="text-blue-600">{lead.last_name}</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="h-11 px-6 bg-slate-900 text-white rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95 group border-2 border-transparent">
                <Settings className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                Actions
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={12} className="z-[100] w-64 p-2 bg-white rounded shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                 <div className="px-3 py-2 mb-1 border-b border-slate-50">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Available Operations</p>
                 </div>

                 <CreateLeadQuotation
                    rolePrefix="operations"
                    leadReference={lead.reference}
                    leadName={`${lead.first_name} ${lead.last_name}`}
                    trigger={
                      <DropdownMenu.Item onSelect={(e) => e.preventDefault()} className="flex items-center gap-3 p-3 rounded text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer outline-none transition-colors group">
                        <ClipboardList className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        New Quotation
                      </DropdownMenu.Item>
                    }
                  />

                  <DropdownMenu.Item 
                    onSelect={() => setIsUpdateModalOpen(true)} 
                    className="flex items-center gap-3 p-3 rounded text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-amber-600 hover:bg-amber-50 cursor-pointer outline-none transition-colors group"
                  >
                    <Edit className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    Modify Identity
                  </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Bio & Timeline */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white p-10 rounded border border-slate-100 shadow-2xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:bg-blue-100 transition-colors" />

            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Structural Metadata</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Reference ID</p>
                  <p className="text-base font-semibold text-slate-900 tabular-nums">{lead.reference}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Division Assignment</p>
                  <p className="text-base font-semibold text-slate-900">{lead.division || "Unassigned"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Engagement Status</p>
                  <p className="text-base font-semibold text-slate-900">{lead.status}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Origin Timestamp</p>
                  <p className="text-base font-semibold text-slate-900">{new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded border border-slate-100 shadow-2xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:bg-amber-100 transition-colors" />

            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Corporate Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Legal Entity Name</p>
                  <p className="text-base font-semibold text-slate-900 underline decoration-amber-200 underline-offset-4">{lead.company_name || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Primary Country</p>
                  <p className="text-base font-semibold text-slate-900">{lead.country || "Global"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tax Identification (PIN)</p>
                  <p className="text-base font-semibold text-slate-900 tracking-widest">{lead.tax_pin || "Not Disclosed"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Quotations Section */}
          <div className="bg-white border border-slate-100 rounded overflow-hidden shadow-2xl shadow-slate-100/50">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Recent Proposals</h3>
              </div>
              <span className="px-3 py-1 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {lead.quotations?.length || 0} Records
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-50">
                    <th className="py-4 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</th>
                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="py-4 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lead.quotations && lead.quotations.length > 0 ? (
                    lead.quotations.map((q) => (
                      <tr 
                        key={q.reference} 
                        onClick={() => router.push(`/operations/leads/${lead.reference}/${q.reference}`)}
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="py-5 px-8">
                          <p className="text-sm font-bold text-slate-900 tracking-tight">{q.code}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">{q.reference.slice(0, 8)}...</p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-sm font-medium text-slate-600">{new Date(q.date).toLocaleDateString()}</p>
                        </td>
                        <td className="py-5 px-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                            q.status === "DRAFT" ? "bg-slate-50 text-slate-600 border-slate-100" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                          >
                            Build
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 px-8 text-center">
                        <p className="text-xs font-medium text-slate-400 italic">No Quotations Initialized</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline Integration */}
          <div className="bg-white p-10 rounded border border-slate-100 shadow-2xl shadow-slate-100/50">
            <InteractionTimeline
              leadId={lead.id}
              rolePrefix="operations"
            />
          </div>
        </div>

        {/* Right Column: Communications Hub */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Connectivity</h3>
              </div>

              <div className="space-y-8">
                <div className="p-5 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Email Protocol</p>
                      <p className="text-sm font-semibold truncate max-w-[150px]">{lead.email || "No email linked"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Voice Channel</p>
                      <p className="text-sm font-semibold">{lead.phone || "No phone linked"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pipeline Timeline</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded bg-blue-600 mt-1.5 ring-4 ring-blue-50" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Lead Established</p>
                  <p className="text-[10px] font-semibold text-slate-400">{new Date(lead.created_at).toDateString()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded bg-slate-300 mt-1.5 ring-4 ring-slate-100" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Last Synced</p>
                  <p className="text-[10px] font-semibold text-slate-400">{new Date(lead.updated_at).toDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateLead 
        lead={lead} 
        isOpen={isUpdateModalOpen} 
        onOpenChange={setIsUpdateModalOpen} 
      />
    </div>
  );
}
