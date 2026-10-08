import { SimpleTransaction } from "@/services/simpletransactions";

/**
 * Escapes a cell value for safe inclusion in a CSV file.
 */
function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports a list of SimpleTransaction objects to a CSV file and triggers a browser download.
 */
export function exportTransactionsToCSV(
  transactions: SimpleTransaction[],
  filename = `transactions_${new Date().toISOString().split("T")[0]}.csv`
) {
  const headers = [
    "Code",
    "Date",
    "Description",
    "Type",
    "Amount (KES)",
    "Ledger Book",
    "Payment Method",
    "Division",
    "Journal Type",
    "Partner / Vendor",
    "Journal Ref",
    "Source Document",
    "Document Number",
    "Created By",
    "Created At",
  ];

  const rows = transactions.map((t) => [
    escapeCSVValue(t.code),
    escapeCSVValue(t.date),
    escapeCSVValue(t.name),
    escapeCSVValue(t.transaction_type),
    escapeCSVValue(t.amount),
    escapeCSVValue(t.ledger_book),
    escapeCSVValue(t.payment_method),
    escapeCSVValue(t.division),
    escapeCSVValue(t.journal_type),
    escapeCSVValue(t.partner || ""),
    escapeCSVValue(t.journal || "Pending"),
    escapeCSVValue(t.source_document || ""),
    escapeCSVValue(t.document_number || ""),
    escapeCSVValue(t.created_by),
    escapeCSVValue(t.created_at ? new Date(t.created_at).toLocaleString() : ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a sample template CSV for bulk importing transactions.
 */
export function downloadSampleCSVTemplate() {
  const headers = [
    "name",
    "transaction_type",
    "amount",
    "date",
    "ledger_book",
    "payment_method",
    "division",
    "journal_type",
    "partner",
    "source_document",
    "document_number",
  ];

  const sampleRows = [
    [
      '"Office Electricity Bill"',
      '"MONEY_OUT"',
      '"4500.00"',
      `"${new Date().toISOString().split("T")[0]}"`,
      '"Electricity Expense"',
      '"M-PESA Paybill"',
      '"Engineering"',
      '"Payment Voucher"',
      '"Kenya Power"',
      '"Utility Bill"',
      '"KPLC-9921"',
    ],
    [
      '"Client Software Consulting Payment"',
      '"MONEY_IN"',
      '"150000.00"',
      `"${new Date().toISOString().split("T")[0]}"`,
      '"Consulting Revenue"',
      '"Equity Bank"',
      '"Software Solutions"',
      '"Receipt"',
      '"Acme Corp"',
      '"Invoice"',
      '"INV-2026-001"',
    ],
  ];

  const csvContent = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "simple_transactions_import_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Journal batches list to CSV for audit
 */
export function exportJournalsToCSV(
  journals: any[],
  filename = `journal_batches_${new Date().toISOString().split("T")[0]}.csv`
) {
  const headers = [
    "Journal Code",
    "Date",
    "Description",
    "Journal Type",
    "Total Debit (KES)",
    "Total Credit (KES)",
    "Status",
    "Created By",
    "Posted By",
    "Reversed",
    "Fiscal Year",
    "Fiscal Month",
  ];

  const rows = journals.map((j) => [
    escapeCSVValue(j.code),
    escapeCSVValue(j.date),
    escapeCSVValue(j.description),
    escapeCSVValue(j.journal_type),
    escapeCSVValue(j.total_debit || j.amount || 0),
    escapeCSVValue(j.total_credit || j.amount || 0),
    escapeCSVValue(j.is_posted ? "Posted" : "Draft"),
    escapeCSVValue(j.created_by),
    escapeCSVValue(j.posted_by || ""),
    escapeCSVValue(j.is_reversed ? "Yes" : "No"),
    escapeCSVValue(j.financial_year),
    escapeCSVValue(j.financial_month),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  downloadCSV(csvContent, filename);
}

/**
 * Exports Journal Entries (GL Line items) to CSV for auditors
 */
export function exportJournalEntriesToCSV(
  entries: any[],
  filename = `gl_journal_entries_${new Date().toISOString().split("T")[0]}.csv`
) {
  const headers = [
    "Entry Code",
    "Date",
    "Journal Code",
    "Account / Book",
    "Partner",
    "Division",
    "Debit (KES)",
    "Credit (KES)",
    "Running Balance",
    "Currency",
    "Exchange Rate",
    "Created By",
  ];

  const rows = entries.map((e) => [
    escapeCSVValue(e.code),
    escapeCSVValue(e.date || e.journal_date || ""),
    escapeCSVValue(e.journal_code || e.journal || ""),
    escapeCSVValue(e.book || e.book_name || ""),
    escapeCSVValue(e.partner || ""),
    escapeCSVValue(e.division || ""),
    escapeCSVValue(e.debit),
    escapeCSVValue(e.credit),
    escapeCSVValue(e.running_balance ?? e.balance ?? ""),
    escapeCSVValue(e.currency || "KES"),
    escapeCSVValue(e.exchange_rate || 1),
    escapeCSVValue(e.created_by || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  downloadCSV(csvContent, filename);
}

/**
 * Exports Tax Filing Schedule to CSV for KRA / Tax Authority
 */
export function exportTaxFilingToCSV(
  report: any,
  filename = `tax_filing_schedule_${new Date().toISOString().split("T")[0]}.csv`
) {
  const summaryRows = [
    ["TAX FILING RETURN SCHEDULE - AUDIT EXPORT"],
    [`Period: ${report.period?.start_date || "Start"} to ${report.period?.end_date || "Present"} | Division: ${report.period?.division || "ALL"}`],
    [""],
    ["Tax Metric", "Amount (KES)"],
    ["Gross Sales (Revenue Base)", report.summary?.gross_sales || 0],
    ["Output VAT Collected", report.summary?.output_vat || 0],
    ["Gross Purchases (Expense Base)", report.summary?.gross_purchases || 0],
    ["Input VAT Claimable", report.summary?.input_vat || 0],
    ["Net VAT Payable / (Claimable)", report.summary?.net_vat_payable || 0],
    ["Total Withholding Tax (WHT)", report.summary?.total_wht_deducted || 0],
    [""],
    ["ITEMIZED VAT TRANSACTION SCHEDULE"],
  ];

  const scheduleHeaders = [
    "Date",
    "Journal Ref",
    "Document / Invoice #",
    "Partner / Vendor / Customer",
    "Tax PIN",
    "Tax Type",
    "Tax Amount (KES)",
    "Ledger Book",
    "Division",
    "Description",
  ];

  const scheduleRows = (report.vat_schedule || []).map((item: any) => [
    escapeCSVValue(item.date),
    escapeCSVValue(item.journal_code),
    escapeCSVValue(item.document_number),
    escapeCSVValue(item.partner_name),
    escapeCSVValue(item.partner_pin),
    escapeCSVValue(item.tax_type),
    escapeCSVValue(item.tax_amount),
    escapeCSVValue(item.book_name),
    escapeCSVValue(item.division),
    escapeCSVValue(item.description),
  ]);

  const summaryContent = summaryRows.map((r) => r.map((c) => escapeCSVValue(c)).join(",")).join("\r\n");
  const scheduleContent = [scheduleHeaders.join(","), ...scheduleRows.map((r: any) => r.join(","))].join("\r\n");

  const fullContent = `${summaryContent}\r\n\r\n${scheduleContent}`;
  downloadCSV(fullContent, filename);
}

/**
 * Exports All Transactions for statutory and tax audit to CSV
 */
export function exportAllTransactionsTaxToCSV(
  transactions: any[],
  filename = `all_statutory_transactions_${new Date().toISOString().split("T")[0]}.csv`
) {
  const headers = [
    "Date",
    "Journal Code",
    "Document / Invoice #",
    "Partner Name",
    "Tax PIN",
    "Book Code",
    "Ledger Book",
    "Debit (KES)",
    "Credit (KES)",
    "Division",
    "Description",
  ];

  const rows = (transactions || []).map((t: any) => [
    escapeCSVValue(t.date),
    escapeCSVValue(t.journal_code),
    escapeCSVValue(t.document_number),
    escapeCSVValue(t.partner_name),
    escapeCSVValue(t.partner_pin),
    escapeCSVValue(t.book_code),
    escapeCSVValue(t.book_name),
    escapeCSVValue(t.debit),
    escapeCSVValue(t.credit),
    escapeCSVValue(t.division),
    escapeCSVValue(t.description),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\r\n");
  downloadCSV(csvContent, filename);
}

/**
 * Exports Year-End Audit Pack to CSV
 */
export function exportYearEndPackToCSV(
  report: any,
  filename = `year_end_accounting_pack_${new Date().toISOString().split("T")[0]}.csv`
) {
  const fy = report.financial_year?.code || "FY";
  const lines = [
    [`YEAR-END FINANCIAL CLOSING & AUDIT PACK - ${fy}`],
    [`Fiscal Cycle: ${report.financial_year?.start_date} to ${report.financial_year?.end_date} | Division: ${report.division}`],
    [""],
    ["1. ANNUAL PROFIT & LOSS SUMMARY"],
    ["Metric", "Amount (KES)"],
    ["Revenue", report.pnl?.revenue || 0],
    ["Cost of Sales", report.pnl?.cost_of_sales || 0],
    ["Gross Profit", report.pnl?.gross_profit || 0],
    ["Operating Expenses", report.pnl?.operating_expenses || 0],
    ["Operating Profit", report.pnl?.operating_profit || 0],
    ["Other Income", report.pnl?.other_income || 0],
    ["Net Profit", report.pnl?.net_profit || 0],
    [""],
    ["2. YEAR-END BALANCE SHEET SNAPSHOT"],
    ["Metric", "Amount (KES)"],
    ["Current Assets", report.balance_sheet?.assets?.current?.net || 0],
    ["Non-Current Assets", report.balance_sheet?.assets?.non_current?.net || 0],
    ["Total Assets", report.balance_sheet?.assets?.total || 0],
    ["Current Liabilities", report.balance_sheet?.liabilities?.current?.net || 0],
    ["Non-Current Liabilities", report.balance_sheet?.liabilities?.non_current?.net || 0],
    ["Total Liabilities", report.balance_sheet?.liabilities?.total || 0],
    ["Total Equity", report.balance_sheet?.equity?.net || 0],
    ["Total Liabilities & Equity", report.balance_sheet?.total_liabilities_and_equity || 0],
    [""],
    ["3. GENERAL LEDGER CLOSING SCHEDULE"],
    ["Account Code", "Account Name", "Category", "Normal Balance", "Debits (KES)", "Credits (KES)", "Closing Balance (KES)"],
  ];

  const glRows = (report.gl_schedule || []).map((row: any) => [
    escapeCSVValue(row.code),
    escapeCSVValue(row.name),
    escapeCSVValue(row.category),
    escapeCSVValue(row.normal_balance),
    escapeCSVValue(row.debit),
    escapeCSVValue(row.credit),
    escapeCSVValue(row.closing_balance),
  ]);

  const topContent = lines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")).join("\r\n");
  const bottomContent = glRows.map((r: any) => r.join(",")).join("\r\n");

  downloadCSV(`${topContent}\r\n${bottomContent}`, filename);
}

/**
 * Exports Trial Balance to CSV
 */
export function exportTrialBalanceToCSV(
  data: any,
  filename = `trial_balance_${data?.financial_year || "period"}_${new Date().toISOString().split("T")[0]}.csv`
) {
  if (!data || !data.trial_balance) return;
  const headerLines = [
    ["TRIAL BALANCE REPORT"],
    [`Financial Year: ${data.financial_year || "—"} | Division: ${data.division || "ALL"} | Currency: ${data.currency || "KES"}`],
    [""],
    ["Account Code", "Account Name", "Account Type", "Report Category", "Debit (KES)", "Credit (KES)", "Net Balance (KES)"],
  ];

  const rows = (data.trial_balance || []).map((row: any) => [
    escapeCSVValue(row.code),
    escapeCSVValue(row.name),
    escapeCSVValue(row.account_type),
    escapeCSVValue(row.report_role),
    escapeCSVValue(row.debit),
    escapeCSVValue(row.credit),
    escapeCSVValue(row.balance),
  ]);

  const totalLines = [
    [""],
    ["TOTAL DISCLOSURE", "", "", "", escapeCSVValue(data.totals?.total_debit || 0), escapeCSVValue(data.totals?.total_credit || 0), escapeCSVValue(data.totals?.net_balance || 0)],
  ];

  const content = [
    ...headerLines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")),
    ...rows.map((r: any) => r.join(",")),
    ...totalLines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")),
  ].join("\r\n");

  downloadCSV(content, filename);
}

/**
 * Exports Balance Sheet to CSV
 */
export function exportBalanceSheetToCSV(
  data: any,
  filename = `balance_sheet_${data?.financial_year || "period"}_${new Date().toISOString().split("T")[0]}.csv`
) {
  if (!data) return;
  const lines: string[][] = [
    ["BALANCE SHEET STATEMENT"],
    [`Period As Of: ${data.as_of_date || "Present"} | Division: ${data.division || "ALL"} | Currency: ${data.currency || "KES"}`],
    [""],
    ["SECTION / CATEGORY", "AMOUNT (KES)"],
    ["1. CURRENT ASSETS", String(data.assets?.current?.net || 0)],
    ["2. NON-CURRENT ASSETS", String(data.assets?.non_current?.net || 0)],
    ["TOTAL ASSETS", String(data.assets?.total || 0)],
    [""],
    ["3. CURRENT LIABILITIES", String(data.liabilities?.current?.net || 0)],
    ["4. NON-CURRENT LIABILITIES", String(data.liabilities?.non_current?.net || 0)],
    ["TOTAL LIABILITIES", String(data.liabilities?.total || 0)],
    [""],
    ["5. SHAREHOLDERS' EQUITY", String(data.equity?.net || 0)],
    ["NET INCOME (CURRENT PERIOD PROFIT)", String(data.equity?.net_income || 0)],
    ["TOTAL EQUITY & NET INCOME", String(data.equity?.total || 0)],
    [""],
    ["TOTAL LIABILITIES & EQUITY", String(data.total_liabilities_and_equity || 0)],
    ["VARIANCE CHECK (ASSETS - LIAB & EQUITY)", String((data.assets?.total || 0) - (data.total_liabilities_and_equity || 0))],
  ];

  const content = lines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")).join("\r\n");
  downloadCSV(content, filename);
}

/**
 * Exports Profit & Loss (P&L) to CSV
 */
export function exportPnLToCSV(
  data: any,
  filename = `profit_and_loss_${new Date().toISOString().split("T")[0]}.csv`
) {
  if (!data) return;
  const lines: string[][] = [
    ["PROFIT & LOSS STATEMENT (STATEMENT OF FINANCIAL PERFORMANCE)"],
    [`Currency: ${data.currency || "KES"} | Division: ${data.division || "ALL"}`],
    [""],
    ["LINE ITEM", "AMOUNT (KES)"],
    ["Operating Revenue", String(data.revenue || 0)],
    ["Cost of Sales / Direct Cost", String(data.cost_of_sales || 0)],
    ["GROSS PROFIT", String(data.gross_profit || 0)],
    ["Operating Expenses", String(data.operating_expenses || 0)],
    ["OPERATING PROFIT (EBIT)", String(data.operating_profit || 0)],
    ["Other Income", String(data.other_income || 0)],
    ["NET PROFIT / (LOSS)", String(data.net_profit || 0)],
  ];

  const content = lines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")).join("\r\n");
  downloadCSV(content, filename);
}

/**
 * Exports Revenue Summary to CSV
 */
export function exportRevenueToCSV(
  data: any,
  filename = `revenue_summary_${new Date().toISOString().split("T")[0]}.csv`
) {
  if (!data) return;
  const lines: string[][] = [
    ["REVENUE PERFORMANCE SUMMARY"],
    [`Group Total Revenue: KES ${data.group_total_revenue || 0}`],
    [""],
    ["Division Code / Name", "Revenue (KES)"],
  ];

  if (Array.isArray(data.breakdown)) {
    data.breakdown.forEach((item: any) => {
      lines.push([item.division || item.name || "Division", String(item.revenue || item.amount || 0)]);
    });
  }

  const content = lines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")).join("\r\n");
  downloadCSV(content, filename);
}

/**
 * Exports Accounts Receivable Aging Matrix to CSV
 */
export function exportARAgingToCSV(
  data: any,
  filename = `ar_aging_schedule_${new Date().toISOString().split("T")[0]}.csv`
) {
  if (!data || !data.partners) return;
  const headerLines = [
    ["ACCOUNTS RECEIVABLE (AR) AGING SCHEDULE"],
    [`As of Date: ${data.as_of_date || "Present"} | Division: ${data.division || "ALL"} | DSO: ${data.average_dso_days || 0} Days`],
    [`Total Receivables: KES ${data.total_ar || 0} | Debtors: ${data.partners_count || 0}`],
    [""],
    ["Customer Code", "Customer Name", "Current (0-30 Days)", "31-60 Days", "61-90 Days", "90+ Days (Overdue)", "Total Balance (KES)", "Invoices Count"],
  ];

  const rows = (data.partners || []).map((p: any) => [
    escapeCSVValue(p.partner_code),
    escapeCSVValue(p.partner_name),
    escapeCSVValue(p.current),
    escapeCSVValue(p.days_31_60),
    escapeCSVValue(p.days_61_90),
    escapeCSVValue(p.days_90_plus),
    escapeCSVValue(p.total_balance),
    escapeCSVValue(p.invoices_count),
  ]);

  const summaryLine = [
    [""],
    [
      "PORTFOLIO TOTALS",
      "",
      escapeCSVValue(data.total_current || 0),
      escapeCSVValue(data.total_31_60 || 0),
      escapeCSVValue(data.total_61_90 || 0),
      escapeCSVValue(data.total_90_plus || 0),
      escapeCSVValue(data.total_ar || 0),
      escapeCSVValue(data.partners_count || 0),
    ],
  ];

  const content = [
    ...headerLines.map((r) => r.map((c) => escapeCSVValue(c)).join(",")),
    ...rows.map((r: any) => r.join(",")),
    ...summaryLine.map((r) => r.map((c) => escapeCSVValue(c)).join(",")),
  ].join("\r\n");

  downloadCSV(content, filename);
}

/**
 * Exports Consolidated Financial Statements Pack (Multi-Statement CSV Dossier)
 */
export function exportFullFinancialPackToCSV(
  pack: {
    trialBalance?: any;
    pnl?: any;
    balanceSheet?: any;
    revenue?: any;
    cash?: any;
    yearCode?: string;
  },
  filename = `full_financial_statements_pack_${pack.yearCode || "FY"}_${new Date().toISOString().split("T")[0]}.csv`
) {
  const sections: string[] = [];

  sections.push([
    ["=========================================================================="],
    [`CORBAN TECHNOLOGIES LTD - STATUTORY FINANCIAL STATEMENTS PACK - ${pack.yearCode || "FY"}`],
    [`Generated: ${new Date().toISOString()} | All figures in KES`],
    ["=========================================================================="],
  ].map(r => r.join(",")).join("\r\n"));

  // 1. P&L
  if (pack.pnl) {
    sections.push([
      ["\r\n--- 1. STATEMENT OF PROFIT OR LOSS ---"],
      ["Operating Revenue", pack.pnl.revenue || 0],
      ["Cost of Sales", pack.pnl.cost_of_sales || 0],
      ["Gross Profit", pack.pnl.gross_profit || 0],
      ["Operating Expenses", pack.pnl.operating_expenses || 0],
      ["Operating Profit", pack.pnl.operating_profit || 0],
      ["Other Income", pack.pnl.other_income || 0],
      ["Net Profit", pack.pnl.net_profit || 0],
    ].map(r => r.map(c => escapeCSVValue(c)).join(",")).join("\r\n"));
  }

  // 2. Balance Sheet
  if (pack.balanceSheet) {
    sections.push([
      ["\r\n--- 2. STATEMENT OF FINANCIAL POSITION (BALANCE SHEET) ---"],
      ["Current Assets", pack.balanceSheet.assets?.current?.net || 0],
      ["Non-Current Assets", pack.balanceSheet.assets?.non_current?.net || 0],
      ["Total Assets", pack.balanceSheet.assets?.total || 0],
      ["Current Liabilities", pack.balanceSheet.liabilities?.current?.net || 0],
      ["Non-Current Liabilities", pack.balanceSheet.liabilities?.non_current?.net || 0],
      ["Total Liabilities", pack.balanceSheet.liabilities?.total || 0],
      ["Total Equity", pack.balanceSheet.equity?.net || 0],
      ["Total Liabilities & Equity", pack.balanceSheet.total_liabilities_and_equity || 0],
    ].map(r => r.map(c => escapeCSVValue(c)).join(",")).join("\r\n"));
  }

  // 3. Trial Balance
  if (pack.trialBalance && pack.trialBalance.trial_balance) {
    const tbLines = [
      ["\r\n--- 3. TRIAL BALANCE SCHEDULE ---"],
      ["Account Code", "Account Name", "Category", "Debit", "Credit", "Net Balance"],
    ];
    pack.trialBalance.trial_balance.forEach((r: any) => {
      tbLines.push([r.code, r.name, r.report_role || r.account_type, r.debit, r.credit, r.balance]);
    });
    tbLines.push(["TOTALS", "", "", pack.trialBalance.totals?.total_debit || 0, pack.trialBalance.totals?.total_credit || 0, pack.trialBalance.totals?.net_balance || 0]);
    sections.push(tbLines.map(r => r.map(c => escapeCSVValue(c)).join(",")).join("\r\n"));
  }

  downloadCSV(sections.join("\r\n"), filename);
}


