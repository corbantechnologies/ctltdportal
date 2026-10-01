import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getPartners, getPartner, createPartner } from "@/services/partners";

export function useFetchPartners() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["partners"],
    queryFn: () => getPartners(header),
    enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function useFetchPartner(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["partner", reference],
    queryFn: () => getPartner(reference, header),
    enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function useCreatePartner() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createPartner(data, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}


