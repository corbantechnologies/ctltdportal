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

