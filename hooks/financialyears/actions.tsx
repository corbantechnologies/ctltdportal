import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getFinancialYears,
  getFinancialYear,
  createFinancialYear,
} from "@/services/financialyears";

export function useFetchFinancialYears() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["financialyears"],
    queryFn: () => getFinancialYears(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchFinancialYear(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["financialyear", reference],
    queryFn: () => getFinancialYear(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}

export function useCreateFinancialYear() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => createFinancialYear(values, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialyears"] });
    },
  });
}
