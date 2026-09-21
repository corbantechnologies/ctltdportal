import DirectSaleStudio from "@/components/sales/DirectSaleStudio";

export const metadata = {
  title: "Direct Cash Sale | Finance | Corban Technologies",
  description: "Point of sale studio for direct cash sales and walk-in customer settlements.",
};

export default function FinanceDirectSalePage() {
  return <DirectSaleStudio rolePrefix="finance" />;
}
