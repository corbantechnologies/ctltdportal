import InvoicesList from "@/components/financials/InvoicesList";

export const metadata = {
  title: "Invoices Ledger | Director | Corban Technologies",
  description: "Customer tax invoices, settlement tracking, and General Ledger revenue postings.",
};

export default function DirectorInvoicesPage() {
  return <InvoicesList rolePrefix="director" />;
}
