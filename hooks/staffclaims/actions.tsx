"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
    fetchStaffClaims,
    fetchStaffClaimByReference,
} from "@/services/staffclaims";

export function useFetchStaffClaims(params: { status?: string; month?: string; page?: number } = {}) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["staffclaims", params],
        queryFn: () => fetchStaffClaims(header, params),
        enabled: !!header.headers.Authorization,
    });
}

export function useFetchStaffClaim(reference: string) {
    const header = useAxiosAuth();
    return useQuery({
        queryKey: ["staffclaim", reference],
        queryFn: () => fetchStaffClaimByReference(reference, header),
        enabled: !!reference && !!header.headers.Authorization,
    });
}
