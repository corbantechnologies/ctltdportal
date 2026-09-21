import ExpenseStudio from "@/components/expenses/ExpenseStudio";

export const metadata = {
  title: "Record Expense Outflow | Director | Corban Technologies",
  description: "Log operational disbursements, vendor payments, and General Ledger double-entry vouchers.",
};

export default function DirectorNewExpensePage() {
  return <ExpenseStudio rolePrefix="director" />;
}
