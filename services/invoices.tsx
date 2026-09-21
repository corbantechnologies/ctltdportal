/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface InvoiceLineItem {
  id?: string;
  reference?: string;
  product?: string;
  product_name?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface InvoiceReceiptItem {
  id: string;
  reference: string;
  code: string;
  date: string;
  amount: number;
  payment_method?: string;
  payment_method_name?: string;
  journal_reference?: string;
  kra_sales_receipt?: string;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  reference: string;
  code: string;
  partner?: string | null;
  partner_name?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  created_by: string;
  updated_by?: string;
  posted_by?: string;
  date: string;
  due_date: string;
  status: "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  is_posted: boolean;
  posted_at?: string;
  journal_reference?: string;
  notes?: string;
  public_token: string;
  created_at: string;
  updated_at: string;
  payment_account?: string;
  terms_and_conditions?: string;
  total_amount: string | number;
  amount_paid: string | number;
  balance_due: string | number;
  lines?: InvoiceLineItem[];
  receipts?: InvoiceReceiptItem[];
}

export interface CreateInvoiceData {
  partner?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  date: string;
  due_date: string;
  notes?: string;
  payment_account?: string;
  terms_and_conditions?: string;
}

export interface CreateInvoiceLineData {
  invoice: string;
  product?: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface RecordReceiptData {
  invoice: string;
  date: string;
  amount: number;
  payment_method?: string;
  kra_sales_receipt?: string;
  notes?: string;
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

export const createInvoice = async (
  data: CreateInvoiceData,
  headers: { headers: { Authorization: string } }
): Promise<Invoice> => {
  const response: AxiosResponse<Invoice> = await apiActions.post(
    `/api/v1/invoices/`,
    data,
    headers
  );
  return response.data;
};

export const updateInvoice = async (
  reference: string,
  data: Partial<CreateInvoiceData> & { status?: string },
  headers: { headers: { Authorization: string } }
): Promise<Invoice> => {
  const response: AxiosResponse<Invoice> = await apiActions.patch(
    `/api/v1/invoices/${reference}/`,
    data,
    headers
  );
  return response.data;
};

export const deleteInvoice = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<void> => {
  await apiActions.delete(`/api/v1/invoices/${reference}/`, headers);
};

export const postInvoiceToGL = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<{ message: string; journal_reference: string; journal_code: string; status: string }> => {
  const response: AxiosResponse<{ message: string; journal_reference: string; journal_code: string; status: string }> =
    await apiActions.post(`/api/v1/invoices/${reference}/post-gl/`, {}, headers);
  return response.data;
};

export const payInvoice = async (
  reference: string,
  headers: { headers: { Authorization: string } },
  payload: { notes?: string; kra_sales_receipt?: string } = {}
): Promise<Invoice> => {
  const response: AxiosResponse<Invoice> = await apiActions.post(
    `/api/v1/invoices/${reference}/pay/`,
    payload,
    headers
  );
  return response.data;
};

export const recordInvoiceReceipt = async (
  data: RecordReceiptData,
  headers: { headers: { Authorization: string } }
): Promise<InvoiceReceiptItem> => {
  const response: AxiosResponse<InvoiceReceiptItem> = await apiActions.post(
    `/api/v1/receipts/`,
    data,
    headers
  );
  return response.data;
};

export const downloadInvoicePDF = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Blob> => {
  const response = await apiActions.get(`/api/v1/invoices/${reference}/download/`, {
    ...headers,
    responseType: "blob",
  });
  return response.data;
};

export const createInvoiceLine = async (
  data: CreateInvoiceLineData,
  headers: { headers: { Authorization: string } }
): Promise<InvoiceLineItem> => {
  const response: AxiosResponse<InvoiceLineItem> = await apiActions.post(
    `/api/v1/invoicelines/`,
    data,
    headers
  );
  return response.data;
};

export const deleteInvoiceLine = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<void> => {
  await apiActions.delete(`/api/v1/invoicelines/${reference}/`, headers);
};

