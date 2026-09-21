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
          "min-h-[40px] w-full rounded-lg border bg-slate-50/70 px-3 py-2 flex items-center justify-between cursor-pointer transition-all",
          isOpen ? "border-emerald-600 ring-2 ring-emerald-600/10 shadow-sm bg-white" : "border-slate-200 hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-col truncate pr-2">
          {selectedOption ? (
            <>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.secondaryLabel && (
                <span className="text-[9px] font-mono text-slate-400 uppercase truncate">
                  {selectedOption.secondaryLabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs sm:text-sm text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-64 flex flex-col">
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-48 divide-y divide-slate-50">
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
