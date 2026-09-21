import InvoiceStudio from "@/components/invoices/InvoiceStudio";

export const metadata = {
  title: "New Tax Invoice | Operations | Corban Technologies",
  description: "Create and issue tax invoices with General Ledger synchronization.",
};

export default function OperationsNewInvoicePage() {
  return <InvoiceStudio rolePrefix="operations" />;
}
