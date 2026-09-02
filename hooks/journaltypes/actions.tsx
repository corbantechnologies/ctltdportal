"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournalTypes, getJournalType } from "@/services/journaltypes";

export function useFetchJournalTypes() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["journaltypes"],
    queryFn: () => getJournalTypes(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchJournalType(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["journaltypes", reference],
    queryFn: () => getJournalType(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}
