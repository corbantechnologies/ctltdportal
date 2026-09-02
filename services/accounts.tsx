/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";

export interface User {
  member_code: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  id_type: string;
  id_no: string;
  tax_pin: string;
  is_active: boolean;
  is_employee: boolean;
  is_director: boolean;
  is_finance: boolean;
  is_sales: boolean;
  is_purchasing: boolean;
  is_inventory: boolean;
  is_production: boolean;
  is_quality: boolean;
  is_maintenance: boolean;
  is_hr: boolean;
  is_operations: boolean;
  is_superuser: boolean;
  is_staff: boolean;
}

export interface createMember {
  email: string;
  first_name: string;
  last_name: string;
}

export interface activateAccount {
  uidb64: string; // picked from the urlparams
  token: string; // picked from the urlparams
  password: string;
  password_confirmation: string;
}

export interface forgotPassword {
  email: string;
}

export interface resetPassword {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export const getAccount = async (
  member_code: string,
  headers: { headers: { Authorization: string } }
): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.get(
    `/api/v1/auth/${member_code}/`,
    headers
  );
  return response.data;
};

export const forgotPassword = async (data: forgotPassword): Promise<any> => {
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/password/forgot/`,
    data
  );
  return response.data;
};

export const resetPassword = async (data: resetPassword): Promise<any> => {
  const response: AxiosResponse<any> = await apiActions.post(
    `/api/v1/auth/password/reset/`,
    data
  );
  return response.data;
};

// Member Accounts
export const createFinance = async (data: createMember): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.post(
    `/api/v1/auth/signup/finance/`,
    data,
  );
  return response.data;
};

export const createOperations = async (data: createMember): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.post(
    `/api/v1/auth/signup/operations/`,
    data,
  );
  return response.data;
};

export const createSales = async (data: createMember): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.post(
    `/api/v1/auth/signup/sales/`,
    data,
  );
  return response.data;
};

export const activateAccount = async (data: activateAccount): Promise<User> => {
  const response: AxiosResponse<User> = await apiActions.patch(
    `/api/v1/auth/password/activate-account/`,
    data,
  );
  return response.data;
};
