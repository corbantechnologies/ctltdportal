"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getDivisions, getDivision, getPublicDivisions, getPublicDivision } from "@/services/divisions";

export function useFetchDivisions() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["divisions"],
    queryFn: () => getDivisions(header),
    enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function useFetchDivision(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["division", reference],
    queryFn: () => getDivision(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}

// Public Hooks

export function useFetchPublicDivisions() {
  return useQuery({
    queryKey: ["public-divisions"],
    queryFn: () => getPublicDivisions(),
    enabled: true,
  });
}

export function useFetchPublicDivision(reference: string) {
  return useQuery({
    queryKey: ["public-division", reference],
    queryFn: () => getPublicDivision(reference),
    enabled: !!reference,
  });
}
