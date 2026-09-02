"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

interface PartnerType {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reference: string;
}

interface createPartnerType {
  name: string;
  description: string;
  is_active: boolean; //defaults to true
}

interface updatePartnerType {
  description?: string;
  is_active?: boolean;
}

// finance responsibilities

export const createPartnerType = async (
  data: createPartnerType,
  headers: { headers: { Authorization: string } }
): Promise<PartnerType> => {
  const response: AxiosResponse<PartnerType> = await apiActions.post(
    `/api/v1/partnertypes/`,
    data,
    headers
  );
  return response.data;
};

export const updatePartnerType = async (
  reference: string,
  data: updatePartnerType,
  headers: { headers: { Authorization: string } }
): Promise<PartnerType> => {
  const response: AxiosResponse<PartnerType> = await apiActions.patch(
    `/api/v1/partnertypes/${reference}/`,
    data,
    headers
  );
  return response.data;
};

export const deletePartnerType = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<PartnerType> => {
  const response: AxiosResponse<PartnerType> = await apiActions.delete(
    `/api/v1/partnertypes/${reference}/`,
    headers
  );
  return response.data;
};

// All can read

export const getPartnerTypes = async (headers: {
  headers: { Authorization: string };
}): Promise<PartnerType[]> => {
  const response: AxiosResponse<PaginatedResponse<PartnerType>> =
    await apiActions.get(`/api/v1/partnertypes/`, headers);
  return response.data.results || [];
};

export const getPartnerType = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<PartnerType> => {
  const response: AxiosResponse<PartnerType> = await apiActions.get(
    `/api/v1/partnertypes/${reference}/`,
    headers
  );
  return response.data;
};
