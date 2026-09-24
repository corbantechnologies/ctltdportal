"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getJournals,
  getJournal,
  bulkPostJournals,
  createJournalStudio,
  bulkCreateJournalBatches,
  CreateJournalStudioData,
  BulkJournalBatchInput,
} from "@/services/journals";

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

export function useCreateJournalStudio() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJournalStudioData) => createJournalStudio(data, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["journalentries"] });
      queryClient.invalidateQueries({ queryKey: ["financialyears"] });
    },
  });
}

export function useBulkCreateJournalBatches() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batches: BulkJournalBatchInput[]) => bulkCreateJournalBatches(batches, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["journalentries"] });
      queryClient.invalidateQueries({ queryKey: ["financialyears"] });
    },
  });
}
