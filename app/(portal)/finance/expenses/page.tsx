import ExpensesList from "@/components/expenses/ExpensesList";

export const metadata = {
  title: "Expenses Ledger | Finance | Corban Technologies",
  description: "Track operational disbursements, vendor bills, and General Ledger expense postings.",
};

export default function FinanceExpensesPage() {
  return <ExpensesList rolePrefix="finance" />;
}
