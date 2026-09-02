"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { JournalEntry } from "./journalentries";

interface Journal {
  code: string;
  financial_year: string;
  journal_type: string;
  date: string;
  description: string;
  currency: string;
  is_posted: boolean;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  reference: string;
  journal_entries: JournalEntry[];
  source_transaction?: {
    reference: string;
    code: string;
    document_url: string | null;
    document_number: string | null;
    source_document: string | null;
  } | null;
}

export type { Journal };

interface createJournal {
  financial_year?: string;
  journal_type: string;
  date: string;
  description: string;
  currency: string;
}

interface updateJournal {
  journal_type?: string;
  date?: string;
  description?: string;
  currency?: string;
}

// finance responsibilities

export const createJournal = async (
  data: createJournal,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.post(
    `/api/v1/journals/`,
    data,
    headers
  );
  return response.data;
};

export const updateJournal = async (
  reference: string,
  data: updateJournal,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.patch(
    `/api/v1/journals/${reference}/`,
    data,
    headers
  );
  return response.data;
};

// to be used to close/post a journal only after all entries are created
export const postJournal = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.post(
    `/api/v1/journals/${reference}/post/`,
    {},
    headers
  );
  return response.data;
};

// All can read

export const getJournals = async (headers: {
  headers: { Authorization: string };
}): Promise<Journal[]> => {
  const response: AxiosResponse<PaginatedResponse<Journal>> =
    await apiActions.get(`/api/v1/journals/`, headers);
  return response.data.results || [];
};

export const getJournal = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.get(
    `/api/v1/journals/${reference}/`,
    headers
  );
  return response.data;
};
