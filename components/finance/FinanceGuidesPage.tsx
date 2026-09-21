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
  ShoppingCart,
  Users,
  Building2,
  FileCheck,
  CreditCard,
  Send,
  FileBadge,
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
    id: "direct-sales",
    name: "Direct Sales & POS",
    icon: ShoppingCart,
    badge: "Walk-in & Retail",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "Walk-in sales without registered partners, instant 1-click settlement, and receipt generation",
  },
  {
    id: "expenses-hub",
    name: "Expenses & Outflows",
    icon: TrendingDown,
    badge: "COA 6xxx",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    description: "Operational disbursements categorized by Chart of Accounts with dual bank/cash journal posting",
  },
  {
    id: "billing-sales",
    name: "Invoicing & Receipts",
    icon: Receipt,
    badge: "GL Posting",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Full-page tax invoice studio, automated General Ledger posting, and payment allocations",
  },
  {
    id: "crm-pipeline",
    name: "CRM & Quotations",
    icon: FileCheck,
    badge: "Kanban Pipeline",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    description: "Sales pipeline Kanban stages, commercial proposals, and 1-click invoice conversion",
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
    id: "ar-aging",
    name: "AR Aging & Customer Statements",
    icon: TrendingUp,
    badge: "Receivables & DSO",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "Aging brackets (0-30, 31-60, 61-90, 90+), DSO cash velocity, and 1-click Statement of Account (SOA) generation",
  },
  {
    id: "vendor-bills",
    name: "Vendor Bills (AP) & Outflows",
    icon: Receipt,
    badge: "Payables & Runway",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    description: "Supplier bill booking, double-entry AP expense accrual (DR 6xxx / CR 2010), and 7-day liquidity runway planning",
  },
  {
    id: "payroll-statutory",
    name: "Kenyan Payroll & Staff Claims",
    icon: Users,
    badge: "PAYE & NSSF/SHIF",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "Automated Kenyan statutory engine (PAYE, NSSF Tier 1/2, SHIF 2.75%, Housing Levy 1.5%) and staff expense reimbursements",
  },
  {
    id: "audit-drilldowns",
    name: "GL Interactive Drill-Downs",
    icon: Layers,
    badge: "Traceability",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    description: "Clickable Trial Balance, P&L, and Balance Sheet rows drilling down into chronological audit journal entries",
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
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    description: "Debit/Credit rules, accounting equation, and standard ledger entries",
  },
  {
    id: "bulk-studio",
    name: "Quick & Bulk Transactions",
    icon: Zap,
    badge: "Batch Presets",
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
    title: "Direct Walk-In Sale (POS) with Immediate Settlement & Receipt",
    category: "Retail & Direct POS",
    description: "Walk-in client purchases hardware/services without partner registration, paid instantly via M-PESA or Bank.",
    type: "MONEY_IN",
    debit: {
      account: "M-PESA / Commercial Bank Account",
      code: "1020-MPESA",
      type: "Asset (Debit Increases Liquid Balance)",
      note: "Receives immediate client settlement funds into designated liquid book",
    },
    credit: {
      account: "Sales & Services Revenue",
      code: "4010-REV",
      type: "Revenue (Credit Recognizes Revenue)",
      note: "Recognizes gross sales in Income Statement and automatically allocates VAT (2020-VAT) if taxable",
    },
    portalAction: "Launch Point-of-Sale Studio > Check 'Settle Immediately' > Post & Issue Receipt",
    portalLink: "/finance/sales/new",
    exampleData: {
      amount: "KES 45,000.00 (Incl. 16% VAT)",
      partner: "Walk-in Customer (John Doe)",
      division: "Software & Hardware Retail",
      ledgerBook: "M-PESA Collections Book",
      paymentMethod: "M-PESA Buy Goods 889900",
    },
  },
  {
    title: "Operational Expense Outflow (Office Rent & Utilities)",
    category: "Operating Disbursements",
    description: "Monthly office rent or corporate utility bill disbursed from main commercial bank account.",
    type: "MONEY_OUT",
    debit: {
      account: "Office Rent & Facilities Expense",
      code: "6200-EXP",
      type: "Expense (Debit Increases Expense)",
      note: "Categorized under Chart of Accounts 6xxx Operating Expenses on P&L",
    },
    credit: {
      account: "Main Commercial Bank Account",
      code: "1010-BNK",
      type: "Asset (Credit Decreases Bank Balance)",
      note: "Reduces liquid cash/bank book balance to match bank statement debit",
    },
    portalAction: "Open Expenses Studio > Select 6xxx Expense Category > Select Disbursing Book > Submit",
    portalLink: "/finance/expenses/new",
    exampleData: {
      amount: "KES 120,000.00",
      partner: "Plaza Management Ltd",
      division: "Corporate Operations",
      ledgerBook: "Operating Bank Account",
      paymentMethod: "EFT / RTGS Wire",
    },
  },
  {
    title: "B2B Credit Invoice Issued & Posted to General Ledger",
    category: "Accounts Receivable",
    description: "Corporate client receives a formal Tax Invoice on Net 30 terms; posted to GL before payment.",
    type: "JOURNAL",
    debit: {
      account: "Trade Accounts Receivable (Client)",
      code: "1200-AR",
      type: "Asset (Debit Increases Receivables)",
      note: "Establishes a legally enforceable asset owed by the client",
    },
    credit: {
      account: "Enterprise Solutions Revenue",
      code: "4010-REV",
      type: "Revenue (Credit Recognizes Revenue)",
      note: "Recognizes earned revenue under accrual accounting principle",
    },
    portalAction: "Open Invoice Studio > Select Partner / Client > Click 'Approve & Post to GL'",
    portalLink: "/finance/invoices/new",
    exampleData: {
      amount: "KES 350,000.00",
      partner: "Safaricom Enterprise Solutions",
      division: "Cloud Engineering",
      ledgerBook: "Accounts Receivable Sub-Ledger",
      paymentMethod: "Credit Terms (Net 30)",
    },
  },
  {
    title: "Payment Receipt Allocated against Outstanding Tax Invoice",
    category: "Settlement & Reconciliation",
    description: "Client clears an outstanding invoice via direct bank wire; settles AR and updates progress meter to 100%.",
    type: "MONEY_IN",
    debit: {
      account: "Main Commercial Bank Account",
      code: "1010-BNK",
      type: "Asset (Debit Increases Liquid Cash)",
      note: "Deposits collected cash into liquid bank balance",
    },
    credit: {
      account: "Trade Accounts Receivable",
      code: "1200-AR",
      type: "Asset (Credit Clears Receivables)",
      note: "Reduces client outstanding balance to 0.00; invoice transitions to PAID",
    },
    portalAction: "Open Invoice Detail > Click 'Record Payment Receipt' > Enter Ref & Allocate",
    portalLink: "/finance/invoices",
    exampleData: {
      amount: "KES 350,000.00",
      partner: "Safaricom Enterprise Solutions",
      division: "Cloud Engineering",
      ledgerBook: "Operating Bank Account",
      paymentMethod: "Bank Wire KCB-001928",
    },
  },
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
    portalAction: "Log under Quick Transactions or Expenses Studio selecting KES statement amount and adding USD memo",
    portalLink: "/finance/expenses/new",
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
  {
    title: "Vendor Bill (AP) Accrual & Booking",
    category: "Accounts Payable",
    description: "Supplier bill received for software licenses / hosting; accrued to General Ledger before payment.",
    type: "JOURNAL",
    debit: {
      account: "Cloud Software & Licenses Expense",
      code: "6110-EXP",
      type: "Expense (Debit Recognizes Expense)",
      note: "Accrues expense into current financial month P&L",
    },
    credit: {
      account: "Trade Accounts Payable",
      code: "2010-AP",
      type: "Liability (Credit Establishes Payable)",
      note: "Establishes formal Accounts Payable liability due to supplier",
    },
    portalAction: "Open Vendor Bills Studio > Enter Supplier Invoice Details > Click 'Post to General Ledger'",
    portalLink: "/finance/vendor-bills",
    exampleData: {
      amount: "KES 75,000.00",
      partner: "Datadog Cloud Solutions",
      division: "Engineering & Cloud",
      ledgerBook: "Software Licenses & Subscriptions",
      paymentMethod: "Credit Terms (Net 30)",
    },
  },
  {
    title: "Vendor Bill Settlement / AP Disbursement",
    category: "Payables Settlement",
    description: "Clearing an approved supplier invoice via corporate bank wire; settles AP liability.",
    type: "MONEY_OUT",
    debit: {
      account: "Trade Accounts Payable",
      code: "2010-AP",
      type: "Liability (Debit Clears Liability)",
      note: "Reduces supplier balance due to zero",
    },
    credit: {
      account: "Main Commercial Bank Account",
      code: "1010-BNK",
      type: "Asset (Credit Decreases Bank Balance)",
      note: "Funds disbursed from corporate bank account",
    },
    portalAction: "Open Vendor Bill Detail > Click 'Record Payment' > Choose Bank Account > Confirm Disbursement",
    portalLink: "/finance/vendor-bills",
    exampleData: {
      amount: "KES 75,000.00",
      partner: "Datadog Cloud Solutions",
      division: "Engineering & Cloud",
      ledgerBook: "Operating Bank Account",
      paymentMethod: "Bank Wire KCB-994821",
    },
  },
  {
    title: "Monthly Staff Payroll Execution & Kenyan Statutory Posting",
    category: "Payroll & Statutory",
    description: "Monthly salary run calculating PAYE, NSSF Tier 1/2, SHIF, Housing Levy, and Net Pay.",
    type: "JOURNAL",
    debit: {
      account: "Salaries & Wages Operating Expense",
      code: "6010-EXP",
      type: "Expense (Debit Gross Remuneration)",
      note: "Full gross employee compensation charged to Income Statement",
    },
    credit: {
      account: "PAYE Tax (2040) + Statutory (2050) + Net Pay (1010)",
      code: "2040 / 2050 / 1010",
      type: "Multi-Leg Liabilities & Liquid Cash",
      note: "Allocates KRA PAYE tax, NSSF/SHIF/Housing levies, and net cash disbursed to staff",
    },
    portalAction: "Open Payroll Studio > Add Employee Items > Verify Statutory Deductions > Click 'Post Payroll to GL'",
    portalLink: "/finance/payroll",
    exampleData: {
      amount: "KES 450,000.00 Gross (Net KES 342,000.00)",
      partner: "Corban Staff Payroll Batch",
      division: "All Operating Divisions",
      ledgerBook: "Executive & Engineering Payroll",
      paymentMethod: "Bank Salary Transfer Batch",
    },
  },
  {
    title: "Staff Expense Reimbursement Claim Disbursement",
    category: "Reimbursements",
    description: "Employee submits field visit travel expense; approved by Director and disbursed via M-Pesa/Bank.",
    type: "MONEY_OUT",
    debit: {
      account: "Field Operations & Travel Expense",
      code: "6300-EXP",
      type: "Expense (Debit Increases Expense)",
      note: "Charges travel and field expense to P&L",
    },
    credit: {
      account: "Corporate M-PESA Cash Book / Bank",
      code: "1020-MPESA",
      type: "Asset (Credit Disburses Cash)",
      note: "Instant reimbursement sent to employee phone/account",
    },
    portalAction: "Open Staff Claims Hub > Click 'Approve' > Click 'Disburse & Post to GL'",
    portalLink: "/finance/staff-claims",
    exampleData: {
      amount: "KES 14,500.00",
      partner: "Field Engineer (Staff Claim)",
      division: "Infrastructure Deployment",
      ledgerBook: "Travel & Subsistence",
      paymentMethod: "M-PESA B2C Disbursement",
    },
  },
];


