"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getQuotationLines, getQuotationLine } from "@/services/quotationlines";

export function useFetchQuotationLines() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["quotationlines"],
        queryFn: () => getQuotationLines(header),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchQuotationLine(reference: string) {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["quotationline", reference],
        queryFn: () => getQuotationLine(reference, header),
        enabled: !!reference && !!header.headers.Authorization,
    });
}
