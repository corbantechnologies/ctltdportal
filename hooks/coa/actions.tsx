"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getCOAs, getCOA } from "@/services/coa";

export function useFetchCOAs() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["coas"],
    queryFn: () => getCOAs(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchCOA(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["coa", reference],
    queryFn: () => getCOA(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}
