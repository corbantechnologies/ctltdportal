"use client";

import { useQuery } from "@tanstack/react-query";
import { getTermsAndConditions, getTermsAndCondition } from "@/services/termsandconditions";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchTermsAndConditions() {
    const headers = useAxiosAuth();
    return useQuery({
        queryKey: ["termsandconditions"],
        queryFn: () => getTermsAndConditions(headers),
        enabled: !!headers
    });
}

export function useFetchTermsAndCondition(reference: string) {
    const headers = useAxiosAuth();
    return useQuery({
        queryKey: ["termsandcondition", reference],
        queryFn: () => getTermsAndCondition(reference, headers),
        enabled: !!reference && !!headers
    });
}
