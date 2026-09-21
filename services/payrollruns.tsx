"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { PayrollItem } from "./payrollitems";
import { FinancialMonth } from "./financialmonths";
import { Division } from "./divisions";
import { PaymentAccount } from "./paymentaccounts";

export interface PayrollRun {
    id: string;
    reference: string;
    code: string;
    title: string;
    payroll_date: string;
    financial_month: string | null;
    financial_month_details?: FinancialMonth;
    division: string | null;
    division_details?: Division;
    payment_account: string | null;
    payment_account_details?: PaymentAccount;
    total_basic: number;
    total_allowances: number;
    total_gross: number;
    total_paye: number;
    total_nssf: number;
    total_shif: number;
    total_housing_levy: number;
    total_net_pay: number;
    status: "DRAFT" | "APPROVED" | "POSTED" | "PAID" | "CANCELLED";
    notes: string | null;
    is_posted: boolean;
    posted_at: string | null;
    posted_by: string | null;
    journal: string | null;
    items?: PayrollItem[];
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePayrollRunPayload {
    title: string;
    payroll_date: string;
    financial_month?: string;
    division?: string;
    payment_account?: string;
    notes?: string;
}

export const fetchPayrollRuns = async (
    headers: { headers: { Authorization: string } },
    params: { status?: string; month?: string; page?: number } = {}
): Promise<PaginatedResponse<PayrollRun>> => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.month) query.append("month", params.month);
    if (params.page) query.append("page", params.page.toString());

    const response: AxiosResponse<PaginatedResponse<PayrollRun>> = await apiActions.get(
        `/api/v1/payrollruns/${query.toString() ? `?${query.toString()}` : ""}`,
        headers
    );
    return response.data;
};

export const fetchPayrollRunByReference = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<PayrollRun> => {
    const response: AxiosResponse<PayrollRun> = await apiActions.get(
        `/api/v1/payrollruns/${reference}/`,
        headers
    );
    return response.data;
};

export const createPayrollRun = async (
    data: CreatePayrollRunPayload,
    headers: { headers: { Authorization: string } }
): Promise<PayrollRun> => {
    const response: AxiosResponse<PayrollRun> = await apiActions.post(
        `/api/v1/payrollruns/`,
        data,
        headers
    );
    return response.data;
};

export const postPayrollRunToGL = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string; journal_code: string; payroll_run: PayrollRun }> => {
    const response: AxiosResponse<{ message: string; journal_code: string; payroll_run: PayrollRun }> = await apiActions.post(
        `/api/v1/payrollruns/${reference}/post-gl/`,
        {},
        headers
    );
    return response.data;
};
