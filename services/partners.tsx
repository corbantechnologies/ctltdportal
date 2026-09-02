"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { JournalEntry } from "./journalentries";
import { Quotation } from "./quotations";

export interface PartnerType {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  reference: string;
}

export interface Partner {
  code: string;
  name: string;
  phone: string;
  email: string;
  tax_pin: string;
  currency: string;
  wht_rate: number;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reference: string;
  partner_type: string;
  division: string;
  journal_entries: JournalEntry[];
  quotations: Quotation[];
}

interface createPartner {
  name: string;
  phone: string;
  email: string;
  tax_pin: string;
  currency: string; // defaults to KES
  wht_rate: number; // defaults to 0.00
  payment_terms: string; // nullable
  is_active: boolean; // defaults to true
  partner_type: string; // partner type name
  division: string; //required
}

interface updatePartner {
  name?: string;
  phone?: string;
  email?: string;
  tax_pin?: string;
  currency?: string;
  wht_rate?: number;
  payment_terms?: string;
  is_active?: boolean;
  partner_type?: string;
  division?: string;
}

// finance responsibilities

export const createPartner = async (
  data: createPartner,
  headers: { headers: { Authorization: string } }
): Promise<Partner> => {
  const response: AxiosResponse<Partner> = await apiActions.post(
    `/api/v1/partners/`,
    data,
    headers
  );
  return response.data;
};

export const updatePartner = async (
  reference: string,
  data: updatePartner,
  headers: { headers: { Authorization: string } }
): Promise<Partner> => {
  const response: AxiosResponse<Partner> = await apiActions.patch(
    `/api/v1/partners/${reference}/`,
    data,
    headers
  );
  return response.data;
};

export const deletePartner = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Partner> => {
  const response: AxiosResponse<Partner> = await apiActions.delete(
    `/api/v1/partners/${reference}/`,
    headers
  );
  return response.data;
};

// All can read

export const getPartners = async (headers: {
  headers: { Authorization: string };
}): Promise<Partner[]> => {
  const response: AxiosResponse<PaginatedResponse<Partner>> =
    await apiActions.get(`/api/v1/partners/`, headers);
  return response.data.results || [];
};

export const getPartner = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Partner> => {
  const response: AxiosResponse<Partner> = await apiActions.get(
    `/api/v1/partners/${reference}/`,
    headers
  );
  return response.data;
};

export const getPartnerTypes = async (headers: {
  headers: { Authorization: string };
}): Promise<PartnerType[]> => {
  const response: AxiosResponse<PaginatedResponse<PartnerType>> =
    await apiActions.get(`/api/v1/partnertypes/`, headers);
  return response.data.results || [];
};
