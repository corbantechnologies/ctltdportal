/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Zap,
  Layers,
  CalendarRange,
  FileText,
  Receipt,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Calculator,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckSquare,
  Square,
  FileSpreadsheet,
  ExternalLink,
  BookMarked,
  RotateCcw,
  Lock,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadSampleCSVTemplate } from "@/tools/csvExport";
import { toast } from "react-hot-toast";

interface GuideCategory {
  id: string;
  name: string;
  icon: any;
  badge?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const CATEGORIES: GuideCategory[] = [
  {
    id: "all",
    name: "All Guides",
    icon: BookMarked,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "Complete operational handbook and technical documentation",
  },
  {
    id: "immutability-reversals",
    name: "Reversals & Immutability",
    icon: RotateCcw,
    badge: "GL Safety Engine",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    description: "Audit trail protection, non-destructive reversals, and closed-period locking",
  },
  {
    id: "forex-usd",
    name: "USD & Forex Card Billing",
    icon: DollarSign,
    badge: "Forex Playbook",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    description: "Handling foreign currency SaaS bills paid in KES via corporate card or bank",
  },
  {
    id: "principles",
    name: "Double-Entry & Fundamentals",
    icon: Calculator,
    badge: "Core Theory",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Debit/Credit rules, accounting equation, and standard ledger entries",
  },
  {
    id: "bulk-studio",
    name: "Quick & Bulk Transactions",
    icon: Zap,
    badge: "Popular",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    description: "Fast data entry, batch recurring presets (e.g. Railway), and CSV imports",
  },
  {
    id: "coa-books",
    name: "Chart of Accounts & Books",
    icon: Layers,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "5-class account structure, books taxonomy, and sub-ledger mapping",
  },
  {
    id: "fiscal-periods",
    name: "Fiscal Cycles & Period Locks",
    icon: CalendarRange,
    badge: "Audit SOP",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "Active fiscal years, monthly cycles, month-end closing, and audit locks",
  },
  {
    id: "billing-sales",
    name: "Invoicing & Receipts",
    icon: Receipt,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    description: "Quotations to Invoice conversion, partner payment receipts, and reconciliation",
  },
  {
    id: "ledger-reports",
    name: "Ledgers & Financial Reports",
    icon: FileText,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    description: "General Ledger statements, Trial Balance, Balance Sheet, and P&L exports",
  },
];

interface SimulationScenario {
  title: string;
  category: string;
  description: string;
  type: "MONEY_OUT" | "MONEY_IN" | "JOURNAL";
  debit: { account: string; code: string; type: string; note: string };
  credit: { account: string; code: string; type: string; note: string };
  portalAction: string;
  portalLink: string;
  exampleData: {
    amount: string;
    partner: string;
    division: string;
    ledgerBook: string;
    paymentMethod: string;
  };
}

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    title: "USD Cloud Hosting Paid via KES Card (Railway / AWS / OpenAI)",
    category: "Forex & Operating Expense",
    description: "Monthly subscription charged in USD ($50) but billed to corporate card in KES (KES 6,550.00).",
    type: "MONEY_OUT",
    debit: {
      account: "Cloud Infrastructure & Hosting Expense",
      code: "6100-EXP",
      type: "Expense (Increases with Debit)",
      note: "Recognizes exact KES cost in P&L with USD reference in transaction memo",
    },
    credit: {
      account: "Corporate Bank Account / Debit Card",
      code: "1010-BNK",
      type: "Asset (Decreases with Credit)",
      note: "Matches exact bank statement settlement amount for 100% reconciliation match",
    },
    portalAction: "Log under Quick Transactions selecting KES statement amount and adding USD memo",
    portalLink: "/finance/simple-transactions",
    exampleData: {
      amount: "KES 6,550.00 ($50.00 USD)",
      partner: "Railway Corp",
      division: "Engineering & Cloud",
      ledgerBook: "Hosting & Server Expenses",
      paymentMethod: "Equity Bank Corporate Card",
    },
  },
  {
    title: "1-Click Reversal of Erroneous Posted Expense Journal",
    category: "GL Correction & Audit",
    description: "An erroneous KES 50,000 vendor payment was posted to the wrong ledger and needs voiding.",
    type: "JOURNAL",
    debit: {
      account: "Corporate Bank Account / Cash",
      code: "1010-BNK",
      type: "Asset (Debit Restores Bank Balance)",
      note: "Offsets and credits back the bank balance",
    },
    credit: {
      account: "Cloud Infrastructure Expense (Reversed)",
      code: "6100-EXP",
      type: "Expense (Credit Decreases Expense)",
      note: "Reduces overstated expense balance back to zero",
    },
    portalAction: "Open Journal Batch > Click 'Reverse Journal' > Enter Reason > Post Offset",
    portalLink: "/finance/fiscal-years",
    exampleData: {
      amount: "KES 50,000.00 (Mirrored Inversion)",
      partner: "System Reversal Engine",
      division: "Finance Operations",
      ledgerBook: "General Journal",
      paymentMethod: "Automated Reversal Voucher",
    },
  },
  {
    title: "Client Project Milestone Payment Received",
    category: "Operating Revenue",
    description: "Customer pays invoice for software engineering, design, or consulting deliverables.",
    type: "MONEY_IN",
    debit: {
      account: "Operating Bank Account / M-Pesa Paybill",
      code: "1020-MPESA",
      type: "Asset (Increases with Debit)",
      note: "Increases bank/cash liquid asset balance",
    },
    credit: {
      account: "Software Engineering & Services Revenue",
      code: "4010-REV",
      type: "Revenue (Increases with Credit)",
      note: "Recognizes earned gross revenue in Income Statement",
    },
    portalAction: "Log under Quick Transaction (MONEY_IN) or Issue Receipt against Invoice",
    portalLink: "/finance/invoices",
    exampleData: {
      amount: "KES 250,000.00",
      partner: "Acme Enterprises Ltd",
      division: "Software Solutions",
      ledgerBook: "Client Services Revenue",
      paymentMethod: "M-PESA Paybill 522522",
    },
  },
  {
    title: "Director Capital Injection / Shareholder Funding",
    category: "Equity Financing",
    description: "Director or shareholder transfers personal funds into company bank account for working capital.",
    type: "MONEY_IN",
    debit: {
      account: "Main Commercial Bank Account",
      code: "1010-BNK",
      type: "Asset (Increases with Debit)",
      note: "Liquid funds deposited in corporate bank account",
    },
    credit: {
      account: "Director Capital / Retained Equity",
      code: "3010-EQU",
      type: "Equity (Increases with Credit)",
      note: "Increases shareholder equity on Balance Sheet",
    },
    portalAction: "Log Quick Transaction (MONEY_IN) selecting Equity Book or Create Journal Entry",
    portalLink: "/finance/simple-transactions",
    exampleData: {
      amount: "KES 500,000.00",
      partner: "Managing Director",
      division: "Executive Management",
      ledgerBook: "Shareholder Capital & Equity",
      paymentMethod: "Bank Wire Transfer",
    },
  },
  {
    title: "Vendor Procurement of Office Hardware on Credit",
    category: "Accounts Payable",
    description: "Received high-end workstations from supplier with 30-day payment terms.",
    type: "JOURNAL",
    debit: {
      account: "Office Equipment & Fixed Assets",
      code: "1500-AST",
      type: "Asset (Increases with Debit)",
      note: "Capital asset capitalized on Balance Sheet",
    },
    credit: {
      account: "Trade Accounts Payable (Supplier)",
      code: "2010-LIA",
      type: "Liability (Increases with Credit)",
      note: "Obligation to settle payment within credit window",
    },
    portalAction: "Post a Multi-Line Journal Entry in Ledger or Log Supplier Invoice",
    portalLink: "/finance/journal-entries",
    exampleData: {
      amount: "KES 180,000.00",
      partner: "CompTech Systems Ltd",
      division: "Operations & IT",
      ledgerBook: "Fixed Assets & Hardware",
      paymentMethod: "Credit Terms (Net 30)",
    },
  },
  {
    title: "Monthly Depreciation of Fixed Assets",
    category: "Non-Cash Adjustment",
    description: "Allocating the monthly wear & tear cost of laptops, servers, and office furniture.",
    type: "JOURNAL",
    debit: {
      account: "Depreciation Expense",
      code: "6500-EXP",
      type: "Expense (Increases with Debit)",
      note: "Reflects asset depreciation on P&L statement",
    },
    credit: {
      account: "Accumulated Depreciation (Contra Asset)",
      code: "1590-AST",
      type: "Contra-Asset (Decreases Asset with Credit)",
      note: "Reduces book carrying value of Fixed Assets",
    },
    portalAction: "Post End-of-Month Journal Entry under Ledger",
    portalLink: "/finance/journal-entries",
    exampleData: {
      amount: "KES 15,000.00",
      partner: "Internal Asset Schedule",
      division: "Administration",
      ledgerBook: "General Journal",
      paymentMethod: "Non-Cash Journal Adjustment",
    },
  },
];

