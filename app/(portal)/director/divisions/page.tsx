"use client";

import DivisionsList from "@/components/divisions/DivisionsList";
import CreateDivisionModal from "@/forms/divisions/CreateDivisionModal";
import { Database, TrendingUp } from "lucide-react";

export default function DivisionsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-corporate-primary flex items-center justify-center text-white shadow-lg shadow-corporate-primary/20">
              <Database className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-corporate-primary">
              Management Layer
            </p>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight italic">
            Corporate <span className="text-corporate-primary">Divisions</span>
          </h1>
          <p className="text-slate-400 font-semibold mt-2 text-sm max-w-lg">
            Organize business units, define operational boundaries, and manage institutional protocols.
          </p>
        </div>
        <CreateDivisionModal />
      </div>

      <div className="pt-8 border-t border-slate-100">
        <DivisionsList rolePrefix="director" />
      </div>
    </div>
  );
}
