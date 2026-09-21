import ReceiptDetailView from "@/components/financials/ReceiptDetailView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Payment Receipt | Operations",
  description: "Operations receipt review and payment verification.",
};

export default function OperationsReceiptDetailPage() {
  return <ReceiptDetailView rolePrefix="operations" />;
}
