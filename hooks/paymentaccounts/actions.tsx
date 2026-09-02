"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentAccounts, getPaymentAccount } from "@/services/paymentaccounts";
import useAxiosAuth from "../authentication/useAxiosAuth";

export function useFetchPaymentAccounts() {
    const headers = useAxiosAuth();
    return useQuery({
        queryKey: ["paymentaccounts"],
        queryFn: () => getPaymentAccounts(headers),
        enabled: !!headers
    });
}

export function useFetchPaymentAccount(reference: string) {
    const headers = useAxiosAuth();
    return useQuery({
        queryKey: ["paymentaccount", reference],
        queryFn: () => getPaymentAccount(reference, headers),
        enabled: !!reference && !!headers
    });
}
