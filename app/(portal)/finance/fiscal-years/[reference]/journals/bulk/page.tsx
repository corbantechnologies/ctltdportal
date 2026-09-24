"use client";

import { useParams } from "next/navigation";
import BulkJournalStudio from "@/components/journals/BulkJournalStudio";

export default function FiscalYearBulkJournalsPage() {
  const { reference } = useParams();

  return (
    <div className="py-2">
      <BulkJournalStudio fiscalYearRef={reference as string} />
    </div>
  );
}
