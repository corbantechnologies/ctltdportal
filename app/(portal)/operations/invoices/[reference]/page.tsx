import InvoiceDetailView from "@/components/financials/InvoiceDetailView";

export const metadata = {
  title: "Tax Invoice Details | Operations Portal | Corban Technologies",
  description: "View invoice line items, download PDF, and acknowledge customer payments.",
};

export default function OperationsInvoiceDetailPage() {
  return <InvoiceDetailView rolePrefix="operations" />;
}
