import ExpensesList from "@/components/expenses/ExpensesList";

export const metadata = {
  title: "Expenses Ledger | Director | Corban Technologies",
  description: "Track operational disbursements, vendor bills, and General Ledger expense postings.",
};

export default function DirectorExpensesPage() {
  return <ExpensesList rolePrefix="director" />;
}
