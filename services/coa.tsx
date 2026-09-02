"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { Book } from "./books";

interface COA {
  code: string;
  name: string;
  normal_balance: string;
  order: number;
  report_role: string;
  is_active: boolean;
  reference: string;
  created_at: string;
  updated_at: string;
  books: Book[];
}

interface createCOA {
  code: string;
  name: string;
  normal_balance: string; //Normal balance for the chart of account. Side where balances normally increase: DEBIT or CREDIT
  order: number; // Sort order in financial statements (e.g., Assets=10, Liabilities=20, Equity=30, Revenue=40, Expenses=50)
  report_role: string;
  is_active: boolean; //defaults true
}

interface updateCOA {
  name?: string;
  report_role?: string;
  normal_balance?: string;
  order?: number;
  is_active?: boolean;
}

// finance responsibilities

export const createCOA = async (
  data: createCOA,
  headers: { headers: { Authorization: string } }
): Promise<COA> => {
  const response: AxiosResponse<COA> = await apiActions.post(
    `/api/v1/coa/`,
    data,
    headers
  );
  return response.data;
};

export const updateCOA = async (
  reference: string,
  data: updateCOA,
  headers: { headers: { Authorization: string } }
): Promise<COA> => {
  const response: AxiosResponse<COA> = await apiActions.patch(
    `/api/v1/coa/${reference}/`,
    data,
    headers
  );
  return response.data;
};

export const deleteCOA = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<COA> => {
  const response: AxiosResponse<COA> = await apiActions.delete(
    `/api/v1/coa/${reference}/`,
    headers
  );
  return response.data;
};

// All can read

export const getCOAs = async (headers: {
  headers: { Authorization: string };
}): Promise<COA[]> => {
  const response: AxiosResponse<PaginatedResponse<COA>> = await apiActions.get(
    `/api/v1/coa/`,
    headers
  );
  return response.data.results || [];
};

export const getCOA = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<COA> => {
  const response: AxiosResponse<COA> = await apiActions.get(
    `/api/v1/coa/${reference}/`,
    headers
  );
  return response.data;
};
