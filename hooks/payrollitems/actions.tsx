"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
    fetchPayrollItems,
    fetchPayrollItemByReference,
} from "@/services/payrollitems";

export function useFetchPayrollItems(params: { payroll_run?: string; employee?: string } = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["payrollitems", params],
        queryFn: () => fetchPayrollItems(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchPayrollItem(reference: string) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["payrollitem", reference],
        queryFn: () => fetchPayrollItemByReference(reference, header),
        enabled: !!reference && !!header.headers.Authorization,
    });
}
