import InvoiceDetailView from "@/components/financials/InvoiceDetailView";

export const metadata = {
  title: "Tax Invoice Details | Finance Portal | Corban Technologies",
  description: "View invoice line items, approve and post to General Ledger, and record payment receipts.",
};

export default function FinanceInvoiceDetailPage() {
  return <InvoiceDetailView rolePrefix="finance" />;
}