export default function FinanceGuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "direct-sales-guide": true,
    "expenses-guide": true,
    "invoicing-settlement-guide": true,
    "crm-kanban-guide": true,
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
    chk7: false,
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
              Enterprise ERP & CRM <span className="text-emerald-400">Operational Guides</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Step-by-step Standard Operating Procedures (SOPs), Double-Entry Accounting rules, Point-of-Sale direct billing, Expense Management, and General Ledger posting standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/finance/sales/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 group"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Point of Sale
            </Link>
            <Link
              href="/finance/expenses/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20 group"
            >
              <TrendingDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Log Expense
            </Link>
            <Link
              href="/finance/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 group"
            >
              <Receipt className="w-4 h-4 group-hover:scale-110 transition-transform" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides (e.g. POS sales, expenses, USD bills, reversals, GL posting, Kanban)..."
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

      {/* Section 1: Direct Sales & Point of Sale (POS) Studio Guide */}
      {(selectedCategory === "all" || selectedCategory === "direct-sales") && (
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("direct-sales-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-emerald-50/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Direct Sales & Point-of-Sale (POS) Playbook
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Walk-in & Retail
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  How to book sales immediately for walk-in clients without requiring registered partners, with 1-click automatic GL settlement.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["direct-sales-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["direct-sales-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Context Banner */}
              <div className="p-4 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Zero Friction Point-of-Sale Architecture
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
                    For walk-in customers or one-off transactions, you do <strong>NOT</strong> need to register a corporate partner first. Simply input the client&apos;s name, phone (e.g. for M-PESA), and email in the Direct Sale Studio.
                  </p>
                </div>
                <Link
                  href="/finance/sales/new"
                  className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider whitespace-nowrap self-start"
                >
                  Open POS Studio
                </Link>
              </div>

              {/* 3 Pillars of POS Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Inline Customer Intake</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter customer details on the fly. The system handles walk-in clients gracefully and stamps their contact information directly onto the invoice and receipt parchment.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Live Parchment Preview</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Watch the official digital tax document render in real-time as you add catalog items, adjust quantities, and calculate subtotal and VAT balances.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">1-Click Instant Settlement</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Toggle <strong>&quot;Settle & Mark as Paid Immediately&quot;</strong> to auto-post the General Ledger journal batch (Bank Debit $\rightarrow$ Revenue Credit), issue an official payment receipt, and mark status as <code>PAID</code>.
                  </p>
                </div>
              </div>

              {/* POS Journal Batch Diagram */}
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  Automatic GL Double-Entry for Instant POS Settlement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-emerald-100 space-y-1">
                    <span className="font-bold text-emerald-700">DEBIT: Liquid Book (1010-BNK / 1020-MPESA)</span>
                    <p className="text-slate-600">
                      Increases liquid cash or M-PESA balance with the full gross settlement amount.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-emerald-100 space-y-1">
                    <span className="font-bold text-emerald-700">CREDIT: Revenue (4010-REV) + VAT (2020-VAT)</span>
                    <p className="text-slate-600">
                      Recognizes earned gross sales revenue and accrues output tax liability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Operating Expenses & Outflow Studio Guide */}
      {(selectedCategory === "all" || selectedCategory === "expenses-hub") && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("expenses-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-rose-50/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Operating Expenses & Disbursements Management SOP
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    COA 6xxx Taxonomy
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  Standard workflow for logging departmental expenses, vendor payments, and operational cash outflows.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["expenses-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["expenses-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Context */}
              <div className="p-4 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4" />
                    Departmental Disbursement Architecture
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
                    All company disbursements are classified under the <strong>6xxx Operating Expense</strong> series (Rent, Utilities, Software, Salaries, Logistics). Every expense entry automatically creates a balanced General Ledger batch.
                  </p>
                </div>
                <Link
                  href="/finance/expenses/new"
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap self-start"
                >
                  Log Expense
                </Link>
              </div>

              {/* How to Log Expense */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-rose-700 uppercase">Step 1: Select Category</span>
                  <p className="text-slate-600">
                    Choose from predefined Chart of Accounts expense heads (e.g. <code>6100-Cloud Hosting</code>, <code>6200-Office Rent</code>, <code>6300-Legal & Professional</code>).
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-rose-700 uppercase">Step 2: Pick Disbursing Book</span>
                  <p className="text-slate-600">
                    Select the paying source: Bank Account (<code>1010-BNK</code>), M-PESA Paybill (<code>1020-MPESA</code>), or Petty Cash (<code>1030-CSH</code>).
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-rose-700 uppercase">Step 3: GL Audit Stamping</span>
                  <p className="text-slate-600">
                    Submit the form to generate an immutable journal batch with instant live reflection on the executive KPI ribbon and P&L statements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Invoicing, Quotations & Receipts Settlement SOP */}
      {(selectedCategory === "all" || selectedCategory === "billing-sales") && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("invoicing-settlement-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-blue-50/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Commercial Invoicing, Proposals & Receipts Settlement SOP
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    GL Posting & Settlement
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  Lifecycle from Commercial Quotation $\rightarrow$ Tax Invoice $\rightarrow$ GL Posting $\rightarrow$ Payment Receipt Allocation $\rightarrow$ Settlement Meters.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["invoicing-settlement-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["invoicing-settlement-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              {/* Lifecycle Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Proposal</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Commercial Quotation</h5>
                  <p className="text-xs text-slate-600">
                    Draft proposals in the full-page studio. Send to prospects or 1-click convert directly to a Tax Invoice.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Draft Invoice</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Tax Invoice Studio</h5>
                  <p className="text-xs text-slate-600">
                    Create invoices with live parchment preview, designated receiving payment accounts, and payment terms.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">GL Accrual</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Approve & Post to GL</h5>
                  <p className="text-xs text-slate-600">
                    Locks invoice against tampering. Automatically creates Accounts Receivable (<code>1200-AR</code>) Debit and Revenue Credit.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Settled</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Receipt Allocation</h5>
                  <p className="text-xs text-slate-600">
                    Record payment receipts to debit Bank and clear AR. Live progress meters transition from 0% $\rightarrow$ 100% PAID.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 4: CRM Sales Pipeline & Kanban SOP */}
      {(selectedCategory === "all" || selectedCategory === "crm-pipeline") && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("crm-kanban-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-amber-50/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    CRM Sales Pipeline & Visual Kanban SOP
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Opportunity Progression
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  Managing leads across stages (New $\rightarrow$ Contacted $\rightarrow$ Qualified $\rightarrow$ Proposal Sent $\rightarrow$ Won), pipeline valuation, and proposal conversion.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["crm-kanban-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["crm-kanban-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
                {[
                  { stage: "NEW", desc: "Fresh prospect intake", color: "bg-slate-100 text-slate-700" },
                  { stage: "CONTACTED", desc: "Outreach initiated", color: "bg-blue-100 text-blue-700" },
                  { stage: "QUALIFIED", desc: "Budget & scope fit", color: "bg-purple-100 text-purple-700" },
                  { stage: "PROPOSAL_SENT", desc: "Quote dispatched", color: "bg-amber-100 text-amber-700" },
                  { stage: "WON", desc: "Deal closed & invoice ready", color: "bg-emerald-100 text-emerald-700" },
                  { stage: "LOST", desc: "Declined / archived", color: "bg-rose-100 text-rose-700" },
                ].map((s) => (
                  <div key={s.stage} className="p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", s.color)}>
                      {s.stage}
                    </span>
                    <p className="text-[11px] text-slate-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 5: Transaction Immutability & Automated Reversals */}
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

      {/* Section 6: Foreign Currency & USD Card Billing Guide */}
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
      {(selectedCategory === "all" || selectedCategory === "principles" || selectedCategory === "direct-sales" || selectedCategory === "expenses-hub" || selectedCategory === "billing-sales" || selectedCategory === "crm-pipeline" || selectedCategory === "bulk-studio" || selectedCategory === "forex-usd" || selectedCategory === "immutability-reversals") && (
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
              {SIMULATION_SCENARIOS.length} Scenarios Available
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Scenarios List (Left Column) */}
            <div className="lg:col-span-5 p-4 space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
              {SIMULATION_SCENARIOS.map((scenario, index) => {
                const isSelected = selectedScenarioIndex === index;
                return (
                  <button
                    key={scenario.title}
                    onClick={() => setSelectedScenarioIndex(index)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3",
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-500/50 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded",
                            scenario.type === "MONEY_IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : scenario.type === "MONEY_OUT"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          )}
                        >
                          {scenario.type.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {scenario.category}
                        </span>
                      </div>
                      <h4
                        className={cn(
                          "text-xs font-bold leading-snug line-clamp-2",
                          isSelected ? "text-emerald-950" : "text-slate-800"
                        )}
                      >
                        {scenario.title}
                      </h4>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 flex-shrink-0 mt-1 transition-transform",
                        isSelected ? "text-emerald-600 translate-x-1" : "text-slate-300"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Simulation Preview & GL Blueprint (Right Column) */}
            <div className="lg:col-span-7 p-6 bg-slate-50/50 space-y-6">
              {activeScenario && (
                <>
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        {activeScenario.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Standard Operational Voucher
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{activeScenario.title}</h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {activeScenario.description}
                    </p>
                  </div>

                  {/* Debit vs Credit Balanced Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DEBIT CARD */}
                    <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-2.5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          DEBIT (DR)
                        </span>
                        <code className="text-xs font-mono font-bold text-slate-700">
                          {activeScenario.debit.code}
                        </code>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {activeScenario.debit.account}
                        </h4>
                        <span className="text-[11px] text-blue-600 font-medium block mt-0.5">
                          {activeScenario.debit.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                        {activeScenario.debit.note}
                      </p>
                    </div>

                    {/* CREDIT CARD */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm space-y-2.5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          CREDIT (CR)
                        </span>
                        <code className="text-xs font-mono font-bold text-slate-700">
                          {activeScenario.credit.code}
                        </code>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {activeScenario.credit.account}
                        </h4>
                        <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                          {activeScenario.credit.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                        {activeScenario.credit.note}
                      </p>
                    </div>
                  </div>

                  {/* Sample Transaction Data Payload */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Example Portal Payload
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        {activeScenario.exampleData.amount}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[10px]">Entity / Partner</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {activeScenario.exampleData.partner}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[10px]">Division</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {activeScenario.exampleData.division}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[10px]">Ledger Book</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {activeScenario.exampleData.ledgerBook}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-50">
                        <span className="text-slate-400 block text-[10px]">Disbursing Method</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {activeScenario.exampleData.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>
                          <strong>Recommended action:</strong> {activeScenario.portalAction}
                        </span>
                      </div>
                      <Link
                        href={activeScenario.portalLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap transition-colors self-start sm:self-auto"
                      >
                        <span>Open Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide Section: Fiscal Cycles & Period Locks (Standard Month-End SOP) */}
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
                  Interactive 7-step checklist for monthly financial closing and audit period freezing.
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
                    title: "1. Post all Pending Direct Sales & Retail Transactions",
                    desc: "Ensure all walk-in POS transactions and cash/M-PESA sales for the month are posted to the General Ledger.",
                    link: "/finance/sales/new",
                    linkText: "Check POS Sales",
                  },
                  {
                    id: "chk2",
                    title: "2. Audit Operational Expenses & Disbursed Outflows",
                    desc: "Review all 6xxx operating expenses, vendor disbursements, and USD card payments logged during the cycle.",
                    link: "/finance/expenses",
                    linkText: "Review Expenses",
                  },
                  {
                    id: "chk3",
                    title: "3. Bank & M-PESA Reconciliation",
                    desc: "Verify that Bank Ledger closing balances match physical bank statements and Safaricom Paybill settlements.",
                    link: "/finance/reports/gl-statement",
                    linkText: "View GL Statements",
                  },
                  {
                    id: "chk4",
                    title: "4. Review Accounts Receivable & Outstanding Invoices",
                    desc: "Audit all unpaid client invoices. Follow up on overdue receivables and allocate cleared payment receipts.",
                    link: "/finance/invoices",
                    linkText: "Review Invoices",
                  },
                  {
                    id: "chk5",
                    title: "5. Post End-of-Month Adjustments & Depreciation",
                    desc: "Post manual journal entries for asset depreciation, prepayments, and accrued supplier expenses.",
                    link: "/finance/journal-entries",
                    linkText: "New Journal Entry",
                  },
                  {
                    id: "chk6",
                    title: "6. Generate Trial Balance & Verify Zero Discrepancy",
                    desc: "Inspect the Trial Balance to confirm Total Debits equal Total Credits with zero suspense discrepancies.",
                    link: "/finance/reports",
                    linkText: "Financial Reports",
                  },
                  {
                    id: "chk7",
                    title: "7. Lock Financial Month Period",
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

      {/* Guide Section: Accounts Receivable (AR) Aging Matrix & Statement of Account */}
      {(selectedCategory === "all" || selectedCategory === "ar-aging") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("ar-aging-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Accounts Receivable (AR) Aging Matrix &amp; Customer Statement SOP
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    DSO &amp; Collections
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Standard operating procedure for tracking debtor aging buckets (0-30, 31-60, 61-90, 90+), measuring Days Sales Outstanding (DSO), and issuing 1-click Statements of Account (SOA).
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["ar-aging-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["ar-aging-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 uppercase block text-[10px]">0-30 Days (Current)</span>
                  <p className="text-slate-600 mt-1">Normal credit window. Customer invoices are within standard payment grace period.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800 uppercase block text-[10px]">31-60 Days</span>
                  <p className="text-slate-600 mt-1">Early follow-up. First reminder email triggered with attached Statement of Account.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-orange-50 border border-orange-200">
                  <span className="font-bold text-orange-800 uppercase block text-[10px]">61-90 Days</span>
                  <p className="text-slate-600 mt-1">Escalated collection. Direct phone inquiry and finance credit restriction warning.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="font-bold text-rose-800 uppercase block text-[10px]">90+ Days (Critical)</span>
                  <p className="text-slate-600 mt-1">Critical default risk. Service hold enacted; executive director intervention required.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 text-white space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Days Sales Outstanding (DSO) Formula:
                </h4>
                <p className="font-mono text-xs text-slate-200">
                  DSO = (Total Accounts Receivable / Total Credit Sales) &times; Number of Days
                </p>
                <p className="text-[11px] text-slate-400">
                  Target: &le; 35 Days. A rising DSO indicates collection bottlenecks or billing disputes requiring immediate customer statement dispatch.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>View live company-wide debtor aging schedule &amp; generate customer statements:</span>
                </div>
                <Link
                  href="/finance/reports/ar-aging"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm"
                >
                  Open AR Aging Matrix
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section: Accounts Payable (AP) & Cash Outflow Runway Planner */}
      {(selectedCategory === "all" || selectedCategory === "vendor-bills") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("vendor-bills-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Vendor Bills (AP) Accrual &amp; Cash Outflow Runway Planner
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 uppercase tracking-wider">
                    Payables &amp; Working Capital
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Double-entry accrual mechanics for supplier invoices, disbursement recording, and 7-day liquidity runway monitoring.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["vendor-bills-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["vendor-bills-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Stage 1: Booking &amp; Posting Supplier Invoice (AP Accrual)
                  </h4>
                  <div className="font-mono text-xs space-y-1">
                    <p className="text-emerald-700"><strong>DEBIT:</strong> 6xxx Operating Expense (e.g. 6110 Software)</p>
                    <p className="text-rose-700"><strong>CREDIT:</strong> 2010 Accounts Payable (AP Liability)</p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Recognizes the expense in the correct accounting period even before cash leaves the bank account.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Stage 2: Disbursing Payment to Vendor (Settlement)
                  </h4>
                  <div className="font-mono text-xs space-y-1">
                    <p className="text-emerald-700"><strong>DEBIT:</strong> 2010 Accounts Payable (Clears Liability)</p>
                    <p className="text-rose-700"><strong>CREDIT:</strong> 1010 Commercial Bank Account (Reduces Cash)</p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Settles the liability, reduces vendor balance due to 0.00, and records payment reference number.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  7-Day Liquidity Runway Rule:
                </h4>
                <p className="text-xs text-slate-700">
                  Total Liquid Reserves (Bank + Cash) must always exceed <strong>Immediate Outflows (Overdue AP + Bills Due in 7 Days + Approved Staff Claims)</strong>. If net projected runway is negative, hold non-essential disbursements until receivables are collected.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/finance/vendor-bills"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  Manage Vendor Bills (AP)
                </Link>
                <Link
                  href="/finance/reports/cash-outflow"
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                >
                  Open Cash Outflow Planner
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section: Kenyan Statutory Payroll Engine & Staff Claims */}
      {(selectedCategory === "all" || selectedCategory === "payroll-statutory") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("payroll-statutory-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Kenyan Statutory Payroll Deductions &amp; Staff Reimbursements Guide
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                    Statutory Compliance
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Exact Kenyan tax compliance formulas (PAYE, NSSF Tier 1/2, SHIF 2.75%, Housing Levy 1.5%) and automated 4-leg GL posting.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["payroll-statutory-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["payroll-statutory-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="font-bold text-purple-800 uppercase block text-[10px]">1. NSSF (Act 2013)</span>
                  <p className="text-slate-600 mt-1 font-mono text-[11px]">
                    Tier 1: 6% up to 7,000 (Max 420)<br />
                    Tier 2: 6% 7,001-36,000 (Max 1,740)<br />
                    <strong>Total Cap: KES 2,160.00</strong>
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="font-bold text-blue-800 uppercase block text-[10px]">2. PAYE (KRA Tax)</span>
                  <p className="text-slate-600 mt-1 text-[11px]">
                    Taxable = Gross - NSSF.<br />
                    Graduated bands (10% to 35%) minus <strong>KES 2,400.00 Monthly Personal Relief</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200">
                  <span className="font-bold text-teal-800 uppercase block text-[10px]">3. SHIF (Health)</span>
                  <p className="text-slate-600 mt-1 text-[11px]">
                    <strong>2.75% of Gross Remuneration</strong>.<br />
                    Statutory floor minimum: KES 300.00.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800 uppercase block text-[10px]">4. Housing Levy (AHL)</span>
                  <p className="text-slate-600 mt-1 text-[11px]">
                    <strong>1.5% of Gross Remuneration</strong>.<br />
                    Remitted monthly to KRA alongside PAYE.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 text-white space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Automated 4-Leg Double-Entry GL Journal Posting:
                </h4>
                <div className="font-mono text-xs space-y-1">
                  <p className="text-emerald-400"><strong>DEBIT:</strong> 6010 Salaries &amp; Wages Expense (Total Gross Remuneration)</p>
                  <p className="text-blue-400"><strong>CREDIT:</strong> 2040 PAYE Tax Payable (KRA Liability)</p>
                  <p className="text-purple-400"><strong>CREDIT:</strong> 2050 Statutory Deductions Payable (NSSF + SHIF + AHL)</p>
                  <p className="text-teal-400"><strong>CREDIT:</strong> 1010 Operating Bank Account (Net Salaries Disbursed)</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/finance/payroll"
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Launch Payroll Studio
                </Link>
                <Link
                  href="/finance/staff-claims"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                >
                  Manage Staff Expense Claims
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section: Interactive General Ledger Audit Drill-Downs */}
      {(selectedCategory === "all" || selectedCategory === "audit-drilldowns") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("audit-drilldown-guide")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Interactive General Ledger Audit Drill-Down &amp; Month Reopen SOP
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                    Audit Transparency
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  How to inspect underlying chronological journal entries directly from financial reports and the director month reopen procedure.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-slate-400 transition-transform",
                expandedSections["audit-drilldown-guide"] && "rotate-180"
              )}
            />
          </button>

          {expandedSections["audit-drilldown-guide"] && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    1. 1-Click Report Drill-Down Drawer
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Clicking on any account row on the <strong>Trial Balance</strong>, <strong>P&amp;L</strong>, or <strong>Balance Sheet</strong> opens the real-time Ledger Drawer. It displays:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Opening balance brought forward</li>
                    <li>Itemized journal codes and transaction dates</li>
                    <li>Counterparty partner details and memos</li>
                    <li>Debit / Credit movements and calculated running balances</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    2. Director Month Reopen Policy
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Closed financial months are locked to prevent retroactive alteration. Only authorized <strong>Managing Directors</strong> or Finance Leads can reopen a month via <code>POST /api/v1/financialmonths/{'{ref}'}/reopen/</code> with mandatory justification logged in the audit trail.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span>Inspect active trial balance and drill down into general ledger books:</span>
                </div>
                <Link
                  href="/finance/reports"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-semibold transition-colors shadow-sm"
                >
                  Open Financial Reports
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Section: Common FAQs & Trouble-Shooting */}

      {(selectedCategory === "all" || selectedCategory === "immutability-reversals" || selectedCategory === "forex-usd" || selectedCategory === "direct-sales" || selectedCategory === "expenses-hub" || selectedCategory === "billing-sales" || selectedCategory === "ledger-reports") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Finance FAQs & Audit Best Practices</h3>
              <p className="text-xs text-slate-500">
                Quick answers to common day-to-day accounting, POS billing, expenses, forex, reversals, and portal operations questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Q: Can I book a sale without creating a registered partner?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Yes!</strong> Navigate to <strong>Direct Sales (POS)</strong> at <code>/finance/sales/new</code>. You can enter walk-in customer names, phone numbers, and emails directly. Toggling &quot;Settle Immediately&quot; automatically posts balanced GL entries and issues an official receipt.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                Q: When does a Tax Invoice post to the General Ledger?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invoices remain in <code>DRAFT</code> until approved. Clicking <strong>&quot;Approve & Post to GL&quot;</strong> locks the document, debits Accounts Receivable (<code>1200-AR</code>), and credits Revenue (<code>4010-REV</code>). When receipts are recorded, cash is debited and AR is credited.
              </p>
            </div>

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
                Q: How do we record USD invoices charged to our KES corporate card?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record the <strong>exact KES amount</strong> debited on your bank/card statement. This includes all card processing and FX conversion charges, ensuring your bank ledger perfectly reconciles with zero FX suspense variance. Include the USD amount in the description memo.
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
              Jump straight to the transaction studios or launch the Chart of Accounts ledger.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/finance/sales/new"
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
          >
            Direct Sale (POS)
          </Link>
          <Link
            href="/finance/expenses/new"
            className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20"
          >
            Log Expense
          </Link>
          <Link
            href="/finance/invoices/new"
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20"
          >
            New Invoice
          </Link>
          <Link
            href="/finance/coa"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all border border-slate-700"
          >
            Chart of Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}
