"use client";

import { useParams } from "next/navigation";
import JournalBatchStudio from "@/components/journals/JournalBatchStudio";

export default function FiscalYearJournalStudioPage() {
  const { reference } = useParams();

  return (
    <div className="py-2">
      <JournalBatchStudio fiscalYearRef={reference as string} />
    </div>
  );
}
