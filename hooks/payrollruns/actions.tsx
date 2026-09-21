"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
    fetchPayrollRuns,
    fetchPayrollRunByReference,
} from "@/services/payrollruns";

export function useFetchPayrollRuns(params: { status?: string; month?: string; page?: number } = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["payrollruns", params],
        queryFn: () => fetchPayrollRuns(header, params),
        enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useFetchPayrollRun(reference: string) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["payrollrun", reference],
        queryFn: () => fetchPayrollRunByReference(reference, header),
        enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

