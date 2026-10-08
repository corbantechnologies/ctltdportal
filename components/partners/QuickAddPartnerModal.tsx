"use client";

import { useState, useEffect, useMemo } from "react";
import { X, UserPlus, Building, Phone, Mail, FileText, Loader2, Sparkles, Zap } from "lucide-react";
import { useCreatePartner } from "@/hooks/partners/actions";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { toast } from "react-hot-toast";

interface QuickAddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnerCreated: (partner: any) => void;
  defaultType?: string;
}

export default function QuickAddPartnerModal({
  isOpen,
  onClose,
  onPartnerCreated,
  defaultType = "",
}: QuickAddPartnerModalProps) {
  const createMutation = useCreatePartner();
  const { data: partnerTypes } = useFetchPartnerTypes();
  const { data: divisions } = useFetchDivisions();

  const [name, setName] = useState("");
  const [taxPin, setTaxPin] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [partnerType, setPartnerType] = useState(defaultType || "Customer");
  const [division, setDivision] = useState("");

  useEffect(() => {
    if (defaultType) {
      setPartnerType(defaultType);
    }
  }, [defaultType, isOpen]);

  const typeOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (partnerTypes && partnerTypes.length > 0) {
      partnerTypes.forEach((pt) => {
        list.push({ value: pt.name, label: pt.name });
      });
    }
    ["Customer", "Supplier", "Walk-in"].forEach((def) => {
      if (!list.some((item) => item.value.toLowerCase() === def.toLowerCase())) {
        list.push({ value: def, label: def === "Walk-in" ? "Walk-in Customer" : def });
      }
    });
    return list;
  }, [partnerTypes]);

  if (!isOpen) return null;

  const handleQuickFillWalkin = () => {
    setName("Walk-in Cash Customer");
    setPartnerType("Walk-in");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Partner/Supplier/Client name is required");
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        tax_pin: taxPin.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };

      if (partnerType && partnerType.trim()) {
        payload.partner_type = partnerType.trim();
      }
      if (division && division.trim()) {
        payload.division = division.trim();
      } else if (divisions && divisions.length > 0) {
        payload.division = divisions[0].name;
      }

      const created = await createMutation.mutateAsync(payload);
      toast.success(`Partner "${created.name}" created and selected!`);
      onPartnerCreated(created);
      onClose();
      // Reset form
      setName("");
      setTaxPin("");
      setPhone("");
      setEmail("");
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.partner_type?.[0] ||
        err?.response?.data?.tax_pin?.[0] ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to create partner";
      toast.error(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Quick Add Partner / Walk-in
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Instant
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Register supplier, client, or walk-in details on the fly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Partner / Entity Name <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleQuickFillWalkin}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Fill as Walk-in Customer</span>
              </button>
            </div>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Acme Supplies Ltd, John Doe (Walk-in)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tax PIN <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. P051234567Z"
                  value={taxPin}
                  onChange={(e) => setTaxPin(e.target.value.toUpperCase())}
                  className="w-full h-10 pl-10 pr-3.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-sm font-mono uppercase outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone / Mobile <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. +254 712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="e.g. accounts@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Partner Type
              </label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium outline-none transition-all"
              >
                {typeOptions.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {divisions && divisions.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Division
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium outline-none transition-all"
              >
                <option value="">Default (Auto-assign)</option>
                {divisions.map((d) => (
                  <option key={d.reference} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save &amp; Select</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
