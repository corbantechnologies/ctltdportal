export interface ProjectHighlight {
  title: string;
  desc: string;
  iconName: string;
}

export interface ProjectBenefit {
  title: string;
  desc: string;
}

export interface ProjectModule {
  title: string;
  desc: string;
  items: string[];
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface MockupMetric {
  label: string;
  value: string;
  trend?: string;
}

export interface MockupLedgerItem {
  title: string;
  subtitle: string;
  amount?: string;
  status?: string;
}

export interface ProjectPricing {
  model: string;
  startingAt?: string;
  description: string;
  featuresIncluded: string[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  shortTag: string;
  statusBadge: string;
  statusTone: "emerald" | "blue" | "amber";
  liveDomain: string;
  liveUrl: string;
  heroHeadline: string;
  summary: string;
  benefits: ProjectBenefit[];
  highlights: ProjectHighlight[];
  modules: ProjectModule[];
  specs: ProjectSpec[];
  pricing: ProjectPricing;
  techStack: string[];
  mockup: {
    browserUrl: string;
    windowTitle: string;
    metrics: MockupMetric[];
    ledgerItems: MockupLedgerItem[];
  };
}

export interface CategoryItem {
  id: string;
  slug: string;
  rank: number;
  name: string;
  folderName: string;
  tagline: string;
  description: string;
  iconName: string;
  statusBadge: string;
  projectCount: number;
  projectSlugs: string[];
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "sacco",
    slug: "sacco",
    rank: 1,
    name: "SACCO & Cooperative Technology",
    folderName: "Sacco",
    tagline: "Core banking, multi-pot savings & automated loan management for Kenyan cooperatives",
    description:
      "Enterprise core banking engine tailored for Kenyan SACCOs, chamas, and microfinance institutions. Delivers double-entry GL accounting, member self-service portals, teller workflows, and Safaricom Daraja M-Pesa automated reconciliation.",
    iconName: "Building2",
    statusBadge: "3 Live SACCO Deployments",
    projectCount: 1,
    projectSlugs: ["wananchi-mali"],
  },
  {
    id: "finance",
    slug: "finance",
    rank: 2,
    name: "Finance Suite & Intelligence",
    folderName: "Finance",
    tagline: "Double-entry SME general ledgers, eTIMS point-of-sale, statutory payroll & financial media",
    description:
      "Comprehensive financial technology suite featuring Manna Books (our flagship double-entry accounting SaaS with eTIMS thermal POS and statutory payroll) and FedhaHub (financial publication and dividend analytics intelligence).",
    iconName: "BookOpen",
    statusBadge: "Flagship Accounting & Media",
    projectCount: 2,
    projectSlugs: ["mannabooks", "fedhahub"],
  },
  {
    id: "gift-shop",
    slug: "gift-shop",
    rank: 3,
    name: "Gift Shop & Omnichannel Retail",
    folderName: "Gift Shop",
    tagline: "E-commerce customer storefronts, multi-till shift management & cashier POS registers",
    description:
      "End-to-end commerce platforms uniting digital customer e-shops with physical store cashier POS registers. Powers live brands including GearHouse Africa (hardware retail & POS tills) and Clate Cosmetics (online beauty shop & checkout).",
    iconName: "ShoppingBag",
    statusBadge: "Live Deployments (GearHouse & Clate)",
    projectCount: 2,
    projectSlugs: ["gearhouse", "clate-cosmetics"],
  },
  {
    id: "marketing",
    slug: "marketing",
    rank: 4,
    name: "Marketing & Telecom Engine",
    folderName: "Marketing",
    tagline: "Alphanumeric Sender ID dispatch, prepaid SMS wallets & audience CRM funnels",
    description:
      "High-throughput telecom messaging and marketing operations engine. In live client pilot with LJK Marketing Agency, delivering certified alphanumeric sender ID routes, 1-click CSV audience imports, and automated M-Pesa billing.",
    iconName: "Send",
    statusBadge: "Client Pilot (LJK Marketing)",
    projectCount: 1,
    projectSlugs: ["ljk-marketing"],
  },
  {
    id: "logistics",
    slug: "logistics",
    rank: 5,
    name: "Logistics & Fleet OS",
    folderName: "Logistics",
    tagline: "Waybill Code-128 barcodes, multi-hub routes & OTP digital proof of delivery",
    description:
      "Operating system for freight forwarders, couriers, and regional transporters. Simplifies parcel waybill intake, fleet route manifests between Mombasa and Nairobi, driver trip sheets, and recipient digital proof of delivery.",
    iconName: "Truck",
    statusBadge: "In Development · Private Beta",
    projectCount: 1,
    projectSlugs: ["ct-drive"],
  },
  {
    id: "events",
    slug: "events",
    rank: 6,
    name: "Event Ticketing & Passes",
    folderName: "Events",
    tagline: "Frictionless M-Pesa ticketing, anti-counterfeit QR passes & sub-0.4s gate scanning",
    description:
      "High-speed event ticketing ecosystem for concert organizers, sports venues, and conferences. Provides instant Safaricom Daraja STK Push ticket checkout, encrypted QR passes, mobile steward gate scanners, and organizer revenue settlements.",
    iconName: "Ticket",
    statusBadge: "Sherehe Live Platform",
    projectCount: 1,
    projectSlugs: ["sherehe"],
  },
];

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "wananchi-mali",
    slug: "wananchi-mali",
    categorySlug: "sacco",
    categoryName: "SACCO & Cooperative Technology",
    name: "Wananchi Mali SACCO Core Platform",
    shortTag: "Wananchi Mali",
    statusBadge: "3 Kenyan SACCOs Live",
    statusTone: "emerald",
    liveDomain: "wananchimali.com",
    liveUrl: "https://www.wananchimali.com/",
    heroHeadline: "Digital Core Banking Engine for Kenyan SACCOs, Chamas & Cooperatives",
    summary:
      "Wananchi Mali is Corban Technologies' core banking platform powering 3 live Kenyan cooperative societies. Integrates complete member self-service portals, branch teller consoles, multi-pot savings (Share Capital, Deposits, Holiday, Emergency), dual-interest loan engines (Diminishing Balance & Flat Rate), digital guarantor workflows, automated double-entry GL ledgers, and Safaricom Daraja M-Pesa integration.",
    benefits: [
      {
        title: "Automated Member Onboarding & KYC",
        desc: "Digitize member registration with Next of Kin (NOK) allocation percentages and role-based access control.",
      },
      {
        title: "Sub-Second M-Pesa Reconciliation",
        desc: "Instant member deposit credits via Daraja STK Push and automated B2C loan disbursements with webhook verification.",
      },
      {
        title: "Guarantor Risk Mitigation",
        desc: "Digital guarantor request pipeline verifying member savings coverage before loan disbursement approval.",
      },
      {
        title: "Real-Time Financial Integrity",
        desc: "Automated double-entry posting on every transaction with instant Balance Sheet, Trial Balance, and P&L statements.",
      },
    ],
    highlights: [
      {
        iconName: "Users",
        title: "Member Directory & KYC Profiles",
        desc: "Member profile onboarding, Next of Kin (NOK) allocation percentages, role permissions, and active member audit exports.",
      },
      {
        iconName: "PiggyBank",
        title: "Multi-Pot Savings & Venture Pools",
        desc: "Share Capital, Monthly Deposits, Holiday, Emergency pots, and Venture investment pools with individual running statements.",
      },
      {
        iconName: "CreditCard",
        title: "Dual Loan Engine & Guarantors",
        desc: "Diminishing Balance and Flat Rate interest engines, digital guarantor approval requests, loan top-ups, processing fees, and penalties.",
      },
      {
        iconName: "Smartphone",
        title: "Safaricom Daraja Rails",
        desc: "Instant C2B STK Push deposits, automated B2C loan disbursements, and webhook callback reconciliation.",
      },
      {
        iconName: "BookOpen",
        title: "Double-Entry General Ledger",
        desc: "Real-time Chart of Accounts (COA), journal batches, Balance Sheet, Trial Balance, and Profit & Loss reports.",
      },
      {
        iconName: "BarChart3",
        title: "Venture Pools & AGM Dividends",
        desc: "Venture investment pool management, weighted average share capital dividend calculations, and batch distribution.",
      },
    ],
    modules: [
      {
        title: "Member Self-Service Portal",
        desc: "Responsive portal giving members 24/7 visibility into balances, statements, and loan applications.",
        items: [
          "Instant savings deposits via Safaricom Daraja STK Push",
          "Loan application with automated savings eligibility appraisal",
          "Digital guarantor requests with instant SMS/email approvals",
          "Per-pot statement downloads and transaction history",
          "Next of Kin (NOK) percentage allocation and profile updates",
        ],
      },
      {
        title: "Branch Operations & Teller Console",
        desc: "Operations console for SACCO tellers, loan officers, and branch managers.",
        items: [
          "Bulk CSV upload for deposits, recurring fees, and loan repayments",
          "Multi-stage loan approval pipeline with guarantor coverage verification",
          "Automated B2C M-Pesa loan disbursement upon approval",
          "Member KYC directory with active balance summaries",
          "Daily cash book and teller reconciliation sheets",
        ],
      },
      {
        title: "Core Double-Entry General Ledger",
        desc: "Financial accounting engine built from the ground up for cooperative compliance.",
        items: [
          "Automatic double-entry posting on every deposit, loan, and fee",
          "Real-time Trial Balance, Balance Sheet, and P&L generation",
          "Manual journal batches for adjustments and bank reconciliation",
          "Year-based financial filtering and multi-year audit logs",
          "Debtors aging analysis and non-performing loan provisions",
        ],
      },
      {
        title: "Venture Pools & Dividend Calculations",
        desc: "Venture investment pool management and AGM dividend distribution computations.",
        items: [
          "Venture investment pool deposits and dividend tracking",
          "Weighted average share capital dividend calculations",
          "Customizable dividend payout rates approved at AGMs",
          "One-click batch distribution directly into member savings pots",
          "Exportable AGM member dividend schedules",
        ],
      },
    ],
    specs: [
      { label: "Active Deployments", value: "3 Kenyan SACCOs in Production" },
      { label: "Portal Access", value: "wananchimali.com" },
      { label: "Accounting Engine", value: "Strict Double-Entry GL" },
      { label: "Payment Rails", value: "Safaricom Daraja STK & B2C" },
      { label: "Security", value: "Tenant Schema Isolation & Audit Logs" },
      { label: "Cloud Hosting", value: "Dedicated GCP Compute & Postgres" },
    ],
    pricing: {
      model: "Enterprise Tier & Member-Based Annual SLA",
      description:
        "Tailored for Kenyan SACCOs and chamas based on active member volume, dedicated tenant cloud deployment, and 24/7 technical support.",
      featuresIncluded: [
        "Full Member & Branch Admin Portals",
        "Unlimited Double-Entry Journal Entries",
        "Safaricom Daraja API Credentials Setup",
        "Automated Daily Database Backups",
        "AGM Dividend Computation Support",
      ],
    },
    techStack: ["Next.js 15", "Django REST Framework", "PostgreSQL", "Daraja API"],
    mockup: {
      browserUrl: "https://www.wananchimali.com/admin/dashboard",
      windowTitle: "Wananchi Mali SACCO — Branch Core Management",
      metrics: [
        { label: "Total Asset Base", value: "KES 42.8M", trend: "+14% MoM" },
        { label: "Active Members", value: "1,420+", trend: "3 Cooperatives" },
        { label: "M-Pesa Collections", value: "KES 8.4M", trend: "Real-time" },
      ],
      ledgerItems: [
        {
          title: "M-Pesa STK Deposit — Account #WM-4091",
          subtitle: "Member: J. Mwangi · Share Capital Pot",
          amount: "+KES 15,000.00",
          status: "Cleared",
        },
        {
          title: "Loan Disbursement — Diminishing Balance",
          subtitle: "Approved by SACCO Admin · B2C Daraja",
          amount: "-KES 150,000.00",
          status: "Disbursed",
        },
      ],
    },
  },
  {
    id: "mannabooks",
    slug: "mannabooks",
    categorySlug: "finance",
    categoryName: "Finance Suite & Intelligence",
    name: "Manna Books — SME General Ledger & Accounting",
    shortTag: "Manna Books",
    statusBadge: "Flagship Accounting SaaS",
    statusTone: "blue",
    liveDomain: "mannabooks.co.ke",
    liveUrl: "https://www.mannabooks.co.ke/",
    heroHeadline: "Modern Double-Entry Bookkeeping, Invoicing, eTIMS POS & General Ledger for SMEs",
    summary:
      "Manna Books is Corban Technologies' flagship accounting SaaS engineered for East African SMEs. Features structured 5-class Chart of Accounts, quotes-to-invoice workflow, walk-in counter POS with continuous 58mm/80mm eTIMS thermal printing, statutory payroll (PAYE, SHIF 2.75%, AHL 1.5%, NSSF Tier I/II), multi-location inventory with 1-click discrepancy reconciler, and real-time Balance Sheet and P&L ledgers.",
    benefits: [
      {
        title: "Eliminate Spreadsheets with 5-Class GL",
        desc: "Structured Chart of Accounts spanning Assets, Liabilities, Equity, Income, and Expenses with automated debit/credit balancing.",
      },
      {
        title: "Zero-Click Silent Kiosk eTIMS POS",
        desc: "Counter point-of-sale register with Cash change calculator, M-Pesa STK, and continuous 58mm/80mm thermal ticket printing.",
      },
      {
        title: "Automated Kenyan Statutory Payroll",
        desc: "Run payroll for salaried and casual staff with automated PAYE tax bands, personal relief, SHIF, AHL, and 11-column A4 PDF vouchers.",
      },
      {
        title: "Multi-Location Inventory Reconciler",
        desc: "Synchronize stock across warehouses and align quantities with a single click using the 1-Click Discrepancy Reconciler.",
      },
    ],
    highlights: [
      {
        iconName: "Store",
        title: "Walk-in POS & Thermal Printing",
        desc: "Rapid counter sales register supporting M-Pesa, Cash (change calculator), and continuous 58mm/80mm thermal ticket printing with KRA eTIMS QR codes.",
      },
      {
        iconName: "BookOpen",
        title: "5-Class Double-Entry General Ledger",
        desc: "Structured Chart of Accounts (Assets, Liabilities, Equity, Income, Expense), automated journal posting, Balance Sheets, and Bank & M-Pesa CSV reconciliations.",
      },
      {
        iconName: "Receipt",
        title: "Fiscal Ledgers & Quotation Expiry",
        desc: "Invoices, Receipts, Quotations, LPOs, Delivery Notes, Credit Notes, dynamic row VAT (16%, 0%, Exempt), and validity presets with automated expiry sweep.",
      },
      {
        iconName: "Coins",
        title: "Statutory Payroll & Wage Compiler",
        desc: "Salaried and casual payroll runs with automated PAYE tax bands, personal relief, SHIF (2.75%), AHL (1.5%), and NSSF Tier I & II voucher PDFs.",
      },
      {
        iconName: "Boxes",
        title: "Multi-Location Inventory & Reconciler",
        desc: "Stock tracking across warehouses, LPO/GRN receiving, stock transfers, and 1-click discrepancy inventory alignment.",
      },
      {
        iconName: "BarChart3",
        title: "Financial Intelligence & 20th VAT Tracker",
        desc: "6/12-month cash flows, Top 10 clients leaderboard, Product vs Service split, 0–90+ day A/R aging matrix, and 20th monthly VAT tracker.",
      },
    ],
    modules: [
      {
        title: "Walk-in POS & Retail Register",
        desc: "High-speed point-of-sale register for walk-in counter sales.",
        items: [
          "Cash payment method with built-in change calculator",
          "M-Pesa payment method with instantaneous confirmation",
          "Continuous 58mm / 80mm thermal ticket receipt printing",
          "KRA eTIMS CU verification QR code inclusion",
          "Zero-click silent kiosk printing mode for retail counters",
        ],
      },
      {
        title: "Double-Entry General Ledger & Balance Sheet",
        desc: "Full 5-class double-entry accounting suite.",
        items: [
          "Structured Chart of Accounts (COA) hierarchy across all 5 financial classes",
          "Balance Sheet (Statement of Financial Position) and Profit & Loss generation",
          "Automated Bank and M-Pesa CSV bank reconciliation",
          "Multi-month operating budget planning with 1-click month cloning",
          "Running General Ledger statement downloads per individual account code",
        ],
      },
      {
        title: "Statutory Payroll & Wage Compiler",
        desc: "Full Kenyan statutory payroll execution for salaried staff and casual wages.",
        items: [
          "Employee directory with basic pay, allowances, and tax relief settings",
          "Automated PAYE tax bracket calculation with personal relief",
          "Statutory deductions: SHIF (2.75%), AHL (1.5%), and NSSF Tier I & II",
          "11-column A4 Landscape payroll voucher PDF generation",
          "Automatic payroll expense journal posting directly to General Ledger",
        ],
      },
      {
        title: "Multi-Location Inventory & Discrepancy Reconciler",
        desc: "Warehouse inventory management with automated stock inflow.",
        items: [
          "Multi-location stock balance tracking across physical warehouses",
          "Receiving LPOs, POs, and Goods Received Notes (GRN) with automated stock credit",
          "Inter-warehouse stock transfer logging",
          "1-Click Discrepancy Reconciler re-aligning product quantities with physical warehouse counts",
          "Low-stock warning threshold alerts and notifications",
        ],
      },
    ],
    specs: [
      { label: "Production Domain", value: "mannabooks.co.ke" },
      { label: "POS Receipt Mode", value: "58mm / 80mm eTIMS Thermal" },
      { label: "Accounting Engine", value: "5-Class Double-Entry GL" },
      { label: "Statutory Payroll", value: "PAYE, SHIF, AHL & NSSF" },
      { label: "Inventory Mode", value: "Multi-Location & 1-Click Reconciler" },
      { label: "Database", value: "PostgreSQL with Drizzle ORM" },
    ],
    pricing: {
      model: "Monthly SaaS Subscription & Annual Tier",
      description:
        "Flexible monthly plans tailored for Kenyan retail shops, service firms, and growing enterprises.",
      featuresIncluded: [
        "Unlimited Invoices, Quotes & Receipts",
        "Walk-in POS Register with Thermal Printing",
        "Double-Entry General Ledger & Balance Sheet",
        "Statutory Payroll Processing & PDF Vouchers",
        "Multi-Location Inventory & Reconciler",
      ],
    },
    techStack: ["Next.js", "Drizzle ORM", "PostgreSQL", "Python Analytics"],
    mockup: {
      browserUrl: "https://www.mannabooks.co.ke/app/ledger",
      windowTitle: "Manna Books — SME General Ledger & Accounting",
      metrics: [
        { label: "Invoiced Revenue", value: "KES 4.2M", trend: "Balanced" },
        { label: "General Ledger", value: "100% Balanced", trend: "Double-entry" },
        { label: "KRA PAYE Cleared", value: "Reconciled", trend: "Compliant" },
      ],
      ledgerItems: [
        {
          title: "Double-Entry Journal #JRN-2026-08",
          subtitle: "Customer Invoice #INV-1092 Cleared via M-Pesa",
          amount: "+KES 85,000.00",
          status: "Posted",
        },
        {
          title: "KRA Statutory PAYE Deduction Schedule",
          subtitle: "General Ledger Account #2100 (Tax Liabilities)",
          amount: "Balanced",
          status: "Reconciled",
        },
      ],
    },
  },
  {
    id: "fedhahub",
    slug: "fedhahub",
    categorySlug: "finance",
    categoryName: "Finance Suite & Intelligence",
    name: "FedhaHub — Financial Media & Analytics Hub",
    shortTag: "FedhaHub",
    statusBadge: "Financial Intelligence Blog",
    statusTone: "amber",
    liveDomain: "fedhahub.co.ke",
    liveUrl: "https://www.fedhahub.co.ke/",
    heroHeadline: "Financial Intelligence, SACCO Dividend Modeling & SME Advisory Publication",
    summary:
      "FedhaHub is Corban Technologies' dedicated financial media publication and dividend intelligence hub. Equips cooperative executives, SME directors, and individual investors with deep analytical research, dividend projection formulas, loan amortization simulators, and governance insights across Kenya.",
    benefits: [
      {
        title: "Demystify Cooperative Dividends",
        desc: "Interactive calculators modeling weighted share capital dividends ahead of annual AGMs.",
      },
      {
        title: "Loan Engine Comparison Tools",
        desc: "Side-by-side simulation comparing Diminishing Balance vs Flat Rate interest calculations.",
      },
      {
        title: "SME Governance & Tax Intelligence",
        desc: "Regular analytical commentary on KRA statutory compliance, eTIMS mandates, and SME cashflow governance.",
      },
    ],
    highlights: [
      {
        iconName: "BarChart3",
        title: "SACCO AGM Dividend Models",
        desc: "Formulas and projection spreadsheets for computing member returns across share capital and monthly deposits.",
      },
      {
        iconName: "Calculator",
        title: "Loan Amortization Simulators",
        desc: "Clear visualizers breaking down interest rate curves and monthly repayment schedules.",
      },
      {
        iconName: "BookOpen",
        title: "Financial Governance Articles",
        desc: "Curated research articles written for cooperative boards, finance managers, and entrepreneurs.",
      },
      {
        iconName: "TrendingUp",
        title: "East African Market Trends",
        desc: "Insights on mobile money liquidity, banking tech, and digital fiscal compliance.",
      },
    ],
    modules: [
      {
        title: "Dividend Calculation Models",
        desc: "Interactive tools built for cooperative members and board treasurers.",
        items: [
          "Weighted average share capital dividend formula calculator",
          "Deposit interest rebate projection models",
          "Interactive AGM scenario planning spreadsheets",
          "Withholding tax deduction estimates on dividend earnings",
        ],
      },
      {
        title: "SME Advisory & Tax Research",
        desc: "Practical financial intelligence articles for business owners.",
        items: [
          "eTIMS onboarding and statutory invoice compliance guides",
          "Working capital management strategies for retail and wholesale",
          "Double-entry bookkeeping essentials for growing startups",
          "Statutory payroll deductions (PAYE, SHIF, AHL) breakdown",
        ],
      },
    ],
    specs: [
      { label: "Media Portal", value: "fedhahub.co.ke" },
      { label: "Focus Area", value: "Cooperative & SME Finance" },
      { label: "Interactive Tools", value: "Dividend & Loan Simulators" },
      { label: "Publishing Cadence", value: "Weekly Research & Articles" },
    ],
    pricing: {
      model: "Free Open-Access Financial Media",
      description:
        "Open publication empowering East African business leaders and cooperative members with transparent financial tools.",
      featuresIncluded: [
        "Unrestricted Access to All Research Articles",
        "Free SACCO Dividend Calculators",
        "Loan Amortization Simulators",
        "Weekly Market Intelligence Insights",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Markdown CMS", "Python Analytics"],
    mockup: {
      browserUrl: "https://www.fedhahub.co.ke/dividends/calculator",
      windowTitle: "FedhaHub — Financial Intelligence & AGM Dividend Modeling",
      metrics: [
        { label: "Active Readers", value: "14,500/mo", trend: "+30% MoM" },
        { label: "Calculators Run", value: "2,400+", trend: "AGM Season" },
        { label: "Research Posts", value: "65+ Guides", trend: "Updated" },
      ],
      ledgerItems: [
        {
          title: "SACCO AGM Dividend Calculation Model 2026",
          subtitle: "Formula: (Weighted Share Capital * Rate) - WHT",
          amount: "14.2% Return",
          status: "Verified Model",
        },
        {
          title: "Diminishing vs Flat Rate Loan Comparison",
          subtitle: "Interactive Simulator Tool · Financial Advisory",
          amount: "Saved KES 42,000",
          status: "Published",
        },
      ],
    },
  },
  {
    id: "gearhouse",
    slug: "gearhouse",
    categorySlug: "gift-shop",
    categoryName: "Gift Shop & Omnichannel Retail",
    name: "GearHouse Africa — Retail POS & Multi-Till Shifts",
    shortTag: "GearHouse Africa",
    statusBadge: "Live Retail Deployment",
    statusTone: "emerald",
    liveDomain: "gearhouse.co.ke",
    liveUrl: "https://www.gearhouse.co.ke/",
    heroHeadline: "Omnichannel Hardware & Retail POS with Multi-Till Cashier Shift Balancing",
    summary:
      "GearHouse Africa (gearhouse.co.ke) is a live omnichannel retail management and Point-of-Sale platform. Features dedicated cashier tills, shift management with opening/closing float declarations, automated cash discrepancy tracking, customer loyalty points, split tenders (Cash, Card, M-Pesa STK), and atomic sale voiding with instant stock restoration.",
    benefits: [
      {
        title: "Cash Drawer Accountability via Shifts",
        desc: "Cashiers open shifts with an opening float and close with a physical count; discrepancies are automatically calculated to detect shortages.",
      },
      {
        title: "Dedicated Cashier Staff Roles",
        desc: "Cashier accounts route straight to `/pos/register`, restricting unauthorized access to back-office financials.",
      },
      {
        title: "Atomic Sale Voiding & Rollback",
        desc: "Voiding a transaction automatically restores exact item inventory quantities and reverses customer loyalty points atomically.",
      },
    ],
    highlights: [
      {
        iconName: "ScanBarcode",
        title: "Multi-Till Barcode POS Register",
        desc: "Physical cashier checkout counters with SKU item search, walk-in customer loyalty tracking, and rapid cart building.",
      },
      {
        iconName: "Clock",
        title: "POS Shifts & Float Balancing",
        desc: "Opening float declarations, closing cash count balancing, and automated discrepancy calculation (shortages in Red, overages in Amber).",
      },
      {
        iconName: "Smartphone",
        title: "Direct M-Pesa STK Push",
        desc: "Trigger instant Safaricom Daraja STK Push prompt to the customer's phone directly from the checkout register.",
      },
      {
        iconName: "Boxes",
        title: "Atomic Voiding & Stock Rollback",
        desc: "Automated database signals restore inventory stock and reverse earned/spent loyalty points upon sale voiding.",
      },
      {
        iconName: "Users",
        title: "Restricted Cashier Permissions",
        desc: "POS staff role ensures cashiers only access the register, protecting owner revenue analytics and pricing.",
      },
      {
        iconName: "BarChart3",
        title: "Shift Logs & Till Auditing",
        desc: "Complete financial audit trail of till activity, cash handling, and cashier shift logs accessible by store owners.",
      },
    ],
    modules: [
      {
        title: "POS Till & Shift Cash Management",
        desc: "Strict cashier accountability preventing till cash leakage.",
        items: [
          "Multiple physical till configuration per retail branch",
          "Enforced shift opening with declared initial opening float",
          "End-of-day shift closing with physical cash drawer count",
          "Automated discrepancy calculation (closing float vs expected sales)",
          "Automatic resume of open shifts if connection refreshes or drops",
        ],
      },
      {
        title: "Counter Register & Cart Operations",
        desc: "Rapid checkout flow engineered for busy store counters.",
        items: [
          "Barcode SKU scanning and fast product catalog search",
          "Walk-in customer assignment for loyalty point awards/redemptions",
          "Multi-tender payments: Cash, Card, and Daraja M-Pesa STK Push",
          "Atomic transaction recording tied directly to active shift ID",
          "Database atomic voiding with automatic inventory restoration",
        ],
      },
    ],
    specs: [
      { label: "Live Domain", value: "gearhouse.co.ke" },
      { label: "POS Mode", value: "Multi-Till & Shift Logs" },
      { label: "Payment Rails", value: "Cash, Card & M-Pesa STK" },
      { label: "Void Handling", value: "Atomic DB Stock & Loyalty Rollback" },
      { label: "Architecture", value: "Next.js + Django REST + Postgres" },
    ],
    pricing: {
      model: "Retail Deployment & Multi-Till License",
      description:
        "Engineered for hardware shops, retail outlets, and multi-till stores across East Africa.",
      featuresIncluded: [
        "Unlimited POS Till & Shift Logs",
        "Cashier Role-Based Access Control",
        "M-Pesa STK Push Cashier Integration",
        "Atomic Stock Restoration on Void",
        "Real-Time Inventory Synchronization",
      ],
    },
    techStack: ["Next.js", "Django REST Framework", "PostgreSQL", "Daraja API"],
    mockup: {
      browserUrl: "https://www.gearhouse.co.ke/pos/register",
      windowTitle: "GearHouse Africa — Cashier POS Register & Shift #14",
      metrics: [
        { label: "Active Shift", value: "Till 01 Open", trend: "Balanced" },
        { label: "Today's Sales", value: "KES 148,200", trend: "42 Transactions" },
        { label: "Opening Float", value: "KES 5,000", trend: "Verified" },
      ],
      ledgerItems: [
        {
          title: "POS Till Sale #GH-412 (Cashier Register)",
          subtitle: "Walk-in Customer · M-Pesa STK Push Cleared",
          amount: "+KES 12,800.00",
          status: "Completed",
        },
        {
          title: "Shift Float Balance Check",
          subtitle: "Expected Cash Matches Drawer Count",
          amount: "Balanced",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "clate-cosmetics",
    slug: "clate-cosmetics",
    categorySlug: "gift-shop",
    categoryName: "Gift Shop & Omnichannel Retail",
    name: "Clate Cosmetics — Beauty & Skincare E-Shop",
    shortTag: "Clate Cosmetics",
    statusBadge: "Live Client Deployment",
    statusTone: "emerald",
    liveDomain: "clatecosmetics.com",
    liveUrl: "https://www.clatecosmetics.com/",
    heroHeadline: "E-Commerce Storefront, Dynamic Beauty Catalogs & M-Pesa Checkout",
    summary:
      "Clate Cosmetics (clatecosmetics.com) is a live e-commerce beauty and skincare platform. Features rich product showcases with high-resolution image galleries, product variant selection (shades, formulas, sizes), live shopping cart, direct Safaricom Daraja M-Pesa STK checkout, order fulfillment tracking, and regional pickup station routing.",
    benefits: [
      {
        title: "Conversion-Focused Beauty Storefront",
        desc: "Designed specifically for cosmetics with high-definition product visualizers, shade selectors, and customer reviews.",
      },
      {
        title: "Frictionless M-Pesa Mobile Checkout",
        desc: "Customers enter their phone number and receive an instant M-Pesa PIN prompt for sub-10-second order payment.",
      },
      {
        title: "Order Dispatch & Pickup Routing",
        desc: "Automated order fulfillment pipeline tracking orders from Pending through Processing, Dispatched, and Delivered.",
      },
    ],
    highlights: [
      {
        iconName: "Store",
        title: "Online Customer E-Shop Storefront",
        desc: "Responsive beauty product catalog with shade and size variant selectors, customer reviews, and mobile cart.",
      },
      {
        iconName: "Smartphone",
        title: "Instant Daraja M-Pesa STK Push",
        desc: "Direct M-Pesa STK Push prompt to buyer handsets with automated receipt generation upon payment callback.",
      },
      {
        iconName: "Boxes",
        title: "Order Pipeline & Pickup Stations",
        desc: "Multi-stage order fulfillment workflow: Pending, Processing, Dispatched, and Delivered via courier or pickup point.",
      },
      {
        iconName: "TrendingUp",
        title: "Sales Analytics & Top Sellers",
        desc: "Real-time vendor analytics tracking daily order volumes, gross revenue, and best-selling skincare items.",
      },
    ],
    modules: [
      {
        title: "E-Commerce Customer Experience",
        desc: "Modern digital customer shopping experience tailored for beauty brands.",
        items: [
          "High-res product gallery with shade and size variant selectors",
          "Live shopping cart with automated subtotal and shipping calculation",
          "Safaricom Daraja STK Push instant mobile checkout",
          "Customer profile with order history and saved delivery addresses",
          "SMS and email digital order confirmation receipts",
        ],
      },
      {
        title: "Vendor Order Fulfillment & Logistics",
        desc: "Back-office dispatch management for online shop owners.",
        items: [
          "Order processing pipeline (Pending, Processing, Dispatched, Delivered)",
          "Pickup station network configuration across Nairobi and regional towns",
          "Courier delivery label printing and parcel tracking",
          "Real-time inventory deduction upon order placement",
          "Sales revenue charts and daily settlement statements",
        ],
      },
    ],
    specs: [
      { label: "Live Domain", value: "clatecosmetics.com" },
      { label: "Catalog Engine", value: "Dynamic Shade & Size Variants" },
      { label: "Checkout Rails", value: "Instant Daraja M-Pesa STK" },
      { label: "Fulfillment", value: "Pickup Station & Doorstep Dispatch" },
      { label: "Platform", value: "Next.js + Tailwind + Django REST" },
    ],
    pricing: {
      model: "Managed E-Commerce Platform SLA",
      description:
        "Full-service e-commerce shop hosting, continuous product catalog updates, and payment reconciliation for beauty brands.",
      featuresIncluded: [
        "Complete E-Commerce Customer Storefront",
        "Daraja M-Pesa STK Push Checkout Integration",
        "Order Fulfillment & Pickup Station Network",
        "Product Variant & Stock Management",
        "Dedicated Cloud Hosting & 99.9% Uptime SLA",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Django REST API", "Daraja API"],
    mockup: {
      browserUrl: "https://www.clatecosmetics.com/shop/skincare",
      windowTitle: "Clate Cosmetics — Online Beauty Store & Checkout",
      metrics: [
        { label: "Online Orders", value: "1,240 /mo", trend: "+45% MoM" },
        { label: "M-Pesa Checkout", value: "Sub-10s", trend: "STK Push" },
        { label: "Delivery Speed", value: "Same-Day", trend: "Nairobi Hub" },
      ],
      ledgerItems: [
        {
          title: "Online E-Shop Order #CC-9021 (Clate Cosmetics)",
          subtitle: "Hydrating Serum + Glow Cleanser · M-Pesa Paid",
          amount: "+KES 4,500.00",
          status: "Dispatched",
        },
        {
          title: "Pickup Station Handover — Nairobi CBD",
          subtitle: "Customer SMS Notification Triggered",
          amount: "Delivered",
          status: "Completed",
        },
      ],
    },
  },
  {
    id: "ljk-marketing",
    slug: "ljk-marketing",
    categorySlug: "marketing",
    categoryName: "Marketing & Telecom Engine",
    name: "LJK Marketing Agency — Business Telecom Engine",
    shortTag: "LJK Marketing",
    statusBadge: "Client Pilot (LJK Marketing)",
    statusTone: "amber",
    liveDomain: "ljkmarketingagency.co.ke",
    liveUrl: "https://www.ljkmarketingagency.co.ke/",
    heroHeadline: "Alphanumeric Telecom Broadcasts, Prepaid SMS Wallets & Audience CRM",
    summary:
      "LJK Marketing Agency (ljkmarketingagency.co.ke) is a business messaging operations engine. In live client pilot, it delivers certified 11-character alphanumeric sender ID dispatch with Safaricom and Airtel Kenya, dual-channel prepaid SMS wallets with self-service M-Pesa STK top-ups, 1-click CSV audience imports, dynamic campaign broadcast schedulers, CA sending window compliance (7:00 AM – 8:00 PM), and developer REST APIs.",
    benefits: [
      {
        title: "Whitelisted Brand Sender IDs",
        desc: "Replace generic numbers with your official 11-character corporate name on Safaricom and Airtel Kenya.",
      },
      {
        title: "Instant Prepaid M-Pesa Top-Up",
        desc: "Fund your messaging balance directly from the dashboard via Daraja STK Push with automated VAT receipts.",
      },
      {
        title: "1-Click CSV Audience Wizard",
        desc: "Upload customer directories with automatic E.164 phone formatting and tag-based group segmentation.",
      },
      {
        title: "CA Anti-Spam Sending Windows",
        desc: "Automatic enforcement of Communications Authority rules (7:00 AM – 8:00 PM) and carrier opt-out suppression.",
      },
    ],
    highlights: [
      {
        iconName: "Radio",
        title: "Alphanumeric Sender ID Registration",
        desc: "Whitelist official 11-character brand headers with Safaricom and Airtel Kenya for verified corporate sender branding.",
      },
      {
        iconName: "Wallet",
        title: "Prepaid SMS Wallet & M-Pesa Top-Up",
        desc: "Instant wallet funding via Safaricom M-Pesa STK push with real-time credit balance tracking and automated tax invoices.",
      },
      {
        iconName: "Users",
        title: "Audience Groups & CSV Wizard",
        desc: "1-Click CSV/Excel upload wizard with automatic E.164 phone formatting and tag-based group segmentation.",
      },
      {
        iconName: "Send",
        title: "Dynamic Broadcast Campaign Scheduler",
        desc: "Inject dynamic tags ({first_name}, {balance}, {account_no}) into messages with live smartphone preview and bulk scheduling.",
      },
      {
        iconName: "Lock",
        title: "CA Regulations & Anti-Spam Compliance",
        desc: "Enforces 7:00 AM – 8:00 PM promotional sending windows and automated carrier opt-out (STOP) suppression lists.",
      },
      {
        iconName: "BarChart3",
        title: "Delivery Receipts (DLR) & Analytics",
        desc: "Real-time delivery status metrics (Sent, Delivered, Failed, Bounced) with carrier delivery receipts.",
      },
    ],
    modules: [
      {
        title: "Telecom Messaging & Broadcast Engine",
        desc: "Engineered for marketing agencies requiring dependable high-speed message delivery.",
        items: [
          "High-throughput telecom queue processing up to 500 messages per second",
          "Personalized SMS broadcasting with dynamic tags ({first_name}, {balance}, {account_no})",
          "Automated carrier opt-out (STOP) suppression list management",
          "160-character single SMS and multi-part concatenated message routing",
          "Campaign drafts with time-window scheduling (7:00 AM – 8:00 PM CA window)",
        ],
      },
      {
        title: "Audience Management & Contact Groups",
        desc: "Comprehensive contact organization for targeted campaign outreach.",
        items: [
          "1-Click CSV and Excel contact list import with automatic E.164 phone formatting",
          "Dynamic contact group creation and tag-based audience segmentation",
          "Contact interaction history and broadcast delivery logs",
          "Duplicate phone number cleanup and invalid number detection",
          "Exportable audience lists and campaign response reports",
        ],
      },
      {
        title: "Prepaid Wallet & Billing Automation",
        desc: "Zero-friction financial rails ensuring continuous campaign dispatch.",
        items: [
          "Self-service M-Pesa STK Push wallet top-ups directly within the dashboard",
          "Automated VAT tax invoices generated upon credit replenishment",
          "Low-balance alert triggers warning managers before credits deplete",
          "Per-unit SMS credit deduction on campaign dispatch",
          "Real-time ledger statements detailing every credit deduction",
        ],
      },
      {
        title: "Developer REST APIs & Webhooks",
        desc: "Developer-first REST APIs allowing third-party applications to trigger messaging.",
        items: [
          "API key generation with granular permission scopes and rate limiting",
          "Sub-second transactional OTP delivery for multi-factor authentication",
          "Real-time webhook listener dispatching delivery status updates to client servers",
          "Comprehensive API documentation with cURL, Python, and JavaScript snippets",
          "Dedicated cloud infrastructure with 99.9% uptime SLA",
        ],
      },
    ],
    specs: [
      { label: "Pilot Domain", value: "ljkmarketingagency.co.ke" },
      { label: "Throughput", value: "500 Messages / Second" },
      { label: "Sender IDs", value: "11-Char Alphanumeric Whitelist" },
      { label: "Billing", value: "Prepaid M-Pesa STK Push Wallet" },
      { label: "Compliance", value: "CA Sending Windows (7AM-8PM)" },
      { label: "Carrier Rails", value: "Safaricom & Airtel Certified" },
    ],
    pricing: {
      model: "Pay-As-You-Go SMS Credits & Volume Bundles",
      description:
        "Transparent tiered pricing per SMS unit with zero monthly platform maintenance fees.",
      featuresIncluded: [
        "11-Character Alphanumeric Sender ID Whitelisting",
        "Prepaid M-Pesa STK Push Wallet Top-Ups",
        "Unlimited CSV Audience Directory Uploads",
        "Full DLR Delivery Receipts & Webhook APIs",
        "Dedicated Account Management & Compliance Support",
      ],
    },
    techStack: ["Next.js 15", "Django REST", "PostgreSQL", "Telecom Gateways"],
    mockup: {
      browserUrl: "https://www.ljkmarketingagency.co.ke/business/dashboard",
      windowTitle: "LJK Marketing Agency — Business Telecom Workspace",
      metrics: [
        { label: "Messages Sent", value: "128,400", trend: "99.2% Delivery" },
        { label: "Active Sender ID", value: "LJKAGENCY", trend: "Verified" },
        { label: "Credit Balance", value: "48,500 Units", trend: "Prepaid" },
      ],
      ledgerItems: [
        {
          title: "LJK Telecom Broadcast — Alphanumeric Sender",
          subtitle: "Batch #LJK-774 · 24,000 Delivered SMS",
          amount: "99.4% Delivery",
          status: "Dispatched",
        },
        {
          title: "Prepaid Wallet Top-up via M-Pesa STK",
          subtitle: "Wallet Credited · Tax Invoice #INV-882",
          amount: "+KES 20,000.00",
          status: "Cleared",
        },
      ],
    },
  },
  {
    id: "ct-drive",
    slug: "ct-drive",
    categorySlug: "logistics",
    categoryName: "Logistics & Fleet OS",
    name: "CT Drive — Freight, Waybills & Fleet Logistics OS",
    shortTag: "CT Drive Logistics",
    statusBadge: "In Development · Private Beta",
    statusTone: "amber",
    liveDomain: "ctdrive.co.ke",
    liveUrl: "https://www.ctdrive.co.ke/",
    heroHeadline: "Waybill Barcode Automation, Fleet Dispatch & Real-Time Cargo Tracking",
    summary:
      "CT Drive (ctdrive.co.ke) is Corban Technologies' logistics and fleet operating system currently under active engineering and private pilot development for regional freight forwarders and transporters. Simplifies automated waybill issuance with Code-128 barcodes, transport corridor routes (Mombasa to Nairobi), fleet dispatch manifests, driver trip sheets, real-time milestone checkpoints, and OTP digital proof of delivery.",
    benefits: [
      {
        title: "Automated Waybill Generation",
        desc: "Generate scannable Code-128 barcode waybills with package weight, volume, and fragility classification.",
      },
      {
        title: "Fleet Capacity Load Meters",
        desc: "Track truck volume and weight capacity utilization before dispatching consolidated trip manifests.",
      },
      {
        title: "OTP-Verified Proof of Delivery",
        desc: "Delivery drivers verify recipients with an instant SMS OTP code and capture digital signatures on arrival.",
      },
    ],
    highlights: [
      {
        iconName: "Barcode",
        title: "Automated Waybills & Code-128 Barcodes",
        desc: "Instant waybill PDF generation with scannable Code-128 barcodes, parcel weight, dimensions, and fragility classification.",
      },
      {
        iconName: "Navigation",
        title: "Real-Time Milestone Status Checkpoints",
        desc: "Live status updates: Created, Manifested, In Transit, Arrived at Hub, and Out for Delivery.",
      },
      {
        iconName: "Truck",
        title: "Fleet Capacity & Driver Route Dispatch",
        desc: "Assign trucks, assign drivers, track vehicle weight/volume utilization meters, and dispatch trip manifests.",
      },
      {
        iconName: "Clock",
        title: "Transport Corridors & Depot Checkpoints",
        desc: "Multi-hub routes (e.g. Mombasa to Nairobi) with intermediate transit stops and depot handoff sign-offs.",
      },
      {
        iconName: "FileCheck2",
        title: "Digital Proof of Delivery (POD)",
        desc: "Delivery drivers capture recipient signatures, ID photos, and OTP confirmation codes on arrival.",
      },
      {
        iconName: "Smartphone",
        title: "Customer Tracking & Freight Billing",
        desc: "Automated customer SMS milestone updates, freight rate calculation, and corporate monthly billing statements.",
      },
    ],
    modules: [
      {
        title: "Waybill & Parcel Ingestion Center",
        desc: "High-speed front-desk cargo intake interface for logistics agents and depot staff.",
        items: [
          "Rapid sender and consignee detail capture with address autocompletion",
          "Weight, volumetric dimension, and package fragility classification",
          "Automated freight rate calculation based on weight, distance, and insurance",
          "Instant waybill label printing with scannable Code-128 barcodes",
          "Payment integration for cash, corporate billing accounts, or M-Pesa STK Push",
        ],
      },
      {
        title: "Fleet Manifest & Route Dispatch",
        desc: "Optimized logistics dispatch console for warehouse managers and fleet controllers.",
        items: [
          "Consolidated trip manifests grouping multiple parcels onto designated trucks",
          "Truck capacity utilization indicators (weight and volume load meters)",
          "Driver assignment with digital delivery trip sheets and contact lists",
          "Transport corridor routes configuration with transit stops",
          "Fuel allocation, toll fees, and transit expense recording",
        ],
      },
      {
        title: "Consignee Tracking & Customer Experience",
        desc: "Self-service web and mobile tracking interface for senders and recipients.",
        items: [
          "Public tracking lookup page requiring only the unique waybill number",
          "Milestone timeline displaying exact timestamps and station checkpoints",
          "SMS notifications dispatched upon critical transit updates",
          "Estimated arrival time (ETA) calculations based on route progress",
          "Delivery address change or pickup point selection requests",
        ],
      },
      {
        title: "Digital Proof of Delivery (POD) & Billing",
        desc: "Eliminates lost delivery sheets and provides instant financial reconciliation.",
        items: [
          "Mobile-optimized delivery driver sign-off screen",
          "OTP delivery confirmation sent directly to the recipient's phone",
          "Immediate cloud upload of stamped delivery documents and recipient signatures",
          "Corporate monthly billing statements with linked POD proof attachments",
          "Claims management and damaged goods incident logging",
        ],
      },
    ],
    specs: [
      { label: "Live Domain", value: "ctdrive.co.ke" },
      { label: "Barcode Standard", value: "Code-128 & QR Compatible" },
      { label: "Corridors", value: "Mombasa-Nairobi-Regional Hubs" },
      { label: "POD Engine", value: "OTP & Digital Signature Validated" },
      { label: "Database", value: "PostgreSQL with Drizzle ORM" },
    ],
    pricing: {
      model: "Enterprise Fleet License & Waybill Volume Tier",
      description:
        "Scalable logistics infrastructure for regional fleet operators, couriers, and freight forwarders.",
      featuresIncluded: [
        "Unlimited Code-128 Barcode Waybill Generation",
        "Fleet Manifest & Route Dispatch Engine",
        "Public Consignee Tracking Portal",
        "Mobile Driver Digital POD with OTP Verification",
        "Corporate Monthly Billing & Invoicing Statements",
      ],
    },
    techStack: ["Next.js", "Drizzle ORM", "PostgreSQL", "Cloud Compute"],
    mockup: {
      browserUrl: "https://www.ctdrive.co.ke/dispatch/manifest",
      windowTitle: "CT Drive — Fleet & Waybill Dispatch Center",
      metrics: [
        { label: "Active Waybills", value: "342 Parcels", trend: "In Transit" },
        { label: "On-Time Dispatch", value: "98.8%", trend: "Mombasa-Nairobi" },
        { label: "Fleet Capacity", value: "18 Trucks", trend: "Allocated" },
      ],
      ledgerItems: [
        {
          title: "Waybill #CT-MBS-9021 (Mombasa to Nairobi)",
          subtitle: "Carrier Manifest: Truck KBZ 412M · In Transit",
          amount: "Out for Delivery",
          status: "In Transit",
        },
        {
          title: "Digital Proof of Delivery (POD)",
          subtitle: "Recipient Signature Verified via OTP",
          amount: "Confirmed",
          status: "Delivered",
        },
      ],
    },
  },
  {
    id: "sherehe",
    slug: "sherehe",
    categorySlug: "events",
    categoryName: "Event Ticketing & Passes",
    name: "Sherehe — Digital Event Ticketing & QR Passes",
    shortTag: "Sherehe Tickets",
    statusBadge: "Sherehe Live Platform",
    statusTone: "emerald",
    liveDomain: "sherehe.co.ke",
    liveUrl: "https://www.sherehe.co.ke/",
    heroHeadline: "Instant M-Pesa Ticketing, Anti-Counterfeit QR Passes & Gate Scanner Validation",
    summary:
      "Sherehe (sherehe.co.ke) is Kenya's high-speed event ticketing ecosystem for concert organizers, festivals, sports venues, and conferences. Delivers direct Safaricom Daraja STK Push ticket checkout, encrypted single-use QR passes, mobile gate scanner apps for event stewards validating passes in sub-0.4 seconds, live headcount tracking, and automated organizer revenue settlements.",
    benefits: [
      {
        title: "Sub-5-Second M-Pesa Checkout",
        desc: "Frictionless checkout requiring only name, phone, and email with immediate Daraja STK prompt.",
      },
      {
        title: "Anti-Counterfeit Encrypted QR Passes",
        desc: "Dynamic single-use QR codes sent via SMS and email with PDF ticket attachments, preventing pass forgery.",
      },
      {
        title: "Sub-0.4s Mobile Gate Scanner",
        desc: "Event stewards scan passes with audio/visual feedback, catching duplicate passes instantly even if Wi-Fi drops.",
      },
    ],
    highlights: [
      {
        iconName: "Ticket",
        title: "Multi-Tier Ticket Categories",
        desc: "Create Early Bird, Regular, VIP, VVIP, and Group ticket bundles with custom quantity limits and sales countdown timers.",
      },
      {
        iconName: "Smartphone",
        title: "Frictionless Daraja STK Push Checkout",
        desc: "Attendees enter their phone number and receive an instant M-Pesa PIN prompt for sub-5-second checkout without account friction.",
      },
      {
        iconName: "QrCode",
        title: "Encrypted Single-Use QR Passes",
        desc: "Dynamic encrypted QR codes sent via SMS and email with high-resolution ticket attachments and zero forgery risk.",
      },
      {
        iconName: "Scan",
        title: "Sub-Second Gate Scanner Mobile App",
        desc: "Dedicated mobile scanner app for event gate stewards validating tickets in under 0.4 seconds and catching duplicate entries.",
      },
      {
        iconName: "BarChart3",
        title: "Organizer Console & Headcount Analytics",
        desc: "Real-time gross box office revenue tracking, gate admission velocity heatmaps, and live attendee headcount.",
      },
      {
        iconName: "Coins",
        title: "Automated Organizer Settlements",
        desc: "Automated B2C disbursement and bank settlement payouts following successful event reconciliations.",
      },
    ],
    modules: [
      {
        title: "Event Organizer Console & Ticketing Setup",
        desc: "Comprehensive web management dashboard for event promoters, venues, and festival directors.",
        items: [
          "Rapid event landing page creation with custom branding, posters, and venue maps",
          "Multi-tier ticket categories with custom quantity limits and sales start/end times",
          "Promo code and discount coupon engine with percentage or fixed fee deductions",
          "Affiliate marketing links allowing promoters to track ticket referral conversions",
          "Complimentary VIP pass generation and direct digital dispatch",
        ],
      },
      {
        title: "High-Speed Mobile Gate Scanner App",
        desc: "Ultra-fast mobile gate check-in application built for high-throughput venue turnstiles.",
        items: [
          "Instant camera barcode / QR code scanning under 0.4 seconds per attendee",
          "Visual and audio feedback (Green Chime = Valid, Red Alarm = Duplicate / Invalid)",
          "Offline ticket database caching allowing validation even if venue Wi-Fi drops",
          "Gate admission logs showing which gate, time, and steward scanned each pass",
          "Real-time inside-venue attendee headcount tracking",
        ],
      },
      {
        title: "Frictionless Attendee Checkout Experience",
        desc: "Designed to maximize checkout conversions with zero unnecessary registration hurdles.",
        items: [
          "Instant mobile-optimized checkout requiring only attendee name, phone, and email",
          "Safaricom Daraja STK Push trigger directly to the buyer's handset",
          "Immediate SMS with direct link to view and download high-resolution QR tickets",
          "Digital PDF ticket attachment sent to email with venue directions and calendar invite",
        ],
      },
      {
        title: "Financial Settlement & Reconciliation Engine",
        desc: "Transparent, automated revenue distribution for event organizers and venue partners.",
        items: [
          "Real-time gross box office reconciliation against Safaricom Paybill collections",
          "Transparent platform fee deduction with zero hidden charges",
          "Direct B2C M-Pesa or Bank wire payouts to organizer accounts",
          "Detailed financial audit statements for accounting compliance",
          "Post-event comprehensive attendee demographics and sales report",
        ],
      },
    ],
    specs: [
      { label: "Live Domain", value: "sherehe.co.ke" },
      { label: "Scan Latency", value: "0.4s / Pass (Sub-Second)" },
      { label: "Payment Verification", value: "Instant Daraja STK Webhooks" },
      { label: "Ticket Security", value: "Time-Signed Encrypted QR" },
      { label: "Offline Mode", value: "Cache-Resilient Gate App" },
    ],
    pricing: {
      model: "Performance Commission per Ticket Sold",
      description:
        "Zero upfront fee. A transparent nominal fee per ticket sold with direct automated payouts to organizers.",
      featuresIncluded: [
        "Unlimited Multi-Tier Ticket Setup & Promo Codes",
        "Encrypted QR Pass Generation via SMS & Email",
        "Gate Scanner Mobile App for Event Stewards",
        "Live Box Office & Attendance Headcount Dashboard",
        "Automated Organizer Revenue Settlement",
      ],
    },
    techStack: ["Next.js", "PostgreSQL", "Daraja API", "QR Crypto"],
    mockup: {
      browserUrl: "https://www.sherehe.co.ke/organizer/gate-scan",
      windowTitle: "Sherehe Tickets Kenya — Gate Admission Controller",
      metrics: [
        { label: "Tickets Scanned", value: "3,850", trend: "Zero duplicates" },
        { label: "Gross Box Office", value: "KES 5.2M", trend: "Daraja Verified" },
        { label: "Gate Scan Speed", value: "0.4s / pass", trend: "Encrypted QR" },
      ],
      ledgerItems: [
        {
          title: "Gate QR Scanner #GATE-02 (VIP Pass)",
          subtitle: "Attendee: D. Otieno · Sherehe Tickets Kenya",
          amount: "ADMITTED",
          status: "Verified",
        },
        {
          title: "M-Pesa STK Instant Checkout",
          subtitle: "2x Early Bird Tickets · Daraja B2C Cleared",
          amount: "KES 3,000.00",
          status: "Cleared",
        },
      ],
    },
  },
];

export function normalizeSlug(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getAllCategories(): CategoryItem[] {
  return CATEGORIES_DATA;
}

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  if (!slug) return undefined;
  const target = normalizeSlug(slug);
  return CATEGORIES_DATA.find((c) => {
    const cSlug = normalizeSlug(c.slug);
    const cId = normalizeSlug(c.id);
    const cFolder = normalizeSlug(c.folderName);
    return (
      cSlug === target ||
      cId === target ||
      cFolder === target ||
      (target === "retail" && cSlug === "giftshop") ||
      (target === "finance" && cSlug === "finance") ||
      (target === "sacco" && cSlug === "sacco") ||
      (target === "marketing" && cSlug === "marketing") ||
      (target === "logistics" && cSlug === "logistics") ||
      (target === "events" && cSlug === "events")
    );
  });
}

export function getProjectsByCategory(categorySlug: string): ProjectItem[] {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];
  return PROJECTS_DATA.filter((p) => p.categorySlug === category.slug);
}

export function getAllProjects(): ProjectItem[] {
  return PROJECTS_DATA;
}

export function getProjectBySlug(categorySlug: string, projectSlug: string): ProjectItem | undefined {
  if (!projectSlug) return undefined;
  const normProject = normalizeSlug(projectSlug);
  
  // First match project directly
  const directMatch = PROJECTS_DATA.find((p) => {
    const pSlug = normalizeSlug(p.slug);
    const pId = normalizeSlug(p.id);
    const pTag = normalizeSlug(p.shortTag);
    return pSlug === normProject || pId === normProject || pTag === normProject;
  });

  if (directMatch) return directMatch;

  // Otherwise filter by category
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;

  return PROJECTS_DATA.find(
    (p) => p.categorySlug === category.slug && normalizeSlug(p.slug) === normProject
  );
}

export function findProject(slugOrId: string): ProjectItem | undefined {
  if (!slugOrId) return undefined;
  const norm = normalizeSlug(slugOrId);
  return PROJECTS_DATA.find(
    (p) => normalizeSlug(p.slug) === norm || normalizeSlug(p.id) === norm || normalizeSlug(p.shortTag) === norm
  );
}
