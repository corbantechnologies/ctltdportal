"use client";

import PartnersList from "@/components/partners/PartnersList";
import CreatePartner from "@/forms/partners/CreatePartner";
import { Database, Plus } from "lucide-react";

export default function PartnersPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/20">
              <Database className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              External Ecosystem
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter italic">
            Network <span className="text-[#2563EB]">Partners</span>
          </h1>
          <p className="text-black/40 font-semibold mt-0.5 text-xs max-w-md">
            Oversee ecosystem relationships, maintain partner performance data, and coordinate operational collaborations.
          </p>
        </div>

        <CreatePartner
          rolePrefix="operations"
          trigger={
            <button className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded text-[10px] font-semibold uppercase tracking-widest shadow-lg shadow-[#2563EB]/20 hover:bg-[#1d4ed8] transition-all active:scale-[0.98]">
              <Plus className="w-3.5 h-3.5" />
              Register Partner
            </button>
          }
        />
      </div>

      <div className="pt-4 border-t border-black/5">
        <PartnersList rolePrefix="operations" />
      </div>
    </div>
  );
}
