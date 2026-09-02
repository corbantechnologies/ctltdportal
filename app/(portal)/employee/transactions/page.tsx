import SimpleTransactionsPage from "@/components/simpletransactions/SimpleTransactionsPage";

export const metadata = {
  title: "My Transactions | Employee | Corban Technologies",
  description: "View and log your transactions. Each transaction automatically generates a journal entry.",
};

export default function EmployeeSimpleTransactionsPage() {
  return <SimpleTransactionsPage />;
}
