"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  secondaryLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  label,
  disabled,
  required,
  error,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.secondaryLabel && opt.secondaryLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={cn("space-y-2 relative", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 flex items-center gap-1">
          {label} {required && <span className="text-red-500 text-xs font-semibold">*</span>}
        </label>
      )}

      <div
        className={cn(
          "h-14 w-full rounded border bg-slate-50 px-4 flex items-center justify-between cursor-pointer transition-all",
          isOpen ? "border-emerald-600 ring-4 ring-emerald-600/10 shadow-sm" : "border-slate-200 hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-col truncate">
          {selectedOption ? (
            <>
              <span className="text-sm font-semibold text-black truncate">
                {selectedOption.label}
              </span>
              {selectedOption.secondaryLabel && (
                <span className="text-[9px] font-mono text-black/40 uppercase truncate">
                  {selectedOption.secondaryLabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-black/40">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-black/20 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
              <input
                autoFocus
                type="text"
                className="w-full bg-white border border-slate-200 rounded pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-[40vh] overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-colors group",
                    value === opt.value ? "bg-emerald-50" : "hover:bg-slate-50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-sm font-semibold transition-colors",
                      value === opt.value ? "text-emerald-700" : "text-black"
                    )}>
                      {opt.label}
                    </span>
                    {opt.secondaryLabel && (
                      <span className="text-[10px] font-mono text-black/40 uppercase">
                        {opt.secondaryLabel}
                      </span>
                    )}
                  </div>
                  {value === opt.value && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-black/40 font-medium italic">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
}
