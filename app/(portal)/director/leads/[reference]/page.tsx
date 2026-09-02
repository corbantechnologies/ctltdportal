"use client";

import { useFetchLead } from "@/hooks/leads/actions";
import { Lead } from "@/services/leads";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import UpdateLead from "@/forms/leads/UpdateLead";
import ConvertLeadModal from "@/forms/leads/ConvertLeadModal";
import InteractionTimeline from "@/components/crm/InteractionTimeline";
import CreateQuotationModal from "@/forms/quotations/CreateQuotationModal";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Globe,
  Tag,
  Calendar,
  ArrowLeft,
  Activity,
  Edit,
  ClipboardList,
  Fingerprint,
  UserCheck,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DirectorLeadDetailPage() {
  const { reference } = useParams();
  const router = useRouter();
  const { data, isLoading } = useFetchLead(reference as string);
  const lead = data as Lead | undefined;

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
    <div className="space-y-10 pb-20 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
          <li>
            <Link href="/director/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
          </li>
          <li><span className="opacity-30">/</span></li>
          <li>
            <Link href="/director/leads" className="hover:text-black transition-colors">Leads</Link>
          </li>
          <li><span className="opacity-30">/</span></li>
          <li>
            <span className="text-black">{lead.first_name} {lead.last_name}</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-2xl shadow-[#D0402B]/30 transition-transform hover:scale-105 active:scale-95">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D0402B]">
                  Executive Pipeline Case
                </p>
                <span className={cn("px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border shadow-sm", statusColors[lead.status] || "bg-slate-50 text-slate-600 border-slate-200")}>
                  {lead.status}
                </span>
              </div>
              <h1 className="text-4xl font-semibold text-black tracking-tight italic">
                {lead.first_name} <span className="text-[#D0402B] font-bold">{lead.last_name}</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lead.status !== "WON" && (
            <CreateQuotationModal 
              rolePrefix="director"
              initialLead={{ reference: lead.reference, name: `${lead.first_name} ${lead.last_name}` }}
              trigger={
                <button className="flex items-center gap-3 px-8 py-4 bg-black hover:bg-slate-800 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] group">
                   <ClipboardList className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                   Generate Quotation
                </button>
              }
            />
          )}

          {lead.status === "QUALIFIED" && (
            <ConvertLeadModal
              leadReference={lead.reference}
              leadName={`${lead.first_name} ${lead.last_name}`}
              rolePrefix="director"
              trigger={
                <button className="flex items-center gap-3 px-8 py-4 bg-[#D0402B] hover:bg-black text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-[#D0402B]/20 active:scale-[0.98] group">
                  <UserCheck className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  Convert to Partner
                </button>
              }
            />
          )}

          {lead.status === "WON" && lead.partner_reference && (
            <Link
              href={`/director/partners/${lead.partner_reference}`}
              className="flex items-center gap-3 px-8 py-4 bg-black hover:bg-slate-800 text-white rounded font-bold text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] group"
            >
              <ExternalLink className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              View Partner Profile
            </Link>
          )}

          <UpdateLead
            lead={lead}
            trigger={
              <button className="flex items-center gap-3 px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 border border-slate-200 rounded font-semibold text-sm tracking-tight transition-all shadow-sm active:scale-[0.98] group">
                <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Modify Identity
              </button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded border border-black/5 shadow-xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#D0402B]/5 rounded blur-3xl opacity-50 group-hover:bg-[#D0402B]/10 transition-colors" />
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3 text-[#D0402B]">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Metadata Verify</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="pb-6 border-b border-black/5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">External Reference</p>
                        <p className="text-xl font-semibold text-black tracking-tighter tabular-nums">{lead.reference}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">Division</p>
                            <p className="text-sm font-bold text-black">{lead.division || "Standard"}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">Origin</p>
                            <p className="text-sm font-bold text-black">{new Date(lead.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded border border-black/5 shadow-xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-black/5 rounded blur-3xl opacity-50 group-hover:bg-black/10 transition-colors" />
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3 text-black">
                    <Building2 className="w-5 h-5" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Corporate Record</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="pb-6 border-b border-black/5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">Legal Entity</p>
                        <p className="text-lg font-bold text-black tracking-tight">{lead.company_name || "Self-Represented"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">Region</p>
                            <p className="text-sm font-bold text-black">{lead.country || "KE"}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">TAX PIN</p>
                            <p className="text-sm font-bold text-black tabular-nums">{lead.tax_pin || "—"}</p>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Interaction Timeline Integration */}
          <div className="bg-white p-10 rounded border border-black/5 shadow-2xl shadow-black/5">
                <InteractionTimeline 
                    leadId={lead.id} 
                    rolePrefix="director" 
                />
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-black p-10 rounded text-white shadow-2xl shadow-[#D0402B]/10 relative overflow-hidden group">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#D0402B]/30 rounded blur-[60px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center gap-3 text-[#D0402B]">
                    <Activity className="w-5 h-5" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Contact Hub</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 rounded bg-white/5 border border-white/5 hover:bg-[#D0402B]/10 transition-all group/card">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-white/40 group-hover/card:text-white group-hover/card:bg-[#D0402B] transition-all">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Secure Mail</p>
                                <p className="text-sm font-semibold truncate">{lead.email || "No email active"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/card">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-white/40 group-hover/card:text-white group-hover/card:bg-slate-700 transition-all">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Direct Line</p>
                                <p className="text-sm font-semibold">{lead.phone || "No phone active"}</p>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-100/50 p-10 rounded border border-black/5 text-black">
              <div className="flex items-center gap-3 mb-8">
                  <ClipboardList className="w-5 h-5 text-black/30" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Pipeline Log</h3>
              </div>
              <div className="space-y-8">
                  <div className="flex gap-5">
                      <div className="w-2 h-2 rounded bg-[#D0402B] mt-2 ring-8 ring-[#D0402B]/5" />
                      <div>
                          <p className="text-xs font-bold text-black tracking-tight">Lead Ingestion</p>
                          <p className="text-[10px] font-semibold text-black/40">{new Date(lead.created_at).toDateString()}</p>
                      </div>
                  </div>
                  <div className="flex gap-5">
                      <div className="w-2 h-2 rounded bg-black mt-2 ring-8 ring-black/5" />
                      <div>
                          <p className="text-xs font-bold text-black tracking-tight">Latest Profile Sync</p>
                          <p className="text-[10px] font-semibold text-black/40">{new Date(lead.updated_at).toDateString()}</p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
