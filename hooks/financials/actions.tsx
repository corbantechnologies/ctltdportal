"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { 
    getInvoices, 
    getInvoice, 
    markInvoiceAsPaid, 
    getReceipts, 
    getReceipt, 
    markReceiptAsPosted,
    createInvoice,
    createReceipt
} from "@/services/financials";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useFetchInvoices() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["invoices"],
        queryFn: () => getInvoices(header),
        enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useFetchInvoice(reference: string) {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["invoice", reference],
        queryFn: () => getInvoice(reference, header),
        enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useMarkInvoiceAsPaid() {
    const header = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reference: string) => markInvoiceAsPaid(reference, header),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoice"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            toast.success("Invoice marked as paid. Receipt generated.");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to mark invoice as paid";
            toast.error(message);
        },
    });
}

export function useFetchReceipts() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["receipts"],
        queryFn: () => getReceipts(header),
        enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useFetchReceipt(reference: string) {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["receipt", reference],
        queryFn: () => getReceipt(reference, header),
        enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useMarkReceiptAsPosted() {
    const header = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reference: string) => markReceiptAsPosted(reference, header),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipt"] });
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            toast.success("Receipt marked as posted to ledger.");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to mark receipt as posted";
            toast.error(message);
        },
    });
}

export function useCreateInvoice(rolePrefix: string) {
    const header = useAxiosAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: any) => createInvoice(data, header),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice created successfully");
            router.push(`/${rolePrefix}/invoices/${data.reference}`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to create invoice";
            toast.error(message);
        },
    });
}

export function useCreateReceipt(rolePrefix: string) {
    const header = useAxiosAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: any) => createReceipt(data, header),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            toast.success("Receipt recorded successfully");
            router.push(`/${rolePrefix}/receipts/${data.reference}`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to record receipt";
            toast.error(message);
        },
    });
}
