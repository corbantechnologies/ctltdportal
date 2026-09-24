"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface SimpleTransaction {
  id: string;
  code: string;
  created_by: string;
  ledger_book: string;
  ledger_book_code?: string | null;
  ledger_book_name?: string | null;
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
  is_reversed?: boolean;
  reversed_at?: string | null;
  reversed_by?: string | null;
  reversal_transaction_reference?: string | null;
  reversal_transaction_code?: string | null;
  reversal_reason?: string | null;
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
  items: CreateSimpleTransaction[] | FormData,
  headers: { headers: { Authorization: string; [key: string]: any } }
): Promise<BulkCreateResponse> => {
  const isFormData = typeof FormData !== "undefined" && items instanceof FormData;
  const config = isFormData
    ? {
        headers: {
          ...headers.headers,
          "Content-Type": "multipart/form-data",
        },
      }
    : headers;

  const payload = isFormData ? items : { transactions: items };

  const response: AxiosResponse<BulkCreateResponse> = await apiActions.post(
    `/api/v1/simpletransactions/bulk/`,
    payload,
    config
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

export interface ReverseSimpleTransactionData {
  reversal_date?: string;
  reason: string;
}

export const reverseSimpleTransaction = async (
  reference: string,
  data: ReverseSimpleTransactionData,
  headers: { headers: { Authorization: string } }
): Promise<{
  message: string;
  original_reference: string;
  reversal_reference: string;
  reversal_code: string;
  reversal_date: string;
}> => {
  const response = await apiActions.post(
    `/api/v1/simpletransactions/${reference}/reverse/`,
    data,
    headers
  );
  return response.data;
};


