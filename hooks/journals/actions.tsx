"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournals, getJournal } from "@/services/journals";

export function useFetchJournals() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchJournal(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["journal", reference],
    queryFn: () => getJournal(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}
