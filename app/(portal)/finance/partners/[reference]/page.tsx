"use client";

import { useFetchPartner } from "@/hooks/partners/actions";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import UpdatePartner from "@/forms/partners/UpdatePartner";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import {
  ArrowLeft,
  Building2,
  Edit2,
  Calendar,
  CreditCard,
  Hash,
  History,
  Mail,
  MoreHorizontal,
  Phone,
  UserCog,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function PartnerDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { isLoading, data: partner } = useFetchPartner(reference as string);

  if (isLoading) return <LoadingSpinner />;
  if (!partner)
    return (
      <div className="p-12 text-center font-semibold text-black/20">
        Partner not found.
      </div>
    );

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/finance/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <a href="/finance/partners" className="hover:text-black hover:underline">Partners Hub</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <span className="font-semibold text-black">{partner.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded border border-black/5 bg-white shadow-sm hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span
              className={`px-4 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest border-none ${partner.is_active
                ? "bg-green-500/10 text-green-600 shadow-sm shadow-green-500/10"
                : "bg-red-500/10 text-red-600 shadow-sm shadow-red-500/10"
                }`}
            >
              {partner.is_active ? "Active Partner" : "Inactive Partner"}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-black tracking-tighter mb-2">
              {partner.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm font-semibold ">
              <span className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded border border-black/5">
                <Building2 className="w-4 h-4" /> {partner.partner_type}
              </span>
              {(partner.division || "Global") && (
                <span className="bg-[#045138]/10 text-[#045138] px-3 py-1 rounded uppercase tracking-wider text-[10px]">
                  {partner.division || "Global Division"}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center justify-center gap-2 h-12 px-4 bg-white hover:bg-black/5 text-black border border-black/5 rounded font-semibold text-xs uppercase tracking-widest shadow-sm transition-colors">
              <Edit2 className="w-4 h-4" />
              Manage
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-white border border-black/5 shadow-xl rounded p-1 w-48 z-50">
            <DropdownMenu.Item 
              onSelect={() => setIsUpdateModalOpen(true)}
              className="flex items-center gap-3 p-3 rounded text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer outline-none transition-colors group border-t border-slate-50 mt-1"
            >
              <UserCog className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              Modify Profile
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      {/* Info Grid */}
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

      {/* Transaction History (Journal Entries) */}
      <div className="border border-black/5 bg-white/60 backdrop-blur-xl rounded overflow-hidden shadow-xl shadow-black/5 pb-24">
        <div className="p-8 border-b border-black/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center text-orange-600">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-black tracking-tight">
              Transaction Ledger
            </h3>
          </div>
          <span className="bg-black/5 px-3 py-1 rounded text-xs font-semibold text-black/60">
            {partner.journal_entries?.length || 0} Records
          </span>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/5 border-b border-black/5 text-left">
                  <th className="py-2 px-4">
                    <span className="bg-black/5 text-black border-none font-semibold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded inline-block">
                      Book & Date
                    </span>
                  </th>
                  <th className="py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60 text-right">
                    Debit
                  </th>
                  <th className="py-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-black/60 text-right">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium text-sm">
                {partner.journal_entries?.map((entry) => (
                  <tr
                    key={entry.reference}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <div className="font-semibold text-black">{entry.book}</div>
                      <div className="text-[10px] uppercase text-black/40 tracking-wider">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5 text-right font-mono text-black/80">
                      {parseFloat(entry.debit) > 0
                        ? new Intl.NumberFormat("en-KE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                        }).format(parseFloat(entry.debit))
                        : "—"}
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5 text-right font-mono text-black/80">
                      {parseFloat(entry.credit) > 0
                        ? new Intl.NumberFormat("en-KE", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                        }).format(parseFloat(entry.credit))
                        : "—"}
                    </td>
                  </tr>
                ))}
                {(!partner.journal_entries ||
                  partner.journal_entries.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UpdatePartner 
        partner={partner} 
        rolePrefix="finance" 
        isOpen={isUpdateModalOpen} 
        onOpenChange={setIsUpdateModalOpen} 
      />
    </div>
  );
}
