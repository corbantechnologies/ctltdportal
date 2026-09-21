import InvoiceStudio from "@/components/invoices/InvoiceStudio";

export const metadata = {
  title: "New Tax Invoice | Finance | Corban Technologies",
  description: "Create and issue tax invoices with General Ledger synchronization.",
};

export default function FinanceNewInvoicePage() {
  return <InvoiceStudio rolePrefix="finance" />;
}
