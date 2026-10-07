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
    <div className={cn("space-y-1 relative", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-0.5 flex items-center gap-1">
          {label} {required && <span className="text-red-500 text-xs font-semibold">*</span>}
        </label>
      )}

      <div
        className={cn(
          "min-h-[32px] h-8 w-full rounded border bg-white px-2.5 py-1 flex items-center justify-between cursor-pointer transition-all",
          isOpen ? "border-slate-900 ring-1 ring-slate-900 shadow-xs" : "border-slate-300 hover:border-slate-400",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50",
          error && "border-red-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5 truncate pr-2">
          {selectedOption ? (
            <>
              <span className="text-xs font-medium text-slate-900 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.secondaryLabel && (
                <span className="text-[9px] font-mono text-slate-400 uppercase truncate">
                  ({selectedOption.secondaryLabel})
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 flex flex-col">
          <div className="p-1.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded pl-7 pr-6 py-1 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                    "flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors group",
                    value === opt.value ? "bg-slate-100" : "hover:bg-slate-50"
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
                      "text-xs font-medium transition-colors",
                      value === opt.value ? "text-slate-900 font-semibold" : "text-slate-700"
                    )}>
                      {opt.label}
                    </span>
                    {opt.secondaryLabel && (
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {opt.secondaryLabel}
                      </span>
                    )}
                  </div>
                  {value === opt.value && <Check className="w-3.5 h-3.5 text-slate-800" />}
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-400 font-medium italic">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
}
