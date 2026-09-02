"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getPNL, getBalanceSheet, getTrialBalance, getRevenue, getCashBalance, getGLStatement } from "@/services/reports";

export function useFetchPNL(params: Record<string, string> = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["pnl", params],
        queryFn: () => getPNL(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchBalanceSheet(params: Record<string, string> = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["balance-sheet", params],
        queryFn: () => getBalanceSheet(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchTrialBalance(params: Record<string, string> = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["trial-balance", params],
        queryFn: () => getTrialBalance(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchRevenue(params: Record<string, string> = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["revenue", params],
        queryFn: () => getRevenue(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchCashBalance(params: Record<string, string> = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["cash-balance", params],
        queryFn: () => getCashBalance(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchGLStatement(
    bookReference: string,
    params: { start_date?: string; end_date?: string; division?: string } = {}
) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["gl-statement", bookReference, params],
        queryFn: () => getGLStatement(bookReference, params, header),
        enabled: !!bookReference && !!header.headers.Authorization,
    });
}
