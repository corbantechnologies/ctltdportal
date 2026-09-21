import ReceiptDetailView from "@/components/financials/ReceiptDetailView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Payment Receipt | Director Vault",
  description: "Executive receipt review, audit verification, and double-entry General Ledger audit trails.",
};

export default function DirectorReceiptDetailPage() {
  return <ReceiptDetailView rolePrefix="director" />;
}
