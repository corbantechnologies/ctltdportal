"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { FinancialMonth } from "./financialmonths";
import { Division } from "./divisions";
import { PaymentAccount } from "./paymentaccounts";
import { Book } from "./books";

export interface StaffClaim {
    id: string;
    reference: string;
    code: string;
    employee: string;
    employee_name?: string;
    employee_email?: string;
    title: string;
    date: string;
    amount: number;
    expense_book: string | null;
    expense_book_details?: Book;
    receipt_proof: string | null;
    description: string | null;
    financial_month: string | null;
    financial_month_details?: FinancialMonth;
    division: string | null;
    division_details?: Division;
    payment_account: string | null;
    payment_account_details?: PaymentAccount;
    status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "DISBURSED" | "CANCELLED";
    approved_by: string | null;
    approved_by_name?: string;
    approved_at: string | null;
    rejection_reason: string | null;
    is_posted: boolean;
    posted_at: string | null;
    posted_by: string | null;
    journal: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateStaffClaimPayload {
    employee?: string;
    title: string;
    date: string;
    amount: number;
    expense_book?: string;
    description?: string;
    financial_month?: string;
    division?: string;
    payment_account?: string;
    receipt_proof?: File | string | null;
}

export const fetchStaffClaims = async (
    headers: { headers: { Authorization: string } },
    params: { status?: string; month?: string; page?: number } = {}
): Promise<PaginatedResponse<StaffClaim>> => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.month) query.append("month", params.month);
    if (params.page) query.append("page", params.page.toString());

    const response: AxiosResponse<PaginatedResponse<StaffClaim>> = await apiActions.get(
        `/api/v1/staffclaims/${query.toString() ? `?${query.toString()}` : ""}`,
        headers
    );
    return response.data;
};

export const fetchStaffClaimByReference = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<StaffClaim> => {
    const response: AxiosResponse<StaffClaim> = await apiActions.get(
        `/api/v1/staffclaims/${reference}/`,
        headers
    );
    return response.data;
};

export const createStaffClaim = async (
    data: CreateStaffClaimPayload,
    headers: { headers: { Authorization: string } }
): Promise<StaffClaim> => {
    const response: AxiosResponse<StaffClaim> = await apiActions.post(
        `/api/v1/staffclaims/`,
        data,
        headers
    );
    return response.data;
};

export const updateStaffClaim = async (
    reference: string,
    data: Partial<CreateStaffClaimPayload>,
    headers: { headers: { Authorization: string } }
): Promise<StaffClaim> => {
    const response: AxiosResponse<StaffClaim> = await apiActions.put(
        `/api/v1/staffclaims/${reference}/`,
        data,
        headers
    );
    return response.data;
};

export const approveStaffClaim = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string; claim: StaffClaim }> => {
    const response: AxiosResponse<{ message: string; claim: StaffClaim }> = await apiActions.post(
        `/api/v1/staffclaims/${reference}/approve/`,
        {},
        headers
    );
    return response.data;
};

export const rejectStaffClaim = async (
    reference: string,
    reason: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string; claim: StaffClaim }> => {
    const response: AxiosResponse<{ message: string; claim: StaffClaim }> = await apiActions.post(
        `/api/v1/staffclaims/${reference}/reject/`,
        { reason },
        headers
    );
    return response.data;
};

export const disburseStaffClaim = async (
    reference: string,
    paymentAccountRef?: string,
    headers?: { headers: { Authorization: string } }
): Promise<{ message: string; journal_code: string; claim: StaffClaim }> => {
    const response: AxiosResponse<{ message: string; journal_code: string; claim: StaffClaim }> = await apiActions.post(
        `/api/v1/staffclaims/${reference}/disburse/`,
        paymentAccountRef ? { payment_account: paymentAccountRef } : {},
        headers
    );
    return response.data;
};
