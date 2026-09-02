"use client";

import { useState } from "react";
import PartnersList from "@/components/partners/PartnersList";
import CreatePartner from "@/forms/partners/CreatePartner";
import { Plus } from "lucide-react";

export default function FinancePartnersPage() {
  const [openCreatePartner, setOpenCreatePartner] = useState(false);

  return (
    <div className="space-y-6 pb-6">
      {/* Breadcrumbs */}
      <nav>
        <ol className="flex items-center gap-2 text-sm text-black/60">
          <li>
            <a href="/finance/dashboard" className="hover:text-black hover:underline">Dashboard</a>
          </li>
          <li><span className="text-black/30">/</span></li>
          <li>
            <span className="font-semibold text-black">Partners Hub</span>
          </li>
        </ol>
      </nav>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black tracking-tighter">
            Operational Partners
          </h1>
          <p className="text-black/60 font-semibold text-xs mt-0.5">
            Manage vendors, clients, and internal entities
          </p>
        </div>
        <button
          onClick={() => setOpenCreatePartner(true)}
          className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#045138] hover:bg-black text-white rounded font-semibold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Partner
        </button>
      </div>
      <PartnersList rolePrefix="finance" />
      {openCreatePartner && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-200">
          <CreatePartner
            rolePrefix="finance"
            onSuccess={() => setOpenCreatePartner(false)}
            onClose={() => setOpenCreatePartner(false)}
            className="min-h-screen border-none shadow-none rounded"
          />
        </div>
      )}
    </div>
  );
}
