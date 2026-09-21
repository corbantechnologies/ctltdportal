"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface PaymentMethod {
  id: string;
  name: string;
  book: string;
  is_active: boolean;
  reference: string;
  created_at: string;
  updated_at: string;
}

export const getPaymentMethods = async (headers: {
  headers: { Authorization: string };
}): Promise<PaymentMethod[]> => {
  const response: AxiosResponse<any> =
    await apiActions.get(`/api/v1/paymentmethods/`, headers);
  const d = response?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

export const getPaymentMethod = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<PaymentMethod> => {
  const response: AxiosResponse<PaymentMethod> = await apiActions.get(
    `/api/v1/paymentmethods/${reference}/`,
    headers
  );
  return response.data;
};
