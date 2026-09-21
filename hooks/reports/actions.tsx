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

export function useFetchARAgingSchedule(params: { as_of_date?: string; division?: string; month?: string } = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["ar-aging", params],
        queryFn: () => import("@/services/reports").then(m => m.getARAgingSchedule(header, params)),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchCustomerStatementOfAccount(
    partnerReference: string,
    params: { start_date?: string; end_date?: string; month?: string } = {}
) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["customer-statement", partnerReference, params],
        queryFn: () => import("@/services/reports").then(m => m.getCustomerStatementOfAccount(partnerReference, params, header)),
        enabled: !!partnerReference && !!header.headers.Authorization,
    });
}

export function useFetchAccountDrillDown(params: {
    book_reference?: string;
    book_code?: string;
    start_date?: string;
    end_date?: string;
    division?: string;
}) {
    const header = useAxiosAuth();
    const canFetch = !!(params.book_reference || params.book_code) && !!header.headers.Authorization;
    return useQuery({
        queryKey: ["account-drilldown", params],
        queryFn: () => import("@/services/reports").then(m => m.getAccountDrillDown(params, header)),
        enabled: canFetch,
    });
}

