"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  closeFinancialMonth,
  getFinancialMonth,
  getFinancialMonths,
  reopenFinancialMonth,
} from "@/services/financialmonths";

export function useFetchFinancialMonths(financialYearRef?: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["financialmonths", financialYearRef ?? "all"],
    queryFn: () => getFinancialMonths(header, financialYearRef),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchFinancialMonth(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["financialmonth", reference],
    queryFn: () => getFinancialMonth(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}

export function useCloseFinancialMonth() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => closeFinancialMonth(reference, header),
    onSuccess: (_, reference) => {
      queryClient.invalidateQueries({ queryKey: ["financialmonth", reference] });
      queryClient.invalidateQueries({ queryKey: ["financialmonths"] });
      queryClient.invalidateQueries({ queryKey: ["financialyear"] });
    },
  });
}

export function useReopenFinancialMonth() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => reopenFinancialMonth(reference, header),
    onSuccess: (_, reference) => {
      queryClient.invalidateQueries({ queryKey: ["financialmonth", reference] });
      queryClient.invalidateQueries({ queryKey: ["financialmonths"] });
      queryClient.invalidateQueries({ queryKey: ["financialyear"] });
    },
  });
}
