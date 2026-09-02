"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface PaymentAccount {
    id: string;
    reference: string;
    name: string;
    bank_name: string;
    branch: string;
    account_number: string;
    swift_code: string;
    // MPESA
    paybill: string;
    account: string;
    instructions: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const getPaymentAccounts = async (headers: { headers: { Authorization: string } }): Promise<PaymentAccount[]> => {
    const response: AxiosResponse<PaginatedResponse<PaymentAccount>> =
        await apiActions.get(`/api/v1/paymentaccounts/`, headers);
    return response.data.results || [];
};

export const getPaymentAccount = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<PaymentAccount> => {
    const response: AxiosResponse<PaymentAccount> = await apiActions.get(
        `/api/v1/paymentaccounts/${reference}/`,
        headers
    );
    return response.data;
};
