"use client";

import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { useFetchPartner } from "@/hooks/partners/actions";
import { useParams } from "next/navigation";
import {
  UserCircle,
  History,
  Mail,
  Phone,
  ArrowUpRight,
  Receipt,
  ShieldCheck,
  Building,
  ArrowLeft,
  Calendar,
  Hash,
  Building2,
  Plus,
  ClipboardList,
} from "lucide-react";
import CreateQuotationModal from "@/forms/quotations/CreateQuotationModal";
import CreateInvoiceModal from "@/forms/financials/CreateInvoiceModal";
import InteractionTimeline from "@/components/crm/InteractionTimeline";


export default function PartnerDetailPage() {
  const { reference } = useParams<{ reference: string }>();

  const { isLoading: isLoadingPartner, data: partner } =
    useFetchPartner(reference);

  if (isLoadingPartner) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 pb-12">
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/director/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href="/director/partners" className="hover:text-black hover:underline">Partners</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <span className="font-semibold text-black">{partner?.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-lg shadow-[#D0402B]/20">
              <UserCircle className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D0402B]">
              Partner Insights
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter">
            {partner?.name}
          </h1>
          <p className="text-black/40 font-semibold mt-1 text-sm">
            Engagement profile and financial records for {partner?.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {partner && (
            <>
              <CreateQuotationModal 
                rolePrefix="director"
                initialPartner={{ code: partner.code, name: partner.name }}
                trigger={
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-[#D0402B] text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 group">
                     <ClipboardList className="w-4 h-4 group-hover:scale-110 transition-transform" />
                     New Quotation
                  </button>
                }
              />
              <CreateInvoiceModal 
                rolePrefix="director"
                initialPartner={{ reference: partner.code, name: partner.name }}
                trigger={
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-[#D0402B] hover:bg-black text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#D0402B]/10 active:scale-95 group">
                     <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                     Initiate Invoice
                  </button>
                }
              />
            </>
          )}
          {partner?.is_active ? (
            <span className="bg-green-500/10 text-green-600 border-none font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded">
              Active Partnership
            </span>
          ) : (
            <span className="bg-black/5 text-black/40 border-none font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded">
              Suspended
            </span>
          )}
        </div>
      </div>

      {/* Meta Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Relationship
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {partner?.created_at
                    ? new Date(partner.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Tax PIN
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {partner?.tax_pin || "Not Set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Type
                </p>
                <p className="text-base font-semibold text-black tracking-tight">
                  {partner?.partner_type}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                  Contact
                </p>
                <p className="text-base font-semibold text-black tracking-tight truncate max-w-[120px]">
                  {partner?.phone || "No Phone"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline Integration */}
      <div className="bg-white p-10 rounded border border-black/5 shadow-2xl shadow-black/5">
        <InteractionTimeline
          partnerId={partner?.reference || ""}
          rolePrefix="director"
        />
      </div>

      {/* Transaction History (Journal Entries) */}
      <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-xl shadow-black/5 pb-24">
        <div className="p-8 border-b border-black/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#D0402B]/10 flex items-center justify-center text-[#D0402B]">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-black tracking-tight">
              Transaction Ledger
            </h3>
          </div>
          <span className="bg-black/5 text-black border-none font-semibold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded inline-block">
            {partner?.journal_entries?.length || 0} Records
          </span>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 bg-black/5">
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Post Date
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Reference
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Batch
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Debit
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60">
                    Credit
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {partner?.journal_entries &&
                  partner.journal_entries.length > 0 ? (
                  partner.journal_entries.map((entry) => (
                    <tr
                      key={entry.reference}
                      className="hover:bg-orange-50/20 transition-colors group"
                    >
                      <td className="py-2.5 px-4 border-b border-black/5">
                        <p className="text-sm font-medium text-black">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] font-semibold text-black/30 uppercase mt-0.5">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5 text-[#D0402B]" />
                          <p className="text-sm font-medium text-black">
                            {entry.reference}
                          </p>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5">
                        <span className="bg-black/5 text-black hover:bg-black hover:text-white transition-all border-none font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-none inline-block">
                          {entry.journal}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5 text-right">
                        <p className="text-sm font-medium text-green-600">
                          {entry.currency}{" "}
                          {parseFloat(entry.debit).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5 text-right">
                        <p className="text-sm font-medium text-[#D0402B]">
                          {entry.currency}{" "}
                          {parseFloat(entry.credit).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 border-b border-black/5">
                        <div className="flex justify-center">
                          <button className="w-7 h-7 rounded bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#D0402B]">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/20 mb-3">
                          <History className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-semibold text-black/30 uppercase tracking-widest">
                          No financial records recorded
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
