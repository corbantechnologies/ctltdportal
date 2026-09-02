"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInteractions, createInteraction, CreateInteraction } from "@/services/crm";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { toast } from "react-hot-toast";

export const useFetchInteractions = (params: { lead?: string; partner?: string }) => {
    const headers = useAxiosAuth();
    return useQuery({
        queryKey: ["interactions", params],
        queryFn: () => getInteractions(params, headers),
        enabled: !!headers.headers.Authorization && headers.headers.Authorization !== "Token undefined" && (!!params.lead || !!params.partner),
    });
};

export const useCreateInteraction = () => {
    const headers = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInteraction) => createInteraction(data, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interactions"] });
            toast.success("Activity logged successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to log activity";
            toast.error(message);
        },
    });
};
