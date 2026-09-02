"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface SimpleTransaction {
  id: string;
  code: string;
  created_by: string;
  ledger_book: string;
  payment_method: string;
  division: string;
  journal_type: string;
  partner: string | null;
  journal: string | null;
  name: string;
  transaction_type: "MONEY_IN" | "MONEY_OUT";
  amount: string;
  date: string;
  source_document: string | null;
  document_number: string | null;
  document_file: string | null;
  reference: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSimpleTransaction {
  name: string;
  transaction_type: "MONEY_IN" | "MONEY_OUT";
  ledger_book: string;      // book name
  payment_method: string;   // payment method name
  division: string;         // division name
  journal_type: string;     // journal type name
  partner?: string | null;  // partner name (optional)
  amount: number;
  date: string;
  source_document?: string | null;
  document_number?: string | null;
}

export interface BulkCreateResponse {
  message: string;
  count: number;
  results: SimpleTransaction[];
}

export interface BulkDeleteResponse {
  message: string;
  deleted_count: number;
  deleted_references: string[];
  skipped: Array<{ reference: string; reason: string }>;
}

export interface BulkJournalRetryResponse {
  message: string;
  total_processed: number;
  success_count: number;
  failed_count: number;
  errors: Array<{ reference: string; code: string; error: string }>;
}

export const createSimpleTransaction = async (
  data: CreateSimpleTransaction | FormData,
  headers: { headers: { Authorization: string } }
): Promise<SimpleTransaction> => {
  const response: AxiosResponse<SimpleTransaction> = await apiActions.post(
    `/api/v1/simpletransactions/`,
    data,
    headers
  );
  return response.data;
};

export const bulkCreateSimpleTransactions = async (
  items: CreateSimpleTransaction[],
  headers: { headers: { Authorization: string } }
): Promise<BulkCreateResponse> => {
  const response: AxiosResponse<BulkCreateResponse> = await apiActions.post(
    `/api/v1/simpletransactions/bulk/`,
    { transactions: items },
    headers
  );
  return response.data;
};

export const bulkDeleteSimpleTransactions = async (
  references: string[],
  headers: { headers: { Authorization: string } }
): Promise<BulkDeleteResponse> => {
  const response: AxiosResponse<BulkDeleteResponse> = await apiActions.post(
    `/api/v1/simpletransactions/bulk-delete/`,
    { references },
    headers
  );
  return response.data;
};

export const bulkJournalRetrySimpleTransactions = async (
  references: string[],
  headers: { headers: { Authorization: string } }
): Promise<BulkJournalRetryResponse> => {
  const response: AxiosResponse<BulkJournalRetryResponse> = await apiActions.post(
    `/api/v1/simpletransactions/bulk-journal/`,
    { references },
    headers
  );
  return response.data;
};

export const getSimpleTransactions = async (
  headers: { headers: { Authorization: string } },
  filters?: Record<string, string>
): Promise<PaginatedResponse<SimpleTransaction>> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const response: AxiosResponse<PaginatedResponse<SimpleTransaction>> =
    await apiActions.get(`/api/v1/simpletransactions/${queryString}`, headers);
  return response.data;
};

export const getSimpleTransaction = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<SimpleTransaction> => {
  const response: AxiosResponse<SimpleTransaction> = await apiActions.get(
    `/api/v1/simpletransactions/${reference}/`,
    headers
  );
  return response.data;
};

