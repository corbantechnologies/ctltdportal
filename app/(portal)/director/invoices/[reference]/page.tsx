import InvoiceDetailView from "@/components/financials/InvoiceDetailView";

export const metadata = {
  title: "Tax Invoice Details | Executive Director | Corban Technologies",
  description: "Executive oversight, invoice audit status, GL journal posting, and payment records.",
};

export default function DirectorInvoiceDetailPage() {
  return <InvoiceDetailView rolePrefix="director" />;
}
