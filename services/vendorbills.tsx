"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { Partner } from "./partners";
import { Book } from "./books";
import { Division } from "./divisions";
import { FinancialMonth } from "./financialmonths";
import { PaymentAccount } from "./paymentaccounts";
import { PaymentMethod } from "./paymentmethods";

export interface VendorBill {
    id: string;
    reference: string;
    code: string;
    vendor_bill_number: string | null;
    partner: string | null;
    partner_details?: Partner;
    vendor?: string | null;
    vendor_details?: Partner;
    vendor_name: string | null;
    vendor_email: string | null;
    vendor_phone: string | null;
    date: string;
    bill_date?: string;
    due_date: string | null;
    financial_month: string | null;
    financial_month_details?: FinancialMonth;
    division: string | null;
    division_details?: Division;
    expense_book: string | null;
    expense_book_details?: Book;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    notes: string | null;
    description?: string | null;
    currency?: string;
    status: "DRAFT" | "SUBMITTED" | "APPROVED" | "POSTED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
    is_posted: boolean;
    posted_at: string | null;
    posted_by: string | null;
    journal: string | null;
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface VendorBillPayment {
    id: string;
    reference: string;
    code: string;
    bill: string;
    bill_details?: VendorBill;
    vendor_bill?: string;
    date: string;
    payment_date?: string;
    amount: number;
    payment_account: string | null;
    payment_account_details?: PaymentAccount;
    payment_method: string | null;
    payment_method_details?: PaymentMethod;
    payment_reference: string | null;
    reference_number?: string | null;
    notes: string | null;
    journal: string | null;
    created_by: string;
    created_at: string;
}

export interface CreateVendorBillPayload {
    vendor_bill_number?: string;
    partner?: string;
    vendor?: string;
    vendor_name?: string;
    vendor_email?: string;
    vendor_phone?: string;
    date?: string;
    bill_date?: string;
    due_date?: string;
    financial_month?: string;
    division?: string;
    expense_book?: string;
    subtotal?: number;
    tax_amount?: number;
    total_amount: number;
    notes?: string;
    description?: string;
}

export interface RecordVendorBillPaymentPayload {
    bill?: string;
    vendor_bill?: string;
    date?: string;
    payment_date?: string;
    amount: number;
    payment_account?: string;
    payment_method?: string;
    payment_reference?: string;
    reference_number?: string;
    notes?: string;
}

export const fetchVendorBills = async (
    headers: { headers: { Authorization: string } },
    params: { status?: string; partner?: string; month?: string; page?: number } = {}
): Promise<PaginatedResponse<VendorBill>> => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.partner) query.append("partner", params.partner);
    if (params.month) query.append("month", params.month);
    if (params.page) query.append("page", params.page.toString());

    const response: AxiosResponse<PaginatedResponse<VendorBill>> = await apiActions.get(
        `/api/v1/vendorbills/${query.toString() ? `?${query.toString()}` : ""}`,
        headers
    );
    return response.data;
};

export const fetchVendorBillByReference = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<VendorBill> => {
    const response: AxiosResponse<VendorBill> = await apiActions.get(
        `/api/v1/vendorbills/${reference}/`,
        headers
    );
    return response.data;
};

export const createVendorBill = async (
    data: CreateVendorBillPayload,
    headers: { headers: { Authorization: string } }
): Promise<VendorBill> => {
    const payload = {
        ...data,
        partner: data.partner || data.vendor,
        date: data.date || data.bill_date || new Date().toISOString().split("T")[0],
        subtotal: data.subtotal !== undefined ? data.subtotal : data.total_amount,
        notes: data.notes || data.description,
    };
    const response: AxiosResponse<VendorBill> = await apiActions.post(
        `/api/v1/vendorbills/`,
        payload,
        headers
    );
    return response.data;
};

export const updateVendorBill = async (
    reference: string,
    data: Partial<CreateVendorBillPayload>,
    headers: { headers: { Authorization: string } }
): Promise<VendorBill> => {
    const payload = {
        ...data,
        partner: data.partner || data.vendor,
        date: data.date || data.bill_date,
        subtotal: data.subtotal !== undefined ? data.subtotal : data.total_amount,
        notes: data.notes || data.description,
    };
    const response: AxiosResponse<VendorBill> = await apiActions.put(
        `/api/v1/vendorbills/${reference}/`,
        payload,
        headers
    );
    return response.data;
};

export const postVendorBillToGL = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string; journal_code: string; bill: VendorBill }> => {
    const response: AxiosResponse<{ message: string; journal_code: string; bill: VendorBill }> = await apiActions.post(
        `/api/v1/vendorbills/${reference}/post-gl/`,
        {},
        headers
    );
    return response.data;
};

export const fetchVendorBillPayments = async (
    headers: { headers: { Authorization: string } },
    billReference?: string
): Promise<PaginatedResponse<VendorBillPayment>> => {
    const query = new URLSearchParams();
    if (billReference) query.append("bill", billReference);

    const response: AxiosResponse<PaginatedResponse<VendorBillPayment>> = await apiActions.get(
        `/api/v1/vendorbillpayments/${query.toString() ? `?${query.toString()}` : ""}`,
        headers
    );
    return response.data;
};

export const recordVendorBillPayment = async (
    data: RecordVendorBillPaymentPayload,
    headers: { headers: { Authorization: string } }
): Promise<VendorBillPayment> => {
    const payload = {
        ...data,
        bill: data.bill || data.vendor_bill,
        date: data.date || data.payment_date || new Date().toISOString().split("T")[0],
        payment_reference: data.payment_reference || data.reference_number,
    };
    const response: AxiosResponse<VendorBillPayment> = await apiActions.post(
        `/api/v1/vendorbillpayments/`,
        payload,
        headers
    );
    return response.data;
};
