"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getLeads, getLead, convertLeadToPartner } from "@/services/leads";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useFetchLeads() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["leads"],
        queryFn: () => getLeads(header),
        enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useFetchLead(reference: string) {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["lead", reference],
        queryFn: () => getLead(reference, header),
        enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useConvertLead(reference: string, rolePrefix: string) {
    const header = useAxiosAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (partnerType: string) => convertLeadToPartner(reference, partnerType, header),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["lead", reference] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast.success("Lead successfully converted to Partner");
            router.push(`/${rolePrefix}/partners/${data.partner_reference}`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Conversion failed";
            toast.error(message);
        },
    });
}
