import InvoiceStudio from "@/components/invoices/InvoiceStudio";

export const metadata = {
  title: "New Tax Invoice | Director | Corban Technologies",
  description: "Create and issue tax invoices with General Ledger synchronization.",
};

export default function DirectorNewInvoicePage() {
  return <InvoiceStudio rolePrefix="director" />;
}
