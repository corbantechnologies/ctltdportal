"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

interface JournalType {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reference: string;
  created_by: string;
}

interface createJournalType {
  name: string;
  description: string;
  is_active: boolean;
}

interface updateJournalType {
  description?: string;
  is_active?: boolean;
}

// finance responsibilities

export const createJournalType = async (
  data: createJournalType,
  headers: { headers: { Authorization: string } }
): Promise<JournalType> => {
  const response: AxiosResponse<JournalType> = await apiActions.post(
    `/api/v1/journaltypes/`,
    data,
    headers
  );
  return response.data;
};

export const updateJournalType = async (
  reference: string,
  data: updateJournalType,
  headers: { headers: { Authorization: string } }
): Promise<JournalType> => {
  const response: AxiosResponse<JournalType> = await apiActions.patch(
    `/api/v1/journaltypes/${reference}/`,
    data,
    headers
  );
  return response.data;
};

export const deleteJournalType = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<JournalType> => {
  const response: AxiosResponse<JournalType> = await apiActions.delete(
    `/api/v1/journaltypes/${reference}/`,
    headers
  );
  return response.data;
};

// All can read

export const getJournalTypes = async (headers: {
  headers: { Authorization: string };
}): Promise<JournalType[]> => {
  const response: AxiosResponse<PaginatedResponse<JournalType>> =
    await apiActions.get(`/api/v1/journaltypes/`, headers);
  return response.data.results || [];
};

export const getJournalType = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<JournalType> => {
  const response: AxiosResponse<JournalType> = await apiActions.get(
    `/api/v1/journaltypes/${reference}/`,
    headers
  );
  return response.data;
};
