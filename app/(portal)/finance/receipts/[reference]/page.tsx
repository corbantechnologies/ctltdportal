import ReceiptDetailView from "@/components/financials/ReceiptDetailView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Payment Receipt | Finance Vault",
  description: "Official payment receipt document with electronic verification, eTIMS references, and double-entry General Ledger audit trails.",
};

export default function FinanceReceiptDetailPage() {
  return <ReceiptDetailView rolePrefix="finance" />;
}
