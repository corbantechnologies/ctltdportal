"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournalEntries, getJournalEntry } from "@/services/journalentries";

export function useFetchJournalEntries(filters?: Record<string, string>) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["journalentries", filters],
    queryFn: () => getJournalEntries(header, filters),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchJournalEntry(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["journalentry", reference],
    queryFn: () => getJournalEntry(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}
