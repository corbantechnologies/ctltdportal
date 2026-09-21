import ReceiptStudio from "@/components/financials/ReceiptStudio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Payment Receipt | Director Studio",
  description: "Executive receipt creation and automated double-entry ledger allocation.",
};

export default function DirectorNewReceiptPage() {
  return <ReceiptStudio rolePrefix="director" />;
}
