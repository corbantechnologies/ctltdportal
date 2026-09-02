"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getPaymentMethods, getPaymentMethod } from "@/services/paymentmethods";

export function useFetchPaymentMethods() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["paymentmethods"],
    queryFn: () => getPaymentMethods(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchPaymentMethod(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["paymentmethod", reference],
    queryFn: () => getPaymentMethod(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}
