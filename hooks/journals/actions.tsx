"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournals, getJournal, bulkPostJournals } from "@/services/journals";

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

export function useBulkPostJournals() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (references: string[]) => bulkPostJournals(references, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["journalentries"] });
    },
  });
}
