"use client";

import { Journal } from "./journals";
import { FinancialMonth } from "./financialmonths";
import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

interface FinancialYear {
  code: string;
  estimated_profit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  reference: string;
  journals: Journal[];
  months: FinancialMonth[];
}

export const getFinancialYears = async (headers: {
  headers: { Authorization: string };
}): Promise<FinancialYear[]> => {
  const response: AxiosResponse<any> =
    await apiActions.get(`/api/v1/financialyears/`, headers);
  const d = response?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

export const getFinancialYear = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<FinancialYear> => {
  const response: AxiosResponse<FinancialYear> = await apiActions.get(
    `/api/v1/financialyears/${reference}/`,
    headers
  );
  return response.data;
};
export const createFinancialYear = async (
  values: any,
  headers: { headers: { Authorization: string } }
): Promise<FinancialYear> => {
  const response: AxiosResponse<FinancialYear> = await apiActions.post(
    `/api/v1/financialyears/`,
    values,
    headers
  );
  return response.data;
};
