"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getPartnerTypes } from "@/services/partners";

export function useFetchPartnerTypes() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["partnertypes"],
    queryFn: () => getPartnerTypes(header),
    enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}
