import ReceiptStudio from "@/components/financials/ReceiptStudio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Payment Receipt | Finance Studio",
  description: "Record official customer payment inflow and automatically post double-entry vouchers to General Ledger.",
};

export default function FinanceNewReceiptPage() {
  return <ReceiptStudio rolePrefix="finance" />;
}
