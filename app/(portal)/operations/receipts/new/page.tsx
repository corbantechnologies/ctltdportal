import ReceiptStudio from "@/components/financials/ReceiptStudio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Payment Receipt | Operations Studio",
  description: "Operations receipt creation and payment clearing studio.",
};

export default function OperationsNewReceiptPage() {
  return <ReceiptStudio rolePrefix="operations" />;
}
