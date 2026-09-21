"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
    fetchVendorBills,
    fetchVendorBillByReference,
    fetchVendorBillPayments,
} from "@/services/vendorbills";

export function useFetchVendorBills(params: { status?: string; partner?: string; month?: string; page?: number } = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["vendorbills", params],
        queryFn: () => fetchVendorBills(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchVendorBill(reference: string) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["vendorbill", reference],
        queryFn: () => fetchVendorBillByReference(reference, header),
        enabled: !!reference && !!header.headers.Authorization,
    });
}

export function useFetchVendorBillPayments(billReference?: string) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["vendorbillpayments", billReference],
        queryFn: () => fetchVendorBillPayments(header, billReference),
        enabled: !!header.headers.Authorization,
    });
}
