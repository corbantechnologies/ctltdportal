"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getPartners, getPartner } from "@/services/partners";

export function useFetchPartners() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["partners"],
    queryFn: () => getPartners(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchPartner(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["partner", reference],
    queryFn: () => getPartner(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}