export default function FinanceGuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "reversals-guide": true,
    "forex-guide": true,
    "debit-credit-rules": true,
    "batch-fill-guide": true,
    "csv-specs": true,
    "month-end-sop": true,
  });

  // Checklist state for Month-End SOP
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    chk1: true,
    chk2: true,
    chk3: false,
    chk4: false,
    chk5: false,
    chk6: false,
  });

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistProgress = useMemo(() => {
    const total = Object.keys(checklist).length;
    const completed = Object.values(checklist).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  }, [checklist]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeScenario = SIMULATION_SCENARIOS[selectedScenarioIndex];

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Finance Reference Manual & SOP
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Finance Operational <span className="text-emerald-400">Guides</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Standardized operating procedures, double-entry accounting cheat sheets, USD foreign currency billing, GL reversal safety rules, and bulk transaction studio blueprints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                downloadSampleCSVTemplate();
                toast.success("CSV Import Template downloaded!");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md group"
            >
              <Download className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              Download CSV Template
            </button>
            <Link
              href="/finance/simple-transactions"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 group"
            >
              <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Open Bulk Studio
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides (e.g. Railway, USD bills, reversal, double-entry, CSV import, month closing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                isSelected
                  ? "bg-slate-900 text-white border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isSelected ? "text-emerald-400" : cat.color)} />
              <span>{cat.name}</span>
              {cat.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                    isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* NEW Section: Transaction Immutability & Automated Reversals */}
      {(selectedCategory === "all" || selectedCategory === "immutability-reversals") && (
        <div className="bg-white rounded-xl border border-violet-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("reversals-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-violet-50/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Transaction Immutability & Automated Reversal Engine
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                    Audit Trail Standard
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  Why posted transactions cannot be deleted, how the 1-click reversal engine works, and closed-period safety rules.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["reversals-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["reversals-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Core Principle Alert */}
              <div className="p-4 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
                    <Lock className="w-4 h-4" />
                    Golden Rule of General Ledger Immutability
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
                    Once a transaction or journal batch is <strong>POSTED</strong> to the General Ledger, it forms an immutable historical record. Hard deletions are permanently blocked. To void or correct a posted entry, an <strong>Automated Reversal Voucher</strong> is generated with an explicit reason.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 whitespace-nowrap self-start">
                  IFRS & GAAP Compliant
                </span>
              </div>

              {/* 3 Pillars of Reversal Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Hard-Delete Lockout</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Attempting to delete a posted transaction or journal raises a strict <code>PermissionDenied</code> safety block. Bulk delete operations automatically skip posted records to prevent accidental mass deletion.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Mirrored Inversion Engine</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When you click <strong>&quot;Reverse&quot;</strong>, the backend instantly clones the journal line items, swapping all <strong>Debits to Credits</strong> and <strong>Credits to Debits</strong>. Net GL balance impact drops to exactly 0.00.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Smart Date & Period Lock</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reversals default to <strong>Today&apos;s Date</strong> in the current active month. If a transaction belongs to a closed/locked month or fiscal year, backdated reversals are rejected to protect filed tax returns.
                  </p>
                </div>
              </div>

              {/* How to Reverse Flow */}
              <div className="p-4 rounded-lg bg-violet-50/50 border border-violet-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-violet-700" />
                  How to Void / Reverse an Entry in 3 Clicks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-violet-100 space-y-1">
                    <span className="font-bold text-violet-700">Step 1: Locate Record</span>
                    <p className="text-slate-600">
                      Open the Journal Batch or find the row in Quick Transactions.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-violet-100 space-y-1">
                    <span className="font-bold text-violet-700">Step 2: Click Reverse</span>
                    <p className="text-slate-600">
                      Click the purple <strong>Reverse</strong> button to launch the Reversal Dialog.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-violet-100 space-y-1">
                    <span className="font-bold text-violet-700">Step 3: State Reason</span>
                    <p className="text-slate-600">
                      Confirm the effective date, enter an audit reason (e.g. &quot;Duplicate payment&quot;), and confirm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW Section: Foreign Currency & USD Card Billing Guide */}
      {(selectedCategory === "all" || selectedCategory === "forex-usd") && (
        <div className="bg-white rounded-xl border border-teal-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("forex-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-teal-50/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Foreign Currency (USD) Bills & Corporate Card Playbook
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    Forex Standard
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  Best practices for recording USD subscriptions (Railway, AWS, Vercel, OpenAI) billed to KES bank accounts.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["forex-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["forex-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Question / Context Banner */}
              <div className="p-4 rounded-lg bg-teal-900 text-white space-y-2">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  Standard Accounting Treatment for Foreign Vendor Invoices
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  Corban Technologies&apos; functional operating currency is <strong>KES (Kenyan Shillings)</strong>. When international vendors invoice in <strong>USD ($)</strong> and are charged to our KES corporate card, the commercial bank executes real-time FX conversion (including their bank FX spread and processing fees).
                </p>
              </div>

              {/* Step-by-Step Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-teal-800 tracking-wider">
                    Recommended Operating Procedure (Zero Variance)
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>1. Pick the exact KES settlement:</strong> Always record the exact KES debit amount reflected on your bank / credit card statement.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>2. Why this is best:</strong> The bank&apos;s settlement amount already bundles the spot FX conversion, card interchange markup, and excise duty. Recording the exact KES ensures your General Ledger matches the bank statement to the cent.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>3. Document the USD rate in the memo:</strong> Include the USD invoice total and reference in the description field for audit reference.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-teal-800 tracking-wider">
                    Example Entry Comparison
                  </h4>
                  <div className="bg-white p-3 rounded border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">Vendor Invoice:</span>
                      <span className="font-mono font-bold text-slate-900">$50.00 USD</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">Bank Card Charge:</span>
                      <span className="font-mono font-bold text-emerald-600">KES 6,550.00</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">Effective Rate:</span>
                      <span className="font-mono text-slate-700">1 USD = 131.00 KES</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 block text-[11px]">Recommended Memo Format:</span>
                      <code className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 block mt-1">
                        Railway Hosting Feb 2026 ($50.00 USD @ 131.00 KES/USD) - Inv #RW-4482
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Double-Entry Scenario Explorer */}
      {(selectedCategory === "all" || selectedCategory === "principles" || selectedCategory === "bulk-studio" || selectedCategory === "forex-usd" || selectedCategory === "immutability-reversals") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Interactive Accounting Scenario Simulator
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Real-World Double-Entry Explorer</h2>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Select a business event to see exactly how debits, credits, and journal balance rules apply in Corban Portal.
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 self-start md:self-auto font-mono">
              6 Real Scenarios Available
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Scenario Selector Sidebar */}
            <div className="lg:col-span-5 p-4 bg-slate-50 space-y-2 max-h-[460px] overflow-y-auto">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Select Business Scenario
              </p>
              {SIMULATION_SCENARIOS.map((scenario, index) => {
                const isActive = selectedScenarioIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedScenarioIndex(index)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 group",
                      isActive
                        ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                            scenario.type === "MONEY_OUT"
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : scenario.type === "MONEY_IN"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          )}
                        >
                          {scenario.type === "MONEY_OUT"
                            ? "Money Out"
                            : scenario.type === "MONEY_IN"
                            ? "Money In"
                            : "General Journal"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {scenario.category}
                        </span>
                      </div>
                      <h4
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          isActive ? "text-slate-900 font-bold" : "text-slate-700 group-hover:text-slate-900"
                        )}
                      >
                        {scenario.title}
                      </h4>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform mt-2",
                        isActive ? "text-emerald-600 translate-x-1" : "text-slate-300"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Scenario Breakdown View */}
            <div className="lg:col-span-7 p-6 space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">
                    {activeScenario.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Target: {activeScenario.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{activeScenario.title}</h3>
                <p className="text-sm text-slate-600">{activeScenario.description}</p>
              </div>

              {/* Debit & Credit Ledger Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DEBIT Card */}
                <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      1. DEBIT ENTRY (DR)
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      {activeScenario.debit.code}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{activeScenario.debit.account}</h5>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">{activeScenario.debit.type}</p>
                  </div>
                  <p className="text-xs text-slate-600 border-t border-emerald-200/60 pt-2">
                    {activeScenario.debit.note}
                  </p>
                </div>

                {/* CREDIT Card */}
                <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-blue-600" />
                      2. CREDIT ENTRY (CR)
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                      {activeScenario.credit.code}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{activeScenario.credit.account}</h5>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">{activeScenario.credit.type}</p>
                  </div>
                  <p className="text-xs text-slate-600 border-t border-blue-200/60 pt-2">
                    {activeScenario.credit.note}
                  </p>
                </div>
              </div>

              {/* Sample Data & Portal Action */}
              <div className="bg-slate-900 text-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Portal Action
                  </span>
                  <Link
                    href={activeScenario.portalLink}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 text-xs"
                  >
                    Open Page <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-sm font-medium text-slate-200">{activeScenario.portalAction}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Sample Amount:</span>
                    <span className="font-semibold text-white">{activeScenario.exampleData.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Entity/Partner:</span>
                    <span className="font-semibold text-white truncate block">
                      {activeScenario.exampleData.partner}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Division:</span>
                    <span className="font-semibold text-white truncate block">
                      {activeScenario.exampleData.division}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ledger Book:</span>
                    <span className="font-semibold text-white truncate block">
                      {activeScenario.exampleData.ledgerBook}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Section 1: Double-Entry Principles & Golden Cheat Sheet */}
      {(selectedCategory === "all" || selectedCategory === "principles") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("debit-credit-rules")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Double-Entry Master Matrix & Golden Rules
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Fundamental accounting equation, debit/credit mechanics, and account classifications.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["debit-credit-rules"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["debit-credit-rules"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Fundamental Equation */}
              <div className="p-4 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    The Fundamental Balance Equation
                  </span>
                  <div className="text-xl md:text-2xl font-mono font-bold text-white">
                    Assets = Liabilities + Equity + (Revenue - Expenses)
                  </div>
                </div>
                <div className="text-xs text-slate-300 max-w-sm">
                  Every transaction recorded in Corban Portal creates balanced entries where{" "}
                  <strong className="text-emerald-400">Total Debits == Total Credits</strong>.
                </div>
              </div>

              {/* Master Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-r border-slate-200">Account Class</th>
                      <th className="p-3 border-b border-r border-slate-200">Code Range</th>
                      <th className="p-3 border-b border-r border-slate-200">Normal Balance</th>
                      <th className="p-3 border-b border-r border-slate-200 text-emerald-700 bg-emerald-50/60">
                        Debit Effect (DR)
                      </th>
                      <th className="p-3 border-b border-r border-slate-200 text-blue-700 bg-blue-50/60">
                        Credit Effect (CR)
                      </th>
                      <th className="p-3 border-b border-slate-200">Examples at Corban</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        1. Assets
                      </td>
                      <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                        1000 – 1999
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 border-r border-slate-200">
                        Debit
                      </td>
                      <td className="p-3 font-bold text-emerald-600 bg-emerald-50/30 border-r border-slate-200">
                        Increases (+)
                      </td>
                      <td className="p-3 font-bold text-rose-600 bg-rose-50/30 border-r border-slate-200">
                        Decreases (-)
                      </td>
                      <td className="p-3 text-slate-600">
                        Equity Bank, M-PESA Paybill, Petty Cash, Laptops, Servers
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        2. Liabilities
                      </td>
                      <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                        2000 – 2999
                      </td>
                      <td className="p-3 font-semibold text-blue-600 border-r border-slate-200">
                        Credit
                      </td>
                      <td className="p-3 font-bold text-rose-600 bg-rose-50/30 border-r border-slate-200">
                        Decreases (-)
                      </td>
                      <td className="p-3 font-bold text-emerald-600 bg-emerald-50/30 border-r border-slate-200">
                        Increases (+)
                      </td>
                      <td className="p-3 text-slate-600">
                        Accounts Payable, VAT Output, PAYE Withholding, Director Loan
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        3. Equity
                      </td>
                      <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                        3000 – 3999
                      </td>
                      <td className="p-3 font-semibold text-blue-600 border-r border-slate-200">
                        Credit
                      </td>
                      <td className="p-3 font-bold text-rose-600 bg-rose-50/30 border-r border-slate-200">
                        Decreases (-)
                      </td>
                      <td className="p-3 font-bold text-emerald-600 bg-emerald-50/30 border-r border-slate-200">
                        Increases (+)
                      </td>
                      <td className="p-3 text-slate-600">
                        Share Capital, Retained Earnings, Owner Capital Contributions
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        4. Revenue / Income
                      </td>
                      <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                        4000 – 4999
                      </td>
                      <td className="p-3 font-semibold text-blue-600 border-r border-slate-200">
                        Credit
                      </td>
                      <td className="p-3 font-bold text-rose-600 bg-rose-50/30 border-r border-slate-200">
                        Decreases (-)
                      </td>
                      <td className="p-3 font-bold text-emerald-600 bg-emerald-50/30 border-r border-slate-200">
                        Increases (+)
                      </td>
                      <td className="p-3 text-slate-600">
                        Software Consulting, SaaS Subscriptions, Retainers, Tech Support
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        5. Cost of Sales & Expenses
                      </td>
                      <td className="p-3 font-mono text-slate-600 border-r border-slate-200">
                        5000 – 6999
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 border-r border-slate-200">
                        Debit
                      </td>
                      <td className="p-3 font-bold text-emerald-600 bg-emerald-50/30 border-r border-slate-200">
                        Increases (+)
                      </td>
                      <td className="p-3 font-bold text-rose-600 bg-rose-50/30 border-r border-slate-200">
                        Decreases (-)
                      </td>
                      <td className="p-3 text-slate-600">
                        Railway Hosting, AWS, Staff Salaries, Office Rent, Utilities
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quick Callout */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Automated Balancing in Corban Portal:</strong> When you use{" "}
                  <strong>Quick Transactions</strong> or <strong>Bulk Import</strong>, you only specify
                  the event (e.g. Money Out of Bank to Railway Expense). The backend automatically
                  determines the corresponding Debit and Credit sides and writes a linked, balanced{" "}
                  <code>JournalEntry</code>!
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section 2: Quick & Bulk Transactions Studio */}
      {(selectedCategory === "all" || selectedCategory === "bulk-studio") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("batch-fill-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bulk Transaction Studio: Batch Fill & CSV Import Playbook
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Step-by-step workflow for logging 1-year recurring expenses (e.g. Railway, AWS), quick batch presets, and CSV imports.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["batch-fill-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["batch-fill-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Step by Step Card: Recurring Expenses */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Use-Case: Logging 12 Months of Recurring Cloud Bills (e.g., Railway)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase">Set Studio Defaults</h5>
                    <p className="text-xs text-slate-600">
                      In the Bulk Studio top bar, set:
                    </p>
                    <ul className="text-[11px] space-y-1 text-slate-700 list-disc list-inside">
                      <li><strong>Type:</strong> Money Out (Expense)</li>
                      <li><strong>Payment:</strong> Main Bank / Card</li>
                      <li><strong>Division:</strong> Tech / Engineering</li>
                      <li><strong>Book:</strong> Cloud Hosting</li>
                      <li><strong>Partner:</strong> Railway</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase">1-Click Batch Populate</h5>
                    <p className="text-xs text-slate-600">
                      Select <strong>12 Rows</strong> and click <strong>&quot;Apply Defaults to All Rows&quot;</strong>. 
                      All 12 rows are instantly filled with your pre-configured settings in under a second!
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      3
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase">Tweak Dates & Amounts</h5>
                    <p className="text-xs text-slate-600">
                      Quickly tab through the date cells to set each month (e.g., Jan 15, Feb 15, Mar 15...) and adjust any fluctuating monthly usage amounts.
                    </p>
                  </div>
                </div>
              </div>

              {/* CSV Import Standards */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      CSV Batch Import Header Specifications
                    </h4>
                    <p className="text-xs text-slate-500">
                      The CSV template is strictly pre-structured with 11 standard columns.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      downloadSampleCSVTemplate();
                      toast.success("CSV Import Template downloaded!");
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Sample CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-900 text-slate-200 font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5 border-b border-r border-slate-800">CSV Column Header</th>
                        <th className="p-2.5 border-b border-r border-slate-800">Required?</th>
                        <th className="p-2.5 border-b border-r border-slate-800">Accepted Values / Format</th>
                        <th className="p-2.5 border-b border-slate-800">Example Cell</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">name</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r">Transaction title / memo</td>
                        <td className="p-2.5 text-emerald-600">&quot;Railway Cloud Hosting&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">transaction_type</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r"><code>MONEY_IN</code> or <code>MONEY_OUT</code></td>
                        <td className="p-2.5 text-emerald-600">&quot;MONEY_OUT&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">amount</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r">Decimal number (no currency symbols)</td>
                        <td className="p-2.5 text-emerald-600">&quot;6500.00&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">date</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r"><code>YYYY-MM-DD</code></td>
                        <td className="p-2.5 text-emerald-600">&quot;2026-03-15&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">ledger_book</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r">Matching Book Name in Portal</td>
                        <td className="p-2.5 text-emerald-600">&quot;Hosting & Cloud&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">payment_method</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r">Bank / Cash Book name</td>
                        <td className="p-2.5 text-emerald-600">&quot;Equity Bank Main&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">division</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r">Division Name configured in system</td>
                        <td className="p-2.5 text-emerald-600">&quot;Engineering&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">journal_type</td>
                        <td className="p-2.5 text-rose-600 font-bold border-r">YES</td>
                        <td className="p-2.5 text-slate-600 border-r">Journal Type Name (e.g. Expense, Receipt)</td>
                        <td className="p-2.5 text-emerald-600">&quot;Payment Voucher&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">partner</td>
                        <td className="p-2.5 text-slate-400 border-r">Optional</td>
                        <td className="p-2.5 text-slate-600 border-r">Vendor or Customer Name</td>
                        <td className="p-2.5 text-emerald-600">&quot;Railway Inc&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">source_document</td>
                        <td className="p-2.5 text-slate-400 border-r">Optional</td>
                        <td className="p-2.5 text-slate-600 border-r">Invoice / Receipt / Bill</td>
                        <td className="p-2.5 text-emerald-600">&quot;Vendor Invoice&quot;</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 border-r">document_number</td>
                        <td className="p-2.5 text-slate-400 border-r">Optional</td>
                        <td className="p-2.5 text-slate-600 border-r">Reference Code</td>
                        <td className="p-2.5 text-emerald-600">&quot;RW-99382-FEB&quot;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section 3: Chart of Accounts & Books Structure */}
      {(selectedCategory === "all" || selectedCategory === "coa-books") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 flex items-center justify-between text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chart of Accounts (COA) & Books Architecture
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  How accounts, books, sub-ledgers, and divisions interact across financial reports.
                </p>
              </div>
            </div>
            <Link
              href="/finance/coa"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded border border-purple-200"
            >
              View COA <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase text-purple-700 tracking-wider">
                  1. Chart of Accounts (COA)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The COA is the primary taxonomy of all financial accounts in the organization. It categorizes accounts into the 5 global accounting heads (Assets, Liabilities, Equity, Revenue, Expense) and sets the normal balance (Debit vs Credit).
                </p>
                <div className="bg-white p-3 rounded border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                  <div><strong>1000</strong> - Current Assets (Bank, M-PESA, Cash, AR)</div>
                  <div><strong>2000</strong> - Current Liabilities (AP, Taxes, Loans)</div>
                  <div><strong>3000</strong> - Equity & Share Capital</div>
                  <div><strong>4000</strong> - Operating Revenue & Sales</div>
                  <div><strong>6000</strong> - Operational & Administrative Expenses</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase text-purple-700 tracking-wider">
                  2. Books & Sub-Ledgers
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Books</strong> act as user-friendly operational sub-accounts. When field staff or finance officers log daily transactions, they select a Book (e.g. &quot;Cloud Infrastructure&quot; or &quot;Consulting Sales&quot;) rather than memorizing raw general ledger account codes.
                </p>
                <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>Cash / Bank Books:</span>
                    <span className="font-semibold text-emerald-600">Maps to Asset COA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Expense Books:</span>
                    <span className="font-semibold text-rose-600">Maps to Expense COA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sales Books:</span>
                    <span className="font-semibold text-blue-600">Maps to Revenue COA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Section 4: Fiscal Cycles & Period Locks (Standard Month-End SOP) */}
      {(selectedCategory === "all" || selectedCategory === "fiscal-periods") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("month-end-sop")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Fiscal Period Management & Month-End Closing SOP
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Interactive 6-step checklist for monthly financial closing and audit period freezing.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["month-end-sop"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["month-end-sop"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Progress Bar */}
              <div className="p-4 rounded-lg bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-emerald-400">
                    Month-End Closing Readiness
                  </span>
                  <span className="font-mono font-bold text-white">{checklistProgress}% Completed</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {[
                  {
                    id: "chk1",
                    title: "1. Post all Pending Daily Transactions & Receipts",
                    desc: "Ensure all M-PESA, Bank statement, and supplier payments for the month are logged under Quick Transactions or Invoices/Receipts.",
                    link: "/finance/simple-transactions",
                    linkText: "Check Transactions",
                  },
                  {
                    id: "chk2",
                    title: "2. Bank & M-PESA Reconciliation",
                    desc: "Verify that Bank Ledger closing balances match physical bank statements and Safaricom Paybill settlements.",
                    link: "/finance/reports/gl-statement",
                    linkText: "View GL Statements",
                  },
                  {
                    id: "chk3",
                    title: "3. Review Accounts Receivable & Outstanding Invoices",
                    desc: "Audit all unpaid client invoices. Follow up on overdue receivables and mark cleared payments.",
                    link: "/finance/invoices",
                    linkText: "Review Invoices",
                  },
                  {
                    id: "chk4",
                    title: "4. Post End-of-Month Adjustments & Depreciation",
                    desc: "Post manual journal entries for asset depreciation, prepayments, and accrued supplier expenses.",
                    link: "/finance/journal-entries",
                    linkText: "New Journal Entry",
                  },
                  {
                    id: "chk5",
                    title: "5. Generate Trial Balance & Verify Zero Variance",
                    desc: "Inspect the Trial Balance to confirm Total Debits equal Total Credits with zero suspense discrepancies.",
                    link: "/finance/reports",
                    linkText: "Financial Reports",
                  },
                  {
                    id: "chk6",
                    title: "6. Lock Financial Month Period",
                    desc: "Navigate to Fiscal Years, select the closed month, and activate the Lock. This prevents unauthorized backdated edits.",
                    link: "/finance/fiscal-years",
                    linkText: "Manage Fiscal Periods",
                  },
                ].map((item) => {
                  const isChecked = checklist[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={cn(
                        "p-4 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-4",
                        isChecked
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="mt-0.5 text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div className="space-y-1">
                          <h5
                            className={cn(
                              "text-sm font-bold transition-all",
                              isChecked ? "text-emerald-950 line-through opacity-80" : "text-slate-900"
                            )}
                          >
                            {item.title}
                          </h5>
                          <p className="text-xs text-slate-600">{item.desc}</p>
                        </div>
                      </div>
                      <Link
                        href={item.link}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 whitespace-nowrap self-center"
                      >
                        {item.linkText}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section 5: Common FAQs & Trouble-Shooting */}
      {(selectedCategory === "all" || selectedCategory === "immutability-reversals" || selectedCategory === "forex-usd" || selectedCategory === "billing-sales" || selectedCategory === "ledger-reports") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Finance FAQs & Audit Best Practices</h3>
              <p className="text-xs text-slate-500">
                Quick answers to common day-to-day accounting, forex, reversal, and portal operations questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Q: Why can&apos;t I delete a posted transaction or journal?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                In double-entry accounting (IFRS/GAAP), posted transactions form a permanent General Ledger record. Deleting them creates untraceable discrepancies. Instead, use the <strong>&quot;Reverse Journal&quot;</strong> button to generate an offsetting entry that cancels out the financial effect while keeping an immutable audit trail.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Q: What date should be used when reversing an old transaction?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The portal defaults reversal vouchers to <strong>Today&apos;s Date (in the current active period)</strong>. This avoids modifying closed past months or altering filed tax returns. If the original month is still open and unclosed, you can optionally reverse it on the original date.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Q: How do we record USD invoices charged to our KES corporate card?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record the <strong>exact KES amount</strong> debited on your bank/card statement. This includes all card processing and FX conversion charges, ensuring your bank ledger perfectly reconciles with zero FX suspense variance. Include the USD amount (e.g. <code>$50 USD</code>) in the description memo.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Q: What is the difference between Quick Transaction and Journal Entry?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Quick Transactions</strong> are single-leg cash/bank events (Money In or Money Out). The backend automatically derives the debit/credit pair. <strong>Journal Entries</strong> allow multi-line debits and credits for complex multi-account adjustments, payroll, and asset transfers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Floating Footer Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Need to record financial entries now?</h4>
            <p className="text-xs text-slate-400">
              Jump straight to the transaction studio or launch the Chart of Accounts ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/finance/coa"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all border border-slate-700"
          >
            Chart of Accounts
          </Link>
          <Link
            href="/finance/reports/gl-statement"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all border border-slate-700"
          >
            GL Statements
          </Link>
          <Link
            href="/finance/simple-transactions"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
          >
            Record Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}
