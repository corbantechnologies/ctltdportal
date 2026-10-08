"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { FinancialYear } from "@/services/financialyears";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

interface FiscalYearContextType {
  years: FinancialYear[];
  selectedYear: FinancialYear | null;
  selectedYearCode: string;
  isCurrentOperatingYear: boolean;
  isLoading: boolean;
  switchFiscalYear: (yearCodeOrRef: string) => void;
  refreshYears: () => Promise<void>;
  openYearSelectorModal: () => void;
  closeYearSelectorModal: () => void;
  isYearSelectorModalOpen: boolean;
}

const FiscalYearContext = createContext<FiscalYearContextType | undefined>(
  undefined
);

const STORAGE_KEY = "ct_selected_fiscal_year_code";
const SESSION_PROMPT_KEY = "ct_fiscal_year_confirmed_session";

export function FiscalYearProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: rawYears, isLoading } = useFetchFinancialYears();

  const years: FinancialYear[] = useMemo(() => {
    if (!rawYears || !Array.isArray(rawYears)) return [];
    return [...rawYears].sort((a, b) => {
      // 1. Current operating year always first
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      // 2. Active open years before closed years
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      // 3. Most recent start_date first
      return b.start_date.localeCompare(a.start_date);
    });
  }, [rawYears]);

  const [selectedYearCode, setSelectedYearCode] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Identify default year (prefer is_current === true, then first active, then first available)
  const defaultYear = useMemo(() => {
    if (!years || years.length === 0) return null;
    return (
      years.find((y) => y.is_current === true) ||
      years.find((y) => y.is_active === true) ||
      years[0]
    );
  }, [years]);

  // Sync selected year from localStorage or default
  useEffect(() => {
    if (!years || years.length === 0) return;

    const storedCode = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const matched = storedCode ? years.find((y) => y.code === storedCode) : null;

    if (matched) {
      setSelectedYearCode(matched.code);
    } else if (defaultYear) {
      setSelectedYearCode(defaultYear.code);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, defaultYear.code);
      }
    }
  }, [years, defaultYear]);

  // Prompt Finance or Director on first login/session if not yet confirmed
  useEffect(() => {
    if (!session?.user || !years || years.length === 0) return;
    const isDirectorOrFinance =
      Boolean((session.user as any)?.is_director) ||
      Boolean((session.user as any)?.is_finance) ||
      Boolean((session.user as any)?.is_superuser);

    if (isDirectorOrFinance && typeof window !== "undefined") {
      const alreadyPrompted = sessionStorage.getItem(SESSION_PROMPT_KEY);
      if (!alreadyPrompted && years.length > 1) {
        setIsModalOpen(true);
      }
    }
  }, [session, years]);

  const selectedYear = useMemo(() => {
    if (!years || years.length === 0) return null;
    return years.find((y) => y.code === selectedYearCode) || defaultYear || null;
  }, [years, selectedYearCode, defaultYear]);

  const isCurrentOperatingYear = Boolean(selectedYear?.is_current);

  const switchFiscalYear = useCallback(
    (yearCodeOrRef: string) => {
      const target = years.find(
        (y) => y.code === yearCodeOrRef || y.reference === yearCodeOrRef
      );
      if (!target) return;

      setSelectedYearCode(target.code);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, target.code);
        sessionStorage.setItem(SESSION_PROMPT_KEY, "true");
      }

      // Invalidate relevant queries so the whole portal reflects the new year context
      queryClient.invalidateQueries({ queryKey: ["pnl"] });
      queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
      queryClient.invalidateQueries({ queryKey: ["gl-statement"] });
      queryClient.invalidateQueries({ queryKey: ["tax-filing"] });
      queryClient.invalidateQueries({ queryKey: ["year-end"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["account-drilldown"] });

      // If currently viewing a fiscal year detail page, navigate to the selected year's detail page
      if (pathname) {
        const detailMatch = pathname.match(/^\/([^/]+)\/fiscal-years\/([^/]+)$/);
        if (detailMatch) {
          const currentRole = detailMatch[1];
          router.push(`/${currentRole}/fiscal-years/${target.reference}`);
        }
      }

      toast.success(
        `Portal context shifted to Fiscal Year ${target.code} (${target.start_date} → ${target.end_date})`
      );
      setIsModalOpen(false);
    },
    [years, queryClient, pathname, router]
  );

  const refreshYears = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["financial-years"] });
  }, [queryClient]);

  const openYearSelectorModal = () => setIsModalOpen(true);
  const closeYearSelectorModal = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_PROMPT_KEY, "true");
    }
    setIsModalOpen(false);
  };

  return (
    <FiscalYearContext.Provider
      value={{
        years,
        selectedYear,
        selectedYearCode: selectedYear?.code || "",
        isCurrentOperatingYear,
        isLoading,
        switchFiscalYear,
        refreshYears,
        openYearSelectorModal,
        closeYearSelectorModal,
        isYearSelectorModalOpen: isModalOpen,
      }}
    >
      {children}
      {isModalOpen && (
        <FiscalYearModal
          years={years}
          selectedYearCode={selectedYear?.code || ""}
          onSelect={switchFiscalYear}
          onClose={closeYearSelectorModal}
        />
      )}
    </FiscalYearContext.Provider>
  );
}

export function useFiscalYear() {
  const context = useContext(FiscalYearContext);
  if (!context) {
    throw new Error("useFiscalYear must be used within a FiscalYearProvider");
  }
  return context;
}

interface FiscalYearModalProps {
  years: FinancialYear[];
  selectedYearCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

function FiscalYearModal({
  years,
  selectedYearCode,
  onSelect,
  onClose,
}: FiscalYearModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Accounting Context Switcher</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Select Working Fiscal Year</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            All ledger balances, financial statements (P&amp;L, Balance Sheet, Tax Filing, GL statements), and analytics will strictly reflect the selected fiscal year.
          </p>
        </div>

        {/* Year Options List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {years.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No financial years configured in the system.
            </div>
          ) : (
            years.map((y) => {
              const isSelected = y.code === selectedYearCode;
              const isCurrent = Boolean(y.is_current);

              return (
                <div
                  key={y.reference}
                  onClick={() => onSelect(y.code)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      )}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          FY {y.code}
                        </span>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Sparkles className="w-2.5 h-2.5" />
                            Current Year
                          </span>
                        ) : y.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Open / Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                            Archived / Closed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {y.start_date} &rarr; {y.end_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Active Context
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-800 flex items-center gap-1">
                        Select <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Confirm &amp; Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
