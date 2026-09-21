import InvoicesList from "@/components/financials/InvoicesList";

export const metadata = {
  title: "Invoices Ledger | Finance | Corban Technologies",
  description: "Customer tax invoices, settlement tracking, and General Ledger revenue postings.",
};

export default function FinanceInvoicesPage() {
  return <InvoicesList rolePrefix="finance" />;
}
