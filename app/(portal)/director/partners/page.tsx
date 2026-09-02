"use client";

import PartnersList from "@/components/partners/PartnersList";
import { Users } from "lucide-react";

export default function PartnersPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#D0402B] flex items-center justify-center text-white shadow-md shadow-[#D0402B]/20">
              <Users className="w-3 h-3" />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D0402B]">
              Administrative Interface
            </p>
          </div>
          <h1 className="text-xl font-semibold text-black tracking-tighter italic">
            Corporate <span className="text-[#D0402B]">Partners</span>
          </h1>
          <p className="text-black/40 font-semibold mt-0.5 text-xs max-w-md">
            Manage relationships, oversee partner financial status, and track
            historical transaction data.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-black/5">
        <PartnersList rolePrefix="director" />
      </div>
    </div>
  );
}
