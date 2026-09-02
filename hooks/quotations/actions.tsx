"use client"

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
    getQuotations,
    getQuotation
} from "@/services/quotations";

export function useFetchQuotations() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["quotations"],
        queryFn: () => getQuotations(header),
        enabled: !!header.headers.Authorization
    });
}

export function useFetchQuotation(reference: string) {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["quotation", reference],
        queryFn: () => getQuotation(reference, header),
        enabled: !!reference && !!header.headers.Authorization
    });
}
