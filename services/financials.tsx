"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface Invoice {
    id: string;
    reference: string;
    code: string;
    partner: string;
    created_by: string;
    updated_by: string;
    date: string;
    due_date: string;
    status: "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
    notes: string;
    public_token: string;
    created_at: string;
    updated_at: string;
    payment_account?: string;
    terms_and_conditions?: string;
    lines?: any[];
}

export interface Receipt {
    id: string;
    reference: string;
    invoice: string;
    code: string;
    date: string;
    amount: number;
    kra_sales_receipt?: string;
    notes?: string;
    is_posted: boolean;
    email_sent: boolean;
    created_at: string;
    updated_at: string;
}

export const getInvoices = async (headers: {
    headers: { Authorization: string };
}): Promise<Invoice[]> => {
    const response: AxiosResponse<PaginatedResponse<Invoice>> =
        await apiActions.get(`/api/v1/invoices/`, headers);
    return response.data.results || [];
};

export const getInvoice = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<Invoice> => {
    const response: AxiosResponse<Invoice> = await apiActions.get(
        `/api/v1/invoices/${reference}/`,
        headers
    );
    return response.data;
};

export const markInvoiceAsPaid = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string; receipt_reference: string; receipt_code: string }> => {
    const response: AxiosResponse<{ message: string; receipt_reference: string; receipt_code: string }> = await apiActions.patch(
        `/api/v1/invoices/${reference}/pay/`,
        {},
        headers
    );
    return response.data;
};

export const getReceipts = async (headers: {
    headers: { Authorization: string };
}): Promise<Receipt[]> => {
    const response: AxiosResponse<PaginatedResponse<Receipt>> =
        await apiActions.get(`/api/v1/receipts/`, headers);
    return response.data.results || [];
};

export const getReceipt = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<Receipt> => {
    const response: AxiosResponse<Receipt> = await apiActions.get(
        `/api/v1/receipts/${reference}/`,
        headers
    );
    return response.data;
};

export const markReceiptAsPosted = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await apiActions.patch(
        `/api/v1/receipts/${reference}/posted/`,
        {},
        headers
    );
    return response.data;
};

export const createInvoice = async (
    data: any,
    headers: { headers: { Authorization: string } }
): Promise<Invoice> => {
    const response: AxiosResponse<Invoice> = await apiActions.post(
        `/api/v1/invoices/`,
        data,
        headers
    );
    return response.data;
};

export const createReceipt = async (
    data: any,
    headers: { headers: { Authorization: string } }
): Promise<Receipt> => {
    const response: AxiosResponse<Receipt> = await apiActions.post(
        `/api/v1/receipts/`,
        data,
        headers
    );
    return response.data;
};
